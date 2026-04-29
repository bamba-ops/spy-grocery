import { defineStore, setActivePinia } from 'pinia'
import type { SearchProduct, StoreFacet } from '#shared/types'
import type { ProductsQueryParams, SearchAvailability, SearchSort } from '#shared/types/search'

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
let heroSearchDebounceTimer: ReturnType<typeof setTimeout> | null = null

export const useSearchStore = defineStore('search', {
  state: () => ({
    stores: [] as StoreFacet[],
    storesLoaded: false,
    heroSearchInput: '',
    heroSearchResults: [] as SearchProduct[],
    heroSearchLoading: false,
    heroSearchError: null as string | null,
    HERO_SEARCH_LIMIT: 6,
    HERO_SEARCH_DEBOUNCE_MS: 250,
    searchInput: '',
    query: '',
    results: [] as SearchProduct[],
    hasFetchedSearchResults: false,
    total: 0,
    page: 1,
    limit: 24,
    sortBy: 'relevance' as SearchSort,
    availability: 'active' as SearchAvailability,
    loading: false,
    error: null as string | null,
    selectedStoreId: 'all',
    MOBILE_SEARCH_LIMIT: 12,
    DESKTOP_SEARCH_LIMIT: 24,
    SEARCH_MOBILE_BREAKPOINT: 640,
    SEARCH_DEBOUNCE_MS: 400
  }),

  getters: {
    getProducts: (state) => state.results,
    getHeroSearchResults: (state) => state.heroSearchResults,
    getHeroHasResults: (state) => state.heroSearchResults.length > 0,
    getIsLoading: (state) => state.loading,
    getHasError: (state) => Boolean(state.error),
    getActiveQuery: (state) => state.query || 'Avocat biologique',
    getCanPrev: (state) => state.page > 1,
    getCanNext: (state) => state.page < Math.ceil(state.total / state.limit),
    hasResults: (state) => state.results.length > 0,
    totalPages: (state) => Math.ceil(state.total / state.limit),
    offset: (state) => (state.page - 1) * state.limit
  },

  actions: {
    async getProductsByParams(params: ProductsQueryParams) {
      const { search } = useProducts()
      return search(params)
    },

    async getHeroSearchResultsByQuery() {
      const query = this.heroSearchInput.trim()
      if (!query) {
        this.heroSearchResults = []
        this.heroSearchError = null
        this.heroSearchLoading = false
        return
      }

      this.heroSearchLoading = true
      this.heroSearchError = null

      try {
        const response = await this.getProductsByParams({
          q: query,
          limit: this.HERO_SEARCH_LIMIT,
          offset: 0,
          sort: 'relevance',
          availability: 'active',
          store: 'all'
        })

        this.heroSearchResults = response?.items || []
      } catch (error: unknown) {
        this.heroSearchError = error instanceof Error ? error.message : 'La recherche a echoue'
        this.heroSearchResults = []
      } finally {
        this.heroSearchLoading = false
      }
    },

    setHeroSearchInput(value: string) {
      this.heroSearchInput = value

      if (heroSearchDebounceTimer) {
        clearTimeout(heroSearchDebounceTimer)
      }

      heroSearchDebounceTimer = setTimeout(() => {
        void this.getHeroSearchResultsByQuery()
      }, this.HERO_SEARCH_DEBOUNCE_MS)
    },

    setHeroSearchCleared() {
      this.heroSearchInput = ''
      this.heroSearchResults = []
      this.heroSearchError = null
      this.heroSearchLoading = false
    },

    async getSearchResults() {
      this.loading = true
      this.error = null

      try {
        const response = await this.getProductsByParams({
          q: this.query || undefined,
          store: this.selectedStoreId,
          sort: this.sortBy,
          availability: this.availability,
          limit: this.limit,
          offset: this.offset
        })

        this.results = response?.items || []
        this.total = response?.total || 0
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : 'La recherche a echoue'
        this.results = []
        this.total = 0
      } finally {
        this.hasFetchedSearchResults = true
        this.loading = false
      }
    },

    getFormattedPrice(price: number | null) {
      return formatPrice(price)
    },

    getProductImageDisplay(imageUrl: string | null, productTitle: string) {
      const { getImageDisplay } = useProducts()
      return getImageDisplay(imageUrl, productTitle)
    },

    setScrollToTop() {
      scrollToTop()
    },

    getResponsiveSearchLimit() {
      if (process.client && window.innerWidth < this.SEARCH_MOBILE_BREAKPOINT) {
        return this.MOBILE_SEARCH_LIMIT
      }

      return this.DESKTOP_SEARCH_LIMIT
    },

    setResponsiveSearchLimit() {
      const nextLimit = this.getResponsiveSearchLimit()

      if (this.limit === nextLimit) {
        return false
      }

      this.limit = nextLimit
      this.page = 1
      return true
    },

    async getStores() {
      if (this.storesLoaded) return

      try {
        const { fetchStores } = useStores()
        this.stores = await fetchStores()
        this.storesLoaded = true
      } catch {
        this.stores = []
      }
    },

    async setSearchPageInitialized() {
      await this.getStores()

      const hasLimitChanged = this.setResponsiveSearchLimit()

      if ((!this.results.length && !this.loading) || hasLimitChanged) {
        await this.getSearchResults()
      }
    },

    setSearchInput(value: string) {
      this.searchInput = value

      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer)
      }

      searchDebounceTimer = setTimeout(() => {
        this.setQuery(this.searchInput)
        void this.getSearchResults()
      }, this.SEARCH_DEBOUNCE_MS)
    },

    setStoreFilter(storeId: string) {
      this.selectedStoreId = storeId || 'all'
      this.page = 1
      void this.getSearchResults()
    },

    setQuery(q: string) {
      this.query = q
      this.page = 1
    },

    setSortBy(sort: SearchSort) {
      this.sortBy = sort
      this.page = 1
      void this.getSearchResults()
    },

    setAvailability(availability: SearchAvailability) {
      this.availability = availability
      this.page = 1
      void this.getSearchResults()
    },

    setFiltersCleared() {
      this.searchInput = ''
      this.query = ''
      this.selectedStoreId = 'all'
      this.sortBy = 'relevance'
      this.availability = 'active'
      this.page = 1

      void this.getSearchResults()
    },

    setNextPage() {
      if (this.page < this.totalPages) {
        this.page += 1
        void this.getSearchResults()
      }
    },

    setNextPageWithScroll() {
      if (!this.getCanNext) return
      this.setNextPage()
      this.setScrollToTop()
    },

    setPrevPage() {
      if (this.page > 1) {
        this.page -= 1
        void this.getSearchResults()
      }
    },

    setPrevPageWithScroll() {
      if (!this.getCanPrev) return
      this.setPrevPage()
      this.setScrollToTop()
    },

    setPage(page: number) {
      this.page = Math.max(1, Math.min(page, this.totalPages))
      void this.getSearchResults()
    }
  }
})
