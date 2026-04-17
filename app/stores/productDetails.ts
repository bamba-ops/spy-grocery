import { defineStore } from 'pinia'
import type { SearchProduct } from '#shared/types'
import { getProductRoutePath } from '#shared/utils/productRoute'
import type { ProductDetailsByRouteResponse, ProductDetailsResponse } from '#shared/types/product-details'

interface LoadOptions {
  throwOnError?: boolean
}

type ProductComparisonRow = {
  type: 'product'
  key: string
  product: SearchProduct
  rankIndex: number
  rankTotal: number
  isCurrent: boolean
}

type CtaComparisonRow = {
  type: 'cta'
  key: string
}

type ComparisonRow = ProductComparisonRow | CtaComparisonRow

const INITIAL_VISIBLE_COMPARISON_PRODUCTS_COUNT = 5
const LOAD_MORE_COMPARISON_PRODUCTS_COUNT = 5
const CTA_INSERT_INDEX = 1

const getPriceSortValue = (price: number | null) => {
  return typeof price === 'number' ? price : Number.POSITIVE_INFINITY
}

export const useProductDetailsStore = defineStore('productDetails', {
  state: () => ({
    product: null as SearchProduct | null,
    otherStoreProducts: [] as SearchProduct[],
    visibleComparisonProductsCount: INITIAL_VISIBLE_COMPARISON_PRODUCTS_COUNT,
    loading: false,
    error: null as string | null,
    canonicalPath: null as string | null,
    shouldRedirect: false
  }),

  getters: {
    getHasProduct: (state) => Boolean(state.product),
    getHasOtherStoreProducts: (state) => state.otherStoreProducts.length > 0,

    getSortedComparisonProducts(): SearchProduct[] {
      const mergedProducts = [
        ...(this.product ? [this.product] : []),
        ...this.otherStoreProducts
      ]
      const deduplicatedProducts = new Map<string, SearchProduct>()

      for (const product of mergedProducts) {
        if (!deduplicatedProducts.has(product.id)) {
          deduplicatedProducts.set(product.id, product)
        }
      }

      return [...deduplicatedProducts.values()].sort((a, b) => {
        const priceDiff = getPriceSortValue(a.price_num) - getPriceSortValue(b.price_num)

        if (priceDiff !== 0) {
          return priceDiff
        }

        return a.store.localeCompare(b.store)
      })
    },

    getVisibleComparisonProducts(): SearchProduct[] {
      return this.getSortedComparisonProducts.slice(0, this.visibleComparisonProductsCount)
    },

    getRemainingComparisonProductsCount(): number {
      return Math.max(this.getSortedComparisonProducts.length - this.visibleComparisonProductsCount, 0)
    },

    getHasMoreComparisonProducts(): boolean {
      return this.getRemainingComparisonProductsCount > 0
    },

    getLoadMoreBatchCount(): number {
      return Math.min(LOAD_MORE_COMPARISON_PRODUCTS_COUNT, this.getRemainingComparisonProductsCount)
    },

    getCurrentProductComparisonIndex(): number {
      const currentProductId = this.product?.id || null

      if (!currentProductId) {
        return -1
      }

      return this.getSortedComparisonProducts.findIndex((product) => product.id === currentProductId)
    },

    getMarketAveragePrice(): number | null {
      const prices = this.getSortedComparisonProducts
        .map((product) => product.price_num)
        .filter((price): price is number => typeof price === 'number')

      if (prices.length === 0) {
        return null
      }

      const sum = prices.reduce((acc, price) => acc + price, 0)
      return sum / prices.length
    },

    getComparisonRows(): (showGuestProductCta: boolean) => ComparisonRow[] {
      return (showGuestProductCta: boolean) => {
        const rankedProducts = this.getSortedComparisonProducts
        const visibleProducts = this.getVisibleComparisonProducts

        if (visibleProducts.length === 0) {
          return []
        }

        const rows: ComparisonRow[] = []
        const currentProductId = this.product?.id || null
        const ctaInsertIndex = showGuestProductCta ? CTA_INSERT_INDEX : -1

        visibleProducts.forEach((product, visibleIndex) => {
          if (visibleIndex === ctaInsertIndex) {
            rows.push({
              type: 'cta',
              key: `cta-${visibleIndex}`
            })
          }

          const rankIndex = rankedProducts.findIndex((entry) => entry.id === product.id)

          rows.push({
            type: 'product',
            key: product.id,
            product,
            rankIndex,
            rankTotal: rankedProducts.length,
            isCurrent: product.id === currentProductId
          })
        })

        if (showGuestProductCta && ctaInsertIndex >= visibleProducts.length) {
          rows.push({
            type: 'cta',
            key: 'cta-end'
          })
        }

        return rows
      }
    }
  },

  actions: {
    getFormattedPrice(price: number | null) {
      return formatPrice(price)
    },

    getComparisonProductImageDisplay(product: SearchProduct) {
      const { getImageDisplay } = useProducts()
      return getImageDisplay(product.image_url || null, product.title)
    },

    setComparisonVisibleProductsReset() {
      const currentProductIndex = this.getCurrentProductComparisonIndex
      const minimumVisibleCount = currentProductIndex >= 0
        ? currentProductIndex + 1
        : INITIAL_VISIBLE_COMPARISON_PRODUCTS_COUNT

      this.visibleComparisonProductsCount = Math.min(
        this.getSortedComparisonProducts.length,
        Math.max(INITIAL_VISIBLE_COMPARISON_PRODUCTS_COUNT, minimumVisibleCount)
      )
    },

    setShowMoreComparisonProducts() {
      const currentCount = this.visibleComparisonProductsCount
      const nextCount = Math.min(
        this.getSortedComparisonProducts.length,
        currentCount + LOAD_MORE_COMPARISON_PRODUCTS_COUNT
      )

      // Debug log intentionally kept while progressive ranking disclosure is monitored.
      console.log('[comparison] load more clicked:', {
        previousVisibleCount: currentCount,
        nextVisibleCount: nextCount,
        totalCount: this.getSortedComparisonProducts.length
      })

      this.visibleComparisonProductsCount = nextCount
    },

    async getProductDetailsBySlug(slug: string, options: LoadOptions = {}) {
      const normalizedSlug = slug.trim()

      if (!normalizedSlug) {
        this.product = null
        this.otherStoreProducts = []
        this.error = 'Slug produit invalide.'
        this.canonicalPath = null
        this.shouldRedirect = false
        this.setComparisonVisibleProductsReset()
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
        this.setComparisonVisibleProductsReset()

        return response as ProductDetailsResponse
      } catch (error: unknown) {
        this.product = null
        this.otherStoreProducts = []
        this.error = error instanceof Error ? error.message : 'Impossible de charger les details du produit.'
        this.canonicalPath = null
        this.shouldRedirect = false
        this.setComparisonVisibleProductsReset()

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
        this.error = 'Route produit invalide.'
        this.canonicalPath = null
        this.shouldRedirect = false
        this.setComparisonVisibleProductsReset()
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
        this.setComparisonVisibleProductsReset()

        return response as ProductDetailsByRouteResponse
      } catch (error: unknown) {
        this.product = null
        this.otherStoreProducts = []
        this.error = error instanceof Error ? error.message : 'Impossible de charger les details du produit.'
        this.canonicalPath = null
        this.shouldRedirect = false
        this.setComparisonVisibleProductsReset()

        if (options.throwOnError) {
          throw error
        }
      } finally {
        this.loading = false
      }
    }
  }
})
