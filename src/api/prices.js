/**
 * Service pour la gestion des requêtes liées aux prix
 */
const API_BASE_URL = 'http://localhost:8000/api/v2';

export const PricesService = {
    async getAllPrices({ limit, offset }) {
        try {

            const response = await fetch(`${API_BASE_URL}/prices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    limit,
                    offset
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
    async getPriceBySearchTerm({ term, limit, offset }) {
        try {
            const response = await fetch(`${API_BASE_URL}/prices/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    term,
                    limit,
                    offset
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur dans PricesService.searchPrices:', error);
            throw error;
        }
    }
};
