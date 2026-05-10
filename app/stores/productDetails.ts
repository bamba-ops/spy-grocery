import { defineStore } from 'pinia'
import type { AffiliateOffer } from '#shared/types/affiliate'
import type { SearchProduct } from '#shared/types'
import { getProductRoutePath } from '#shared/utils/productRoute'
import { toSlug } from '#shared/utils/toSlug'
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
const DEFAULT_CTA_INSERT_INDEX = 0

const getPriceSortValue = (price: number | null) => {
  return typeof price === 'number' ? price : Number.POSITIVE_INFINITY
}

export const useProductDetailsStore = defineStore('productDetails', {
  state: () => ({
    product: null as SearchProduct | null,
    otherStoreProducts: [] as SearchProduct[],
    affiliateOffers: [] as AffiliateOffer[],
    visibleComparisonProductsCount: INITIAL_VISIBLE_COMPARISON_PRODUCTS_COUNT,
    loading: false,
    error: null as string | null,
    canonicalPath: null as string | null,
    shouldRedirect: false
  }),

  getters: {
    getHasProduct: (state) => Boolean(state.product),
    getHasOtherStoreProducts: (state) => state.otherStoreProducts.length > 0,
    getAffiliateOffers: (state) => state.affiliateOffers,
    getHasAffiliateOffers: (state) => state.affiliateOffers.length > 0,

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
        if (a.is_active !== b.is_active) {
          return a.is_active ? -1 : 1
        }

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
        .filter((product) => product.is_active)
        .map((product) => product.price_num)
        .filter((price): price is number => typeof price === 'number')

      if (prices.length === 0) {
        return null
      }

      const sum = prices.reduce((acc, price) => acc + price, 0)
      return sum / prices.length
    },

    // Rang du produit courant (1-indexed label) parmi tous les produits comparés
    getCurrentProductRankLabel(): string | null {
      const currentIndex = this.getCurrentProductComparisonIndex
      const totalCount = this.getSortedComparisonProducts.length

      if (currentIndex < 0 || totalCount <= 0) {
        return null
      }

      return `Rang ${currentIndex + 1} sur ${totalCount}`
    },

    // Premier produit actif concurrent (pas le produit courant)
    getBestCompetitorProduct(): SearchProduct | null {
      const current = this.product
      if (!current) return null

      return this.getSortedComparisonProducts.find(
        (p) => p.is_active && p.id !== current.id
      ) ?? null
    },

    // Economie possible si le produit courant n'est pas le moins cher (null sinon)
    getSavingsVsBestCompetitor(): number | null {
      const current = this.product
      const best = this.getBestCompetitorProduct

      if (!current || !best) return null

      const currentPrice = current.price_num
      const bestPrice = best.price_num

      if (currentPrice == null || bestPrice == null) return null

      const diff = currentPrice - bestPrice
      return diff > 0.005 ? diff : null
    },

    // Vrai si le produit courant est le meilleur prix parmi les actifs
    getIsCurrentProductBestPrice(): boolean {
      const current = this.product
      if (!current) return false

      const activeProducts = this.getSortedComparisonProducts.filter((p) => p.is_active)
      if (activeProducts.length === 0) return false

      return activeProducts[0]?.id === current.id
    },

    // Libellé formaté fr-CA pour le signal d'économie hero
    getHeroSavingsLabel(): { savings: string; bestStore: string; bestPrice: string; totalStores: number } | null {
      const total = this.getSortedComparisonProducts.length
      const savings = this.getSavingsVsBestCompetitor
      const best = this.getBestCompetitorProduct

      if (!best || savings == null) return null

      const savingsText = savings.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      return {
        savings: `${savingsText} $`,
        bestStore: best.store,
        bestPrice: (best.price_num?.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 'N/A') + ' $',
        totalStores: total
      }
    },

    // Prix affiché formaté "X.XX $ CA" (null si inactif ou prix absent)
    getFormattedCadPrice(): string | null {
      const product = this.product
      if (!product || !product.is_active) return null

      const price = product.price_num
      const formatted = formatPrice(price)

      if (formatted === 'N/A') return null
      return `${formatted} $ CA`
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
        const currentVisibleIndex = currentProductId
          ? visibleProducts.findIndex((product) => product.id === currentProductId)
          : -1
        const ctaInsertAfterIndex = showGuestProductCta
          ? (currentVisibleIndex >= 0 ? currentVisibleIndex : DEFAULT_CTA_INSERT_INDEX)
          : -1
        const ctaRowKey = currentVisibleIndex >= 0
          ? 'cta-after-current'
          : `cta-after-${ctaInsertAfterIndex}`

        visibleProducts.forEach((product, visibleIndex) => {
          const rankIndex = rankedProducts.findIndex((entry) => entry.id === product.id)

          rows.push({
            type: 'product',
            key: product.id,
            product,
            rankIndex,
            rankTotal: rankedProducts.length,
            isCurrent: product.id === currentProductId
          })

          if (showGuestProductCta && visibleIndex === ctaInsertAfterIndex) {
            rows.push({
              type: 'cta',
              key: ctaRowKey
            })
          }
        })

        if (showGuestProductCta && !rows.some((row) => row.type === 'cta')) {
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
    setAffiliateOffersReset() {
      this.affiliateOffers = []
    },

    async getAffiliateOffersForCurrentProduct() {
      if (!this.product?.id) {
        this.setAffiliateOffersReset()
        return []
      }

      try {
        const { getOffersByProductId } = useAffiliateOffers()
        const offers = await getOffersByProductId(this.product.id)

        this.affiliateOffers = offers

        console.log('[affiliate][amazon] offers hydrated in product details store:', {
          productId: this.product.id,
          offerCount: offers.length
        })

        return offers
      } catch (error) {
        this.setAffiliateOffersReset()

        console.error('[affiliate][amazon] failed to hydrate offers:', {
          productId: this.product.id,
          error
        })

        return []
      }
    },

    // Construction du path /search?intent=notify-special pour le produit courant
    getNotifySpecialNextPath(storeSlugFallback = '') {
      const params = new URLSearchParams()
      params.set('intent', 'notify-special')

      const productTitle = (this.product?.title || '').trim()
      if (productTitle) {
        params.set('q', productTitle)
      }

      const storeParam = this.product?.store_id
        || this.product?.store_slug
        || storeSlugFallback

      if (storeParam) {
        params.set('store', storeParam)
      }

      return `/search?${params.toString()}`
    },

    // Redirige vers login avec next=notify-special pour les visiteurs non connectes
    async setNotifySpecialFromProductCta(storeSlugFallback = '') {
      const nextPath = this.getNotifySpecialNextPath(storeSlugFallback)

      // Debug log intentionally kept while notify-special CTA routing is monitored.
      console.log('[notify-special] product CTA clicked, redirecting to login:', {
        productId: this.product?.id || null,
        nextPath
      })

      await navigateTo(`/login?next=${encodeURIComponent(nextPath)}`)
    },

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
        this.setAffiliateOffersReset()
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
        await this.getAffiliateOffersForCurrentProduct()

        return response as ProductDetailsResponse
      } catch (error: unknown) {
        this.product = null
        this.otherStoreProducts = []
        this.setAffiliateOffersReset()
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
        this.setAffiliateOffersReset()
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
        await this.getAffiliateOffersForCurrentProduct()

        return response as ProductDetailsByRouteResponse
      } catch (error: unknown) {
        this.product = null
        this.otherStoreProducts = []
        this.setAffiliateOffersReset()
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
