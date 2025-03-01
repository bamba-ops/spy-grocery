import { API_BASE_URL } from '@/api/config.js'
import { supabase } from '@/api/supabase'

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
            const payload = {
                product_id,
                user_id: session?.user?.id || null,
                status: "pending"
            };

            console.log(payload)

            const { data, error } = await supabase
                .from('tasks')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;

            console.log(data)
            return data;

        } catch (error) {
            console.error('Erreur dans TasksService.setTaskByProductId:', error);
            throw error;
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
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('is_test', true);

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Erreur dans TasksService.getTaskByIsTest:', error);
            throw error; // Remonte l'erreur pour la gérer dans le store ou ailleurs
        }
    },

    async getTaskById(id) {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('id', id) // Filtrer par l'ID de la tâche
                .single(); // Récupérer une seule tâche

            if (error) throw error; // Gérer l'erreur si elle se produit

            return data; // Retourner la tâche récupérée

        } catch (error) {
            console.error('Erreur dans TasksService.getTaskById:', error);
            throw error; // Remonte l'erreur pour la gérer dans le store ou ailleurs
        }
    },


};
