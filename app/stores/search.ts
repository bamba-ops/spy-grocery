import { defineStore } from 'pinia'
import type { Product } from '~/types'
import { useProducts } from '~/composables/useProducts'

export const useSearchStore = defineStore('search', {
  state: () => ({
    query: '',
    results: [] as Product[],
    total: 0,
    page: 1,
    limit: 50,
    sortBy: 'price-low' as 'price-low' | 'price-high' | 'name',
    loading: false,
    error: null as string | null,
    selectedStores: '' as string, // Store the selected store IDs here to avoid circular dependency
    showPromosOnly: false,
  }),

  getters: {
    hasResults: (state) => state.results.length > 0,
    totalPages: (state) => Math.ceil(state.total / state.limit),
    offset: (state) => (state.page - 1) * state.limit
  },

  actions: {
    async search() {
      this.loading = true
      this.error = null

      try {
        const { search } = useProducts()
        const response = await search({
          q: this.query,
          stores: this.selectedStores,
          sort: this.sortBy,
          limit: this.limit,
          offset: this.offset,
          promos: this.showPromosOnly ? 'true' : 'false'
        })
        this.results = response?.products || []
        this.total = response?.total || 0
      } catch (e: any) {
        this.error = e.message || 'Search failed'
        this.results = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    setSelectedStores(storeIds: string) {
      this.selectedStores = storeIds
    },

    setQuery(q: string) {
      this.query = q
      this.page = 1
    },

    setSortBy(sort: 'price-low' | 'price-high' | 'name') {
      this.sortBy = sort
      this.page = 1
      this.search()
    },

    nextPage() {
      if (this.page < this.totalPages) {
        this.page++
        this.search()
      }
    },

    prevPage() {
      if (this.page > 1) {
        this.page--
        this.search()
      }
    },

    goToPage(page: number) {
      this.page = Math.max(1, Math.min(page, this.totalPages))
      this.search()
    }
  }
})
