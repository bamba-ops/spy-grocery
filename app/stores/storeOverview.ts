import { defineStore } from 'pinia'
import type { SearchProduct, StoreOverviewResponse } from '#shared/types'
import {
  getAnalyticsQueryProperties,
  getAnalyticsTopProductsProperties
} from '#shared/utils/analytics'
import { toSlug } from '#shared/utils/toSlug'

interface LoadOptions {
  throwOnError?: boolean
}

const STORE_SEARCH_DEBOUNCE_MS = 250
const STORE_SEARCH_LIMIT = 12
let storeSearchDebounceTimer: ReturnType<typeof setTimeout> | null = null

export const useStoreOverviewStore = defineStore('storeOverview', {
  state: () => ({
    storeSlug: '',
    storeName: '',
    productCount: 0,
    activeSpecialsCount: 0,
    lastUpdatedAt: null as string | null,
    latestPromos: [] as SearchProduct[],
    bestProducts: [] as SearchProduct[],
    storeSearchInput: '',
    storeSearchResults: [] as SearchProduct[],
    storeSearchLoading: false,
    storeSearchError: null as string | null,
    hasSearchedStore: false,
    storeSearchRequestId: 0,
    loading: false,
    error: null as string | null
  }),

  getters: {
    hasData: (state) => state.storeName.length > 0,
    hasLatestPromos: (state) => state.latestPromos.length > 0,
    hasBestProducts: (state) => state.bestProducts.length > 0,
    hasStoreSearchResults: (state) => state.storeSearchResults.length > 0,
    formattedLastUpdated: (state) => {
      if (!state.lastUpdatedAt) {
        return null
      }

      const date = new Date(state.lastUpdatedAt)
      if (Number.isNaN(date.getTime())) {
        return null
      }

      return date.toLocaleDateString('fr-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  },

  actions: {
    setStoreSearchInput(value: string) {
      this.storeSearchInput = value

      if (storeSearchDebounceTimer) {
        clearTimeout(storeSearchDebounceTimer)
      }

      if (!value.trim()) {
        this.storeSearchResults = []
        this.storeSearchLoading = false
        this.storeSearchError = null
        this.hasSearchedStore = false
        this.storeSearchRequestId += 1
        return
      }

      // Debounce keeps requests predictable while users type in the dropdown.
      storeSearchDebounceTimer = setTimeout(() => {
        void this.setSearchProductsInStore()
      }, STORE_SEARCH_DEBOUNCE_MS)
    },

    setResetStoreSearch() {
      if (storeSearchDebounceTimer) {
        clearTimeout(storeSearchDebounceTimer)
      }

      this.storeSearchInput = ''
      this.storeSearchResults = []
      this.storeSearchLoading = false
      this.storeSearchError = null
      this.hasSearchedStore = false
      this.storeSearchRequestId += 1
    },

    async setSearchProductsInStore() {
      if (storeSearchDebounceTimer) {
        clearTimeout(storeSearchDebounceTimer)
        storeSearchDebounceTimer = null
      }

      const normalizedQuery = this.storeSearchInput.trim()

      if (!normalizedQuery) {
        this.setResetStoreSearch()
        return
      }

      if (!this.storeSlug) {
        this.storeSearchError = 'Impossible de determiner le magasin pour la recherche.'
        this.storeSearchResults = []
        this.hasSearchedStore = true
        return
      }

      // Request id prevents stale async responses from overriding the latest query result.
      const requestId = this.storeSearchRequestId + 1
      this.storeSearchRequestId = requestId
      this.storeSearchLoading = true
      this.storeSearchError = null
      const startedAt = Date.now()
      this.hasSearchedStore = true

      // Debug log intentionally kept while store-scoped search rollout is monitored.
      console.log('[store-search] search submitted:', {
        storeSlug: this.storeSlug,
        query: normalizedQuery,
        limit: STORE_SEARCH_LIMIT
      })

      try {
        const { search } = useProducts()
        const response = await search({
          q: normalizedQuery,
          store: this.storeSlug,
          sort: 'relevance',
          limit: STORE_SEARCH_LIMIT,
          offset: 0
        })

        if (requestId !== this.storeSearchRequestId) {
          return
        }

        this.storeSearchResults = response?.items || []

        const resultsCount = this.storeSearchResults.length
        const analytics = useAnalytics()
        analytics.capture('store_local_search_performed', {
          ...getAnalyticsQueryProperties(normalizedQuery),
          store_slug: this.storeSlug,
          results_count: resultsCount,
          zero_results: resultsCount === 0,
          duration_ms: Date.now() - startedAt,
          ...getAnalyticsTopProductsProperties(this.storeSearchResults),
          source: 'store_page'
        })

        // Debug log intentionally kept while store-scoped search rollout is monitored.
        console.log('[store-search] search completed:', {
          storeSlug: this.storeSlug,
          query: normalizedQuery,
          resultsCount: this.storeSearchResults.length
        })
      } catch (error: unknown) {
        if (requestId !== this.storeSearchRequestId) {
          return
        }

        console.error('[store-search] search failed:', error)
        this.storeSearchResults = []
        this.storeSearchError = error instanceof Error
          ? error.message
          : 'Impossible de rechercher des produits dans ce magasin pour le moment.'
      } finally {
        if (requestId === this.storeSearchRequestId) {
          this.storeSearchLoading = false
        }
      }
    },

    getFormattedPrice(price: number | null) {
      return formatPrice(price)
    },

    async loadStoreOverview(storeParam: string, options: LoadOptions = {}) {
      const normalizedStoreSlug = toSlug(storeParam)

      if (!normalizedStoreSlug) {
        this.error = 'Route magasin invalide.'
        this.storeSlug = ''
        this.storeName = ''
        this.productCount = 0
        this.activeSpecialsCount = 0
        this.lastUpdatedAt = null
        this.latestPromos = []
        this.bestProducts = []
        this.loading = false
        return
      }

      this.loading = true
      this.error = null

      try {
        const { fetchStoreOverview } = useStores()
        const response = await fetchStoreOverview(normalizedStoreSlug)

        this.storeSlug = response.store.slug
        this.storeName = response.store.name
        this.productCount = response.store.productCount
        this.activeSpecialsCount = response.store.activeSpecialsCount
        this.lastUpdatedAt = response.store.lastUpdatedAt
        this.latestPromos = response.latestPromos || []
        this.bestProducts = response.bestProducts || []

        return response as StoreOverviewResponse
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : 'Impossible de charger la page du magasin.'
        this.storeSlug = normalizedStoreSlug
        this.storeName = ''
        this.productCount = 0
        this.activeSpecialsCount = 0
        this.lastUpdatedAt = null
        this.latestPromos = []
        this.bestProducts = []

        if (options.throwOnError) {
          throw error
        }
      } finally {
        this.loading = false
      }
    }
  }
})
