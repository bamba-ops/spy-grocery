import { defineStore } from 'pinia'
import type { SearchProduct } from '#shared/types'

export const useProductDetailsStore = defineStore('productDetails', {
  state: () => ({
    product: null as SearchProduct | null,
    otherStoreProducts: [] as SearchProduct[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    getHasProduct: (state) => Boolean(state.product),
    getHasOtherStoreProducts: (state) => state.otherStoreProducts.length > 0
  },

  actions: {
    getFormattedPrice(price: number | null) {
      return formatPrice(price)
    },

    async getProductDetailsBySlug(slug: string) {
      const normalizedSlug = slug.trim()

      if (!normalizedSlug) {
        this.product = null
        this.otherStoreProducts = []
        this.error = 'Invalid product slug.'
        this.loading = false
        return
      }

      this.loading = true
      this.error = null

      try {
        const { getBySlug } = useProducts()
        const response = await getBySlug(normalizedSlug)

        this.product = response.product
        this.otherStoreProducts = response.otherStoreProducts || []
      } catch (error: unknown) {
        this.product = null
        this.otherStoreProducts = []
        this.error = error instanceof Error ? error.message : 'Could not load product details.'
      } finally {
        this.loading = false
      }
    }
  }
})
