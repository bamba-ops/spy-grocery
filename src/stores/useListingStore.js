// stores/authStore.js
import { defineStore } from 'pinia'
import { PricesService } from '@/api/prices';
import { TasksService } from '@/api/tasks';
import { supabase } from '@/api/supabase';
import { useAuthStore } from './useAuthStore';

export const useListingStore = defineStore('listing', {
    state: () => ({
        isLimitReached: false,
        authStore: useAuthStore(),
        session: null,
        task: null,
        realtimeSubscription: null,
        searchTerm: '',
        product: null,
        isLoading: false,
        isError: false,
        prices: [],
        limit: 30,
        offset: 0,
        IMAGE_URL_ERROR: 'https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg',
        expirationTimeoutId: null,
    }),
    actions: {

        async subscribeToTaskUpdates(taskId) {
            if (!taskId) {
                return;
            }
            // S'il existe déjà une souscription, la supprimer
            if (this.realtimeSubscription) {
                await this.unsubscribeFromTaskUpdates();
            }

            // Création de la nouvelle souscription
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
                        this.setLocalStorageTask(this.task)
                    }
                )
                .subscribe();

            // Exécuter processTask UNE SEULE FOIS après la création de la souscription
            if (this.realtimeSubscription && this.task && !this.task.process_init) {
                await TasksService.processTask(this.task, this.product, this.session);
            }

            if (this.task.status === 'completed') {
                setTimeout(() => {
                    window.location.href = '/compare'
                }, 3000)
            }
        },

        async initLocalStorageTask() {
            const storedTask = sessionStorage.getItem("user-task");
            if (!storedTask) return;

            const task = JSON.parse(storedTask);

            // Vérifie si la tâche est expirée
            if (task.expiresAt && task.expiresAt < Date.now()) {
                this.clearExpiredTask();
                return;
            }

            this.task = task;
            console.log("hey")
            await this.subscribeToTaskUpdates(this.task.id);

            // Calcule le temps restant
            const remainingTime = task.expiresAt - Date.now();
            if (remainingTime > 0) {
                this.expirationTimeoutId = setTimeout(() => {
                    this.clearExpiredTask();
                }, remainingTime);
            }
        },

        async unsubscribeFromTaskUpdates() {
            if (this.realtimeSubscription) {
                await supabase.removeChannel(this.realtimeSubscription);
                this.realtimeSubscription = null;
                this.taskProcessed = false;
            }
        },

        async setLocalStorageTask(task) {
            const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes en millisecondes
            const taskWithExpiration = {
                ...task,
                expiresAt: Date.now() + FIVE_MINUTES
            };

            sessionStorage.setItem("user-task", JSON.stringify(taskWithExpiration));

            if (this.expirationTimeoutId) {
                clearTimeout(this.expirationTimeoutId);
            }

            this.expirationTimeoutId = setTimeout(() => {
                this.clearExpiredTask();
            }, FIVE_MINUTES);

            await this.subscribeToTaskUpdates(task.id);
        },

        async setTaskByProductId(product_id, product, session) {
            try {
                if (this.task) return;
                this.product = product
                this.session = session
                const data = await TasksService.setTaskByProductId({ product_id, session })
                if (!data) return;
                if (this.authStore.client) {
                    if (this.authStore.client.limit_usage <= 0) {
                        this.isLimitReached = true;
                        return;
                    } else {
                        await this.authStore.updateLimitUsageClient()
                    }
                }
                this.task = data
                this.setLocalStorageTask(data)
            } catch (error) {
                console.error('Erreur dans le store:', error);
                this.isError = true;
                this.prices = []
            }
        },

        async getAllPrices() {
            try {
                this.product = null
                this.isLoading = true;
                this.isError = false;
                this.offset = 0; // Reset offset on initial load

                const data = await PricesService.getAllPrices({
                    limit: this.limit,
                    offset: this.offset
                });

                this.prices = data;
            } catch (error) {
                console.error('Erreur dans le store:', error);
                this.isError = true;
                this.prices = [];
            } finally {
                this.isLoading = false;
            }
        },

        async handleLoadingMorePrices() {
            try {
                this.isLoading = true;
                this.offset += this.limit;

                const data = await PricesService.getAllPrices({
                    limit: this.limit,
                    offset: this.offset
                });

                this.prices = [...this.prices, ...data];
            } catch (error) {
                console.error('Erreur lors du chargement supplémentaire:', error);
                this.isError = true
                this.prices = []
            } finally {
                this.isLoading = false;
            }
        },

        async getPriceBySearchTerm() {
            try {
                const currentTerm = this.searchTerm; // Stocke la valeur actuelle
                this.isLoading = true;
                this.offset = 0; // Reset à chaque nouvelle recherche

                const data = await PricesService.getPriceBySearchTerm({ term: this.searchTerm, limit: this.limit, offset: this.offset });
                console.log(data)
                if (!data) {
                    this.isError = true
                    return
                }

                // Mettez à jour seulement si l'utilisateur n'a pas modifié le champ entre temps
                if (this.searchTerm === currentTerm) {
                    this.prices = data;
                }

                this.prices = data;
            } catch (error) {
                console.error('Search error:', error);
                this.isError = true;
                this.prices = [];
            } finally {
                this.isLoading = false;
            }

        },

        clearExpiredTask() {
            this.product = null
            this.task = null;
            this.realtimeSubscription = null;
            this.expirationTimeoutId = null;
            sessionStorage.removeItem("user-task");
        },

    }
})