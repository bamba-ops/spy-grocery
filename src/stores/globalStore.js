import { defineStore } from 'pinia';
import { listingApi } from '../api/listingApi';
import { underConstructionApi } from '../api/underConstructionApi';
import { landingAPI } from '@/api/landingAPI';
import { ipInfoApi } from '@/api/ipInfoApi';
import { appApi } from '@/api/appApi';
import { supabase } from '@/api/supabase';

export const useGlobalStore = defineStore('globalStore', {
    state: () => ({
        task: null,
        tasks_test: [],
        realtimeSubscription: null,
        // Données produits
        prices: [],
        totalCount: 0,
        currentOffset: 0,
        limit: 30,
        user_limit: {
            ip_info: null,
            limit: 10,            // Limite par défaut pour les visiteurs
            is_limit_over: false,
            is_registered: false,  // Bonus non encore attribué pour les non-inscrits
            is_prenium: false,
            user_id: null,
        },

        // État du produit sélectionné
        targetProduct: null,
        bestMatch: [],

        // État de recherche
        searchQuery: '',
        searchResults: [],
        totalFound: 0,

        // État newsletter
        newsletterStatus: {
            loading: false,
            message: '',
            messageType: '',
            subscribed: false
        },

        session: null,
    }),

    getters: {
        isEndOfResults: (state) => state.prices.length >= state.totalCount,
        hasResults: (state) => state.prices.length > 0,
        currentSearchQuery: (state) => state.searchQuery,
    },

    actions: {
        // Initialise la limite en priorisant le serveur
        async initUserLimit() {
            // 1. Charger le localStorage (pour conserver les infos d'IP déjà récupérées par exemple)
            const localLimit = localStorage.getItem('user-limit');
            if (localLimit) {
                this.user_limit = JSON.parse(localLimit);
            }

            // 2. Si aucune info IP n'est présente, la récupérer
            if (!this.user_limit.ip_info) {
                await this.getIpInfo();
            }

            // 3. Récupérer la version serveur avec l'IP donnée
            const serverLimit = await appApi.getByIpInfo(this.user_limit);
            if (serverLimit) {
                // On utilise toujours la version du serveur (source de vérité)
                this.user_limit = serverLimit;
            } else {
                // 4. Si aucune donnée n'existe sur le serveur, on en crée une nouvelle
                this.user_limit.limit = 10;
                this.user_limit.is_limit_over = false;
                await appApi.initUserLimit(this.user_limit);
                // On met à jour par la suite la version locale à partir du serveur
                const newServerLimit = await appApi.getByIpInfo(this.user_limit);
                if (newServerLimit) {
                    this.user_limit = newServerLimit;
                }
            }

            this.saveLocalLimit();
            // On peut vérifier l'état de la limite si nécessaire
            this.checkLimitStatus();
        },

        // Décrémente la limite en se basant sur l'update du serveur
        async consumeLimit() {
            if (this.user_limit.is_limit_over) return;

            try {
                // On souhaite décrémenter côté serveur en envoyant la version actuelle
                // Ici, on peut éventuellement ne pas décrémenter localement ; on attend la réponse serveur.
                const updated = await appApi.updateUserLimit({
                    ...this.user_limit,
                    // Laisser le serveur décrémenter et retourner la nouvelle valeur
                    limit: this.user_limit.limit - 1
                });

                // On remplace la version locale par celle du serveur
                if (updated) {
                    this.user_limit = updated;
                }
                this.saveLocalLimit();
            } catch (error) {
                // En cas d'erreur, on force une synchronisation avec le serveur
                const serverLimit = await appApi.getByIpInfo(this.user_limit);
                if (serverLimit) {
                    this.user_limit = serverLimit;
                    this.saveLocalLimit();
                }
                throw error;
            }
        },

        // Vérifie l'état de la limite et met à jour is_limit_over en fonction de la réponse serveur
        checkLimitStatus() {
            // Ici, la version de user_limit doit déjà être à jour depuis le serveur.
            if (this.user_limit.limit <= 0 && !this.user_limit.is_limit_over) {
                this.user_limit.is_limit_over = true;
                this.updateServerLimit()
                this.saveLocalLimit();
            }
        },

        // Sauvegarde locale
        saveLocalLimit() {
            localStorage.setItem('user-limit', JSON.stringify(this.user_limit));
        },

        // Met à jour le serveur et récupère la nouvelle version pour synchroniser le state local
        async updateServerLimit() {
            try {
                const updated = await appApi.updateUserLimit(this.user_limit);
                if (updated) {
                    this.user_limit = updated;
                    this.saveLocalLimit();
                }
            } catch (error) {
                console.error('Server update failed:', error);
            }
        },

        // Récupère les informations IP
        async getIpInfo() {
            this.user_limit.ip_info = await ipInfoApi.getipInfo();
        },

        async getAllTasksIsTest() {
            const reponse = await landingAPI.getAllTasksIsTest()
            if (reponse) {
                this.tasks_test = reponse
            }
        },

        setTargetProductAndBestMatch(target_product, best_match) {
            if (target_product && best_match) {
                this.targetProduct = target_product
                this.bestMatch = best_match
            }
        },

        // Charge la task sauvegardée dans sessionStorage au démarrage
        loadTask() {
            const savedTask = sessionStorage.getItem('task');
            if (savedTask) {
                this.task = JSON.parse(savedTask);
                // Si la task a un id, s'abonner dès le chargement
                if (this.task && this.task.id) {
                    this.subscribeToTaskUpdates(this.task.id);
                }
            }
        },

        // Met à jour la task dans le state, sauvegarde dans sessionStorage et subscribe
        setTask(task) {
            this.task = task;
            if (task) {
                sessionStorage.setItem('task', JSON.stringify(task));
                if (task.id) {
                    this.subscribeToTaskUpdates(task.id);
                }
            }
        },

        // Création d'une task via l'API et mise à jour via setTask
        async setTaskByProductId(product_id) {
            const task = await listingApi.setTaskByProductId(product_id);
            if (task) {
                this.setTask(task);
            } else {
                this.resetLimit()
            }
        },

        // Suppression de la task et désabonnement
        async removeTask() {
            this.task = null;
            sessionStorage.removeItem('task');
            await this.unsubscribeFromTaskUpdates();
        },

        async subscribeToTaskUpdates(taskId) {
            if (!taskId) {
                return;
            }
            // S'il existe déjà une souscription, la supprimer
            if (this.realtimeSubscription) {
                await this.unsubscribeFromTaskUpdates();
            }
            this.realtimeSubscription = supabase
                .channel(`task-updates-${taskId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'tasks',
                        filter: `id=eq.${taskId}`
                    },
                    (payload) => {
                        // Mise à jour de la task et sauvegarde
                        this.task = { ...payload.new };
                        sessionStorage.setItem('task', JSON.stringify(this.task));
                    }
                )
                .subscribe();

            if (this.realtimeSubscription) {
                listingApi.setTaskProcess(this.task)
            }
        },

        async unsubscribeFromTaskUpdates() {
            if (this.realtimeSubscription) {
                await supabase.removeChannel(this.realtimeSubscription);
                this.realtimeSubscription = null;
            }
        },

        initCheapest() {
            this.targetProduct = this.task?.target_product || []
            this.bestMatch = this.task?.best_match || []
        },

        async getBestPrice(product) {
            [this.targetProduct, this.bestMatch] = await listingApi.getBestPrice(product);
        },

        async getPricesByStoreId() {
            const { total_count, prices: _prices } = await listingApi.getPricesByStoreId(this.limit, this.currentOffset);
            this.currentOffset += this.limit;
            this.prices = this.currentOffset === this.limit ? _prices : [...this.prices, ..._prices];
            this.totalCount = total_count;
            return { total_count, _prices };
        },

        async searchPricesByStoreAndName(storeId, productName) {
            this.searchQuery = productName;
            const { total_count, prices: _prices } = await listingApi.searchPricesByStoreAndName(
                storeId,
                productName,
                this.limit,
                this.currentOffset
            );
            this.currentOffset += this.limit;
            this.prices = this.currentOffset === this.limit ? _prices : [...this.prices, ..._prices];
            this.totalCount = total_count;
            return { total_count, _prices };
        },

        resetPagination() {
            this.currentOffset = 0;
            this.prices = [];
            this.totalCount = 0;
        },

        async subscribeToNewsletter(email) {
            this.newsletterStatus.loading = true;
            this.newsletterStatus.message = '';
            this.newsletterStatus.messageType = '';

            try {
                const response = await underConstructionApi.subscribeToNewsletter(email);
                this.newsletterStatus.subscribed = true;
                this.newsletterStatus.messageType = 'success';
                return response;
            } catch (error) {
                this.newsletterStatus.messageType = 'error';
                throw error;
            } finally {
                this.newsletterStatus.loading = false;
            }
        },

        async initAuthListener() {
            // Récupérer la session actuelle avec la nouvelle API
            const { data: { session } } = await supabase.auth.getSession();
            this.session = session;
            if (session) {
                // On attribue le bonus d'inscription uniquement si is_registered est false
                await this.assignRegistrationBonus();
            }
            // Écouter les changements d'état d'authentification
            supabase.auth.onAuthStateChange((event, session) => {
                this.session = session;
                if (session) {
                    this.assignRegistrationBonus();
                }
            });
        },

        signOut() {
            // Déconnexion de l'utilisateur
            supabase.auth.signOut().then(() => {
                this.session = null;
            });
        },

        async assignRegistrationBonus() {
            // On vérifie que l'utilisateur est connecté et que le bonus n'a pas déjà été accordé
            if (this.session && !this.user_limit.is_registered) {
                this.user_limit.limit = this.user_limit.limit + 10
                this.user_limit.is_registered = true
                this.user_limit.is_limit_over = false
                this.user_limit.user_id = this.session.user.id
                // On appelle l'API pour mettre à jour la limite côté serveur.
                const updated = await appApi.updateUserLimit(this.user_limit);
                if (updated) {
                    this.user_limit = updated;
                    this.saveLocalLimit();
                }
            }
        },
    },

    watch: {
        user_limit: {
            handler(newLimit) {
                // À chaque modification du state, on sauvegarde dans le localStorage
                localStorage.setItem('user-limit', JSON.stringify(newLimit));
                // Vérification automatique du statut de la limite
                if (newLimit.limit <= 0 && !newLimit.is_limit_over) {
                    this.user_limit.is_limit_over = true;
                    this.updateServerLimit()
                }
            },
            deep: true
        }
    }
});