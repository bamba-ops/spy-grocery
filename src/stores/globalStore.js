import { defineStore } from 'pinia';
import { listingApi } from '../api/listingApi';
import { underConstructionApi } from '../api/underConstructionApi';

export const useGlobalStore = defineStore('globalStore', {
    state: () => ({
        // Données produits
        prices: [],
        totalCount: 0,
        currentOffset: 0,
        limit: 30,

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
        }
    }),

    getters: {
        isEndOfResults: (state) => state.prices.length >= state.totalCount,
        hasResults: (state) => state.prices.length > 0,
        currentSearchQuery: (state) => state.searchQuery
    },

    actions: {
        // Actions pour la gestion des produits
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

        // Réinitialiser l'état de la pagination
        resetPagination() {
            this.currentOffset = 0;
            this.prices = [];
            this.totalCount = 0;
        },

        // Actions pour la newsletter
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
        }
    }
});