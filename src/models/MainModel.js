import axios from 'axios';
import { Store } from '@/domain/Store';
import { Product } from '@/domain/Product';
import { Price } from '@/domain/Price';

const API_URL = 'http://127.0.0.1:8000/api/v1';
const STORE_ID = '32d6dd89-4216-4588-a096-631bfaf5df56'
const GET_ALL_PRICES_BY_STORE_ID = `/prices/store/${STORE_ID}`
const GET_BEST_PRICE = `/product/price`

export class MainModel {

    async fetchBestPrice(product) {
        try {
            const products = new Array()
            const stores = new Array()

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

    async fetchPricesByStoreId() {
        try {
            const prices = new Array()
            const products = new Array()
            const stores = new Array()

            const response = await axios.get(API_URL + GET_ALL_PRICES_BY_STORE_ID)
            response.data.forEach(price => {

                const _product = new Product(
                    price.product.id,
                    price.product.created_at,
                    price.product.name,
                    price.product.image_url,
                    price.product.brand,
                    price.product.unit,
                    price.product.store_id,
                    price.product.reference_id
                )
                const _store = new Store(
                    price.store.id,
                    price.store.created_at,
                    price.store.name,
                    price.store.image_url
                )

                _product.setDefaultBrand()
                _product.setDefaultUnit()

                products.push(_product)

                stores.push(_store)

                const _price = new Price(
                    price.id,
                    price.product.id,
                    price.store.id,
                    price.price,
                    price.unit,
                    _product,
                    _store
                )


                _price.setDefaultUnit()

                prices.push(_price)

            });
            return prices
        } catch (error) {
            console.error("Error fetching products:", error);
            throw new Error("Failed to fetch products");
        }
    }

    async fetchProductDetails(productId) {
        try {
            const response = await axios.get(`${API_URL}/products/${productId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product details for ID ${productId}:`, error);
            throw new Error("Failed to fetch product details");
        }
    }
}
