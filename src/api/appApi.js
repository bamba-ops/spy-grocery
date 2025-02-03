import axios from 'axios';
import { getApiUrl } from '../config/api.config';

// Get the api url
const apiUrl = getApiUrl();

// Listing Api
export const appApi = {
    async initUserLimit(user_limit) {
        try {
            const response = await axios.post(`${apiUrl}/user/limit`, { user_limit: user_limit });
            return response.data;
        } catch (error) {
            throw new Error('Failed to init user limit');
        }
    },

    async getByIpInfo(user_limit) {
        try {
            console.log(user_limit)
            const response = await axios.post(`${apiUrl}/user/limit/get`, { user_limit: user_limit });
            return response.data;
        } catch (error) {
            throw new Error('Failed to get user limit');
        }
    },

    async updateUserLimit(user_limit) {
        try {
            const response = await axios.post(`${apiUrl}/user/limit/update`, { user_limit: user_limit });
            return response.data;
        } catch (error) {
            throw new Error('Failed to update user limit');
        }
    }
}