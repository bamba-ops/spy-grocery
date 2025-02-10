/**
 * Service pour la gestion des requêtes liées aux prix
 */
import { useAuthStore } from "@/stores/useAuthStore";

const authStore = useAuthStore()
const API_BASE_URL = 'http://localhost:8000/api/v2';

export const TasksService = {
    setHeaders() {
        if (authStore.session) {
            console.log({ Authorization: `Bearer ${authStore.session.access_token}` })
            return authStore.session ? { Authorization: `Bearer ${authStore.session.access_token}` } : {};
        } else {
            return {
                'Content-Type': 'application/json',
            }
        }
    },

    async setTaskByProductId({ product_id }) {
        try {

            const response = await fetch(`${API_BASE_URL}/task/product/id`, {
                method: 'POST',
                headers: this.setHeaders(),
                body: JSON.stringify({
                    product_id
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur dans PricesService.getPrices:', error);
            throw error; // On remonte l'erreur pour la gérer dans le store
        }
    },
    /*
    async processTask(task, product) {
        try {

            const response = await fetch(`${API_BASE_URL}/task/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    task,
                    product
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

        } catch (error) {
            console.error('Erreur dans PricesService.getPrices:', error);
            throw error; // On remonte l'erreur pour la gérer dans le store
        }
    }
        */
};
