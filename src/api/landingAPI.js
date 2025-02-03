import axios from 'axios';
import { getApiUrl } from '../config/api.config';
import { VAR_CONFIG } from '../config/var.config';

// Get the api url
const apiUrl = getApiUrl();

// Listing Api
export const landingAPI = {
    async getAllTasksIsTest() {
        try {
            const response = await axios.get(`${apiUrl}/task/is_test`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to set task');
        }
    }
}