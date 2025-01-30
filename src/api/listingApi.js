import axios from 'axios';
import { getApiUrl } from '../config/api.config';
import { VAR_CONFIG } from '../config/var.config';

// Get the api url
const apiUrl = getApiUrl();

// Listing Api
export const listingApi = {

    // Get the prices by store id
    async getPricesByStoreId(limit = 30, offset = 0) {
        try {
            const response = await axios.get(`${apiUrl}${VAR_CONFIG.TARGET_PRICES_STORE_ENDPOINT}/${VAR_CONFIG.TARGET_STORE_ID}`, {
                params: { limit, offset }
            });
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch listing by store id');
        }
    },

    // Get the prices by store id and product name
    async searchPricesByStoreAndName(storeId, productName, limit = 30, offset = 0) {
        try {
            const response = await axios.get(`${apiUrl}${VAR_CONFIG.TARGET_PRICES_SEARCH_ENDPOINT}`, {
                params: {
                    store_id: storeId,
                    product_name: productName,
                    limit,
                    offset
                }
            });
            return response.data;
        } catch (error) {
            console.error('Search error:', error.response?.data || error.message);
            throw new Error('Failed to fetch listing by store and name');
        }
    },

    // Get best price
    async getBestPrice(product) {
        try {
            const response = await axios.post(`${apiUrl}${VAR_CONFIG.TARGET_PRODUCT_PRICE_ENDPOINT}`, product);
            let bestMatch = response.data.best_match;
            let targetProduct = response.data.target_product;
            return [targetProduct, bestMatch];
        } catch (error) {
            throw new Error('Failed to fetch best price');
        }
    }
}
