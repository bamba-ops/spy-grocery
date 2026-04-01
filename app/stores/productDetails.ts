import { defineStore } from 'pinia'
import type { SearchProduct } from '#shared/types'
import { getProductRoutePath } from '#shared/utils/productRoute'

export const useProductDetailsStore = defineStore('productDetails', {
  state: () => ({
    product: null as SearchProduct | null,
    otherStoreProducts: [] as SearchProduct[],
    loading: false,
    error: null as string | null,
    canonicalPath: null as string | null,
    shouldRedirect: false
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
        this.canonicalPath = null
        this.shouldRedirect = false
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
        this.canonicalPath = getProductRoutePath(response.product)
        this.shouldRedirect = false
      } catch (error: unknown) {
        this.product = null
        this.otherStoreProducts = []
        this.error = error instanceof Error ? error.message : 'Could not load product details.'
        this.canonicalPath = null
        this.shouldRedirect = false
      } finally {
        this.loading = false
      }
    },

    async getProductDetailsByRoute(storeSlug: string, productSlug: string) {
      const normalizedStoreSlug = storeSlug.trim()
      const normalizedProductSlug = productSlug.trim()

      if (!normalizedStoreSlug || !normalizedProductSlug) {
        this.product = null
        this.otherStoreProducts = []
        this.error = 'Invalid product route.'
        this.canonicalPath = null
        this.shouldRedirect = false
        this.loading = false
        return
      }

      this.loading = true
      this.error = null

      try {
        const { getByRoute } = useProducts()
        const response = await getByRoute(normalizedStoreSlug, normalizedProductSlug)

        this.product = response.product
        this.otherStoreProducts = response.otherStoreProducts || []
        this.canonicalPath = response.canonicalPath
        this.shouldRedirect = response.shouldRedirect
      } catch (error: unknown) {
        this.product = null
        this.otherStoreProducts = []
        this.error = error instanceof Error ? error.message : 'Could not load product details.'
        this.canonicalPath = null
        this.shouldRedirect = false
      } finally {
        this.loading = false
      }
    }
  }
})
