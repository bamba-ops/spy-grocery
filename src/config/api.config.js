export const API_CONFIG = {
    PROD_URL: 'https://spy-grocery-backend-production.up.railway.app',
    DEV_URL: 'http://127.0.0.1:8000',
    // Vous pouvez changer cette valeur pour basculer entre dev et prod
    IS_DEV: true
};

export const getApiUrl = () => {
    const baseUrl = API_CONFIG.IS_DEV ? API_CONFIG.DEV_URL : API_CONFIG.PROD_URL;
    return `${baseUrl}/api/v1`;
}; 