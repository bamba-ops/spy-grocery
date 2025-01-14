import axios from 'axios';

const URL = 'https://spy-grocery-backend-production.up.railway.app';
const URL_DEV = 'http://127.0.0.1:8000';
const API_URL = URL + '/api/v1';

// Ajoutons un nouvel endpoint :
const SEARCH_PRICES_ENDPOINT = '/prices/search';

// Store par défaut, si nécessaire
const STORE_ID = '32d6dd89-4216-4588-a096-631bfaf5df56';

export class DataAPISource {

    // Exemple : méthode existante
    async fetchBestPrice(product) {
        try {
            const response = await axios.post(API_URL + '/product/price', product, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            let bestMatch = response.data.best_match;
            let targetProduct = response.data.target_product;
            return [targetProduct, bestMatch];
        } catch (error) {
            console.error('Error fetching best price:', error);
            throw new Error('Failed to fetch best price');
        }
    }

    // Exemple : méthode existante
    async fetchPricesByStoreId(limit = 30, offset = 0) {
        try {
            const response = await axios.get(
                API_URL + `/prices/store/${STORE_ID}`,
                {
                    params: { limit, offset }
                }
            );
            const data = await response.data;
            return data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Failed to fetch products');
        }
    }

    // -----------------------------------------------------------------
    // NOUVELLE MÉTHODE : Rechercher les prix par store + nom produit
    // -----------------------------------------------------------------
    async searchPricesByStoreAndName(storeId, productName, limit = 30, offset = 0) {
        try {
            // On utilise l’endpoint GET /prices/search, 
            // en passant store_id et product_name en query params
            const response = await axios.get(API_URL + SEARCH_PRICES_ENDPOINT, {
                params: {
                    store_id: storeId,
                    product_name: productName,
                    limit,
                    offset
                }
            });
            // Le backend renvoie un objet { total_count, prices: [...] }
            const data = await response.data;
            return data;
        } catch (error) {
            console.error('Error searching prices:', error);
            throw new Error('Failed to search prices');
        }
    }
}
