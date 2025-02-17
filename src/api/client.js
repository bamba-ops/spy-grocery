/**
 * Service pour la gestion des requêtes liées aux prix
 */
import { API_BASE_URL } from '@/api/config.js'

export const ClientService = {
    setHeaders(session) {
        const headers = {
            "Content-Type": "application/json",
        };
        if (session?.access_token && session?.refresh_token) {
            headers["Authorization"] = `Bearer ${session.access_token}`;
            headers["x-refresh-token"] = session.refresh_token;
        }
        return headers;
    },

    async updateLimitUsageClient({ session, client }) {
        try {
            const payload = { client: client };

            const response = await fetch(`${API_BASE_URL}/client`, {
                method: "PUT",
                headers: this.setHeaders(session),
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Erreur dans ClientService.updateClient:", error);
            throw error; // On remonte l'erreur pour la gérer dans le store
        }
    },
    async setClient({ session }) {
        try {
            const payload = {};
            if (session?.user?.id) {
                payload.user_id = session.user.id;
                payload.email = session.user.email;
            }

            const response = await fetch(`${API_BASE_URL}/client`, {
                method: "POST",
                headers: this.setHeaders(session),
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Erreur dans ClientService.setClient:", error);
            throw error; // On remonte l'erreur pour la gérer dans le store
        }
    },
};
