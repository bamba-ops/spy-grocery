import { API_BASE_URL } from '@/api/config.js'

export const TasksService = {
    setHeaders(session) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (session?.access_token && session?.refresh_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
            headers['x-refresh-token'] = session.refresh_token;
        }
        return headers;
    },

    async setTaskByProductId({ product_id, session }) {
        try {
            // Construction dynamique du payload
            const payload = { product_id };
            if (session?.user?.id) {
                payload.user_id = session.user.id;
            }

            const response = await fetch(`${API_BASE_URL}/task/product/id`, {
                method: 'POST',
                headers: this.setHeaders(session),
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur dans TasksService.setTaskByProductId:', error);
            throw error; // Remonte l'erreur pour la gérer dans le store ou ailleurs
        }
    },

    async processTask(task, product, session) {
        try {

            const response = await fetch(`${API_BASE_URL}/task/process`, {
                method: 'POST',
                headers: this.setHeaders(session),
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
    },
    async getTaskByIsTest() {
        try {

            const response = await fetch(`${API_BASE_URL}/task/is_test`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur dans TasksService.getTaskByIsTest:', error);
            throw error; // Remonte l'erreur pour la gérer dans le store ou ailleurs
        }
    },


};
