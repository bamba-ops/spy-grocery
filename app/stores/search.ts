import { defineStore } from 'pinia'
import type { Product, Store } from '#shared/types'
import type { ProductsQueryParams, SearchSort } from '#shared/types/search'

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
let heroSearchDebounceTimer: ReturnType<typeof setTimeout> | null = null

export const useSearchStore = defineStore('search', {
  state: () => ({
    stores: [] as Store[],
    storesLoaded: false,
    featuredProducts: [] as Product[],
    featuredLoading: false,
    featuredError: null as string | null,
    heroSearchInput: '',
    heroSearchResults: [] as Product[],
    heroSearchLoading: false,
    heroSearchError: null as string | null,
    HERO_SEARCH_LIMIT: 6,
    HERO_SEARCH_DEBOUNCE_MS: 250,
    searchInput: '',
    query: '',
    results: [] as Product[],
    total: 0,
    page: 1,
    limit: 50,
    sortBy: 'price-low' as SearchSort,
    loading: false,
    error: null as string | null,
    selectedStores: '' as string,
    showPromosOnly: false,
    SEARCH_DEBOUNCE_MS: 400
  }),


  getters: {
    getProducts: (state) => state.results,
    getFeaturedProducts: (state) => state.featuredProducts,
    getFeaturedHasResults: (state) => state.featuredProducts.length > 0,
    getHeroSearchResults: (state) => state.heroSearchResults,
    getHeroHasResults: (state) => state.heroSearchResults.length > 0,
    getIsLoading: (state) => state.loading,
    getHasError: (state) => Boolean(state.error),
    getActiveQuery: (state) => state.query || 'Organic Avocado',
    getCanPrev: (state) => state.page > 1,
    getCanNext: (state) => state.page < Math.ceil(state.total / state.limit),
    hasResults: (state) => state.results.length > 0,
    totalPages: (state) => Math.ceil(state.total / state.limit),
    offset: (state) => (state.page - 1) * state.limit,
    getAllStoreIds: (state) => state.stores.map((store) => store.id)
  },

  actions: {
    async getProductsByParams(params: ProductsQueryParams) {
      const { search } = useProducts()
      return await search(params)
    },

    async getFeaturedProductsByIds(ids: string[]) {
      const normalizedIds = ids
        .map((id) => id.trim())
        .filter(Boolean)

      if (normalizedIds.length === 0) {
        this.featuredProducts = []
        this.featuredError = null
        this.featuredLoading = false
        return
      }

      this.featuredLoading = true
      this.featuredError = null

      try {
        const { getFeaturedProducts } = useProducts()
        const response = await getFeaturedProducts(normalizedIds)
        this.featuredProducts = response?.products || []
      } catch (error: unknown) {
        this.featuredError = error instanceof Error ? error.message : 'Featured products fetch failed'
        this.featuredProducts = []
      } finally {
        this.featuredLoading = false
      }
    },

    setFeaturedProductsCleared() {
      this.featuredProducts = []
      this.featuredError = null
      this.featuredLoading = false
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
          sort: 'price-low',
          promos: 'false'
        })

        this.heroSearchResults = response?.products || []
      } catch (error: unknown) {
        this.heroSearchError = error instanceof Error ? error.message : 'Search failed'
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
          q: this.query,
          stores: this.selectedStores,
          sort: this.sortBy,
          limit: this.limit,
          offset: this.offset,
          promos: this.showPromosOnly ? 'true' : 'false'
        })
        this.results = response?.products || []
        this.total = response?.total || 0
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : 'Search failed'
        this.results = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    getFormattedPrice(price: number | null) {
      return formatPrice(price)
    },

    getProductImageDisplay(imageUrl: string | null, productName: string) {
      const { getImageDisplay } = useProducts()
      return getImageDisplay(imageUrl, productName)
    },

    setScrollToTop() {
      scrollToTop()
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

      if (!this.selectedStores) {
        this.selectedStores = this.getAllStoreIds.join(',')
      }

      if (this.results.length === 0 && !this.loading) {
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

    setStoreFilter(storeIds: string) {
      this.selectedStores = storeIds
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

    setPromosOnly(enabled: boolean) {
      this.showPromosOnly = enabled
      this.page = 1
      void this.getSearchResults()
    },

    setFiltersCleared() {
      this.searchInput = ''
      this.query = ''
      this.showPromosOnly = false
      this.selectedStores = this.getAllStoreIds.join(',')
      this.page = 1

      void this.getSearchResults()
    },

    setNextPage() {
      if (this.page < this.totalPages) {
        this.page++
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
        this.page--
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
