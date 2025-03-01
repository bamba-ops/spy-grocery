/**
 * Service pour la gestion des requêtes liées aux prix
 */
import { API_BASE_URL } from '@/api/config.js'
import { supabase } from '@/api/supabase'
import { format } from 'date-fns'

export const PricesService = {
    async getAllPrices({ limit, offset }) {
        try {
            const today = format(new Date(), 'yyyy-MM-dd')

            // Étape 1: Récupérer les produits avec pagination et date d'aujourd'hui
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('store_id', '32d6dd89-4216-4588-a096-631bfaf5df56') // même filtre que le backend
                .eq('created_date', today) // Filtrer par date d'aujourd'hui
                .range(offset, offset + limit - 1);

            if (productsError) throw productsError;

            // Étape 2: Récupérer les prix correspondants
            const productIds = products.map(p => p.id);

            const { data: prices, error: pricesError } = await supabase
                .from('prices')
                .select('*')
                .in('product_id', productIds);

            if (pricesError) throw pricesError;

            // Étape 3: Combiner les données comme dans le backend
            const priceDict = {};
            prices.forEach(price => {
                priceDict[price.product_id] = price;
            });

            return products.map(product => ({
                ...priceDict[product.id],
                product: product
            }));

        } catch (error) {
            console.error('Erreur dans PricesService.getPrices:', error);
            throw error;
        }
    },
    async getPriceBySearchTerm({ term, limit, offset }) {
        try {
            const today = format(new Date(), 'yyyy-MM-dd')

            // Étape 1: Appeler la fonction RPC de recherche
            const { data: products, error: searchError } = await supabase
                .rpc('search_products_v2', {
                    p_query: term,
                    p_limit: limit,
                    p_offset: offset
                });

            if (searchError) throw searchError;

            // Étape 2: Récupérer les prix associés filtrés par date d'aujourd'hui
            const productIds = products.map(p => p.id);

            const { data: prices, error: pricesError } = await supabase
                .from('prices')
                .select('*')
                .in('product_id', productIds)
                .eq('created_date', today); // Filtrer par date d'aujourd'hui

            if (pricesError) throw pricesError;

            // Étape 3: Combiner les données comme dans le backend
            const priceDict = {};
            prices.forEach(price => {
                priceDict[price.product_id] = price;
            });

            return products.map(product => ({
                ...priceDict[product.id],
                product: product
            }));

        } catch (error) {
            console.error('Erreur dans PricesService.searchPrices:', error);
            throw error;
        }
    },

    /*
    async getAllProductNames() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('name_raw')
                .order('name_raw', { ascending: true })
                .eq('store_id', '32d6dd89-4216-4588-a096-631bfaf5df56')

            if (error) throw error;
            return data.map(item => item.name_raw);
        } catch (error) {
            console.error('Erreur dans PricesService.getAllProductNames:', error);
            throw error;
        }
    },
    */
};
