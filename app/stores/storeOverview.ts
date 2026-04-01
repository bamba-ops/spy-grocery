import { defineStore } from 'pinia'
import type { SearchProduct, StoreOverviewResponse } from '#shared/types'
import { toSlug } from '#shared/utils/toSlug'

interface LoadOptions {
  throwOnError?: boolean
}

export const useStoreOverviewStore = defineStore('storeOverview', {
  state: () => ({
    storeSlug: '',
    storeName: '',
    productCount: 0,
    activeSpecialsCount: 0,
    lastUpdatedAt: null as string | null,
    latestPromos: [] as SearchProduct[],
    bestProducts: [] as SearchProduct[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    hasData: (state) => state.storeName.length > 0,
    hasLatestPromos: (state) => state.latestPromos.length > 0,
    hasBestProducts: (state) => state.bestProducts.length > 0,
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
