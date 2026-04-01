import { defineStore } from 'pinia'
import type { SearchProduct } from '#shared/types'
import { getProductRoutePath } from '#shared/utils/productRoute'
import type { ProductDetailsByRouteResponse, ProductDetailsResponse } from '#shared/types/product-details'

interface LoadOptions {
  throwOnError?: boolean
}

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

    async getProductDetailsBySlug(slug: string, options: LoadOptions = {}) {
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

        return response as ProductDetailsResponse
      } catch (error: unknown) {
        this.product = null
        this.otherStoreProducts = []
        this.error = error instanceof Error ? error.message : 'Could not load product details.'
        this.canonicalPath = null
        this.shouldRedirect = false

        if (options.throwOnError) {
          throw error
        }
      } finally {
        this.loading = false
      }
    },

    async getProductDetailsByRoute(
      storeSlug: string,
      productSlug: string,
      options: LoadOptions = {}
    ) {
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

        return response as ProductDetailsByRouteResponse
      } catch (error: unknown) {
        this.product = null
        this.otherStoreProducts = []
        this.error = error instanceof Error ? error.message : 'Could not load product details.'
        this.canonicalPath = null
        this.shouldRedirect = false

        if (options.throwOnError) {
          throw error
        }
      } finally {
        this.loading = false
      }
    }
  }
})
