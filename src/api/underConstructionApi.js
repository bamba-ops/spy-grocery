import axios from 'axios';
import { getApiUrl } from '../config/api.config';
import { VAR_CONFIG } from '../config/var.config';

// Get the api url
const apiUrl = getApiUrl();

// Newsletter Api
export const underConstructionApi = {

    // Subscribe to the newsletter
    async subscribeToNewsletter(email) {
        try {
            const response = await axios.post(`${apiUrl}${VAR_CONFIG.TARGET_NEWSLETTER_ENDPOINT}`, { email: this.formatEmail(email) }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error('Failed to subscribe to newsletter');
        }
    },

    // Format the email to be used in the API
    async formatEmail(email) {
        return email.trim().toLowerCase();
    }
}