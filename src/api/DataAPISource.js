import axios from 'axios';
import { Store } from '@/domain/entity/Store';
import { Product } from '@/domain/entity/Product';
import { Price } from '@/domain/entity/Price';


const API_URL = 'https://35.183.48.145:80/api/v1';
const STORE_ID = '32d6dd89-4216-4588-a096-631bfaf5df56'
const GET_ALL_PRICES_BY_STORE_ID = `/prices/store/${STORE_ID}`
const GET_BEST_PRICE = `/product/price`

export class DataAPISource {

    async fetchBestPrice(product) {
        try {

            const response = await axios.post(API_URL + GET_BEST_PRICE, product, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            let bestMatch = response.data.best_match
            let targetProduct = response.data.target_product

            return [targetProduct, bestMatch]
        } catch (error) {
            console.error("Error fetching best price:", error);
            throw new Error("Failed to fetch best price");
        }
    }

    async fetchPricesByStoreId(limit = 30, offset = 0) {
        try {
            //let prices = []

            const response = await axios.get(API_URL + GET_ALL_PRICES_BY_STORE_ID, {
                params: {
                    limit: limit,
                    offset: offset
                }
            })
            console.log(response)
            const data = await response.data

            //prices = data.map(item => Price.fromJSON(item))
            return data
        } catch (error) {
            console.error("Error fetching products:", error);
            throw new Error("Failed to fetch products");
        }
    }

}
