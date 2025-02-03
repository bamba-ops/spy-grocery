import axios from 'axios';
import { getApiUrl } from '../config/api.config';
import { VAR_CONFIG } from '../config/var.config';

// Get the api url
const apiUrl = 'https://ipinfo.piaproxy.pro/'

// Listing Api
export const ipInfoApi = {
    async getipInfo() {
        try {
            const response = await axios.get(`${apiUrl}`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to get ip info');
        }
    }
}