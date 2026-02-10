import { defineStore } from 'pinia'
import { useStores } from '~/composables/useStores'
import type { Store } from '~/types'

export const useStoresStore = defineStore('stores', {
  state: () => ({
    stores: [] as Store[],
    selectedStoreIds: [] as string[],
    loaded: false
  }),

  getters: {
    selectedStores: (state) => {
      return state.stores.filter(s => state.selectedStoreIds.includes(s.id))
    },

    getAllStoresIds: (state) => {
      return state.stores.map(s => s.id)
    },

    storesWithSelection: (state) => {
      return state.stores.map(store => ({
        ...store,
        selected: state.selectedStoreIds.includes(store.id)
      }))
    }
  },

  actions: {
    async loadStores() {
      if (this.loaded) return

      try {
        const { fetchStores } = useStores()
        this.stores = await fetchStores()
        // Select all stores by default
        this.selectedStoreIds = this.stores.map((s: Store) => s.id)
        this.loaded = true
      } catch (error) {
        console.error('Failed to load stores:', error)
      }
    },

    toggleStore(storeId: string) {
      const index = this.selectedStoreIds.indexOf(storeId)
      if (index > -1) {
        this.selectedStoreIds.splice(index, 1)
      } else {
        this.selectedStoreIds.push(storeId)
      }
    },

    selectAll() {
      this.selectedStoreIds = this.stores.map(s => s.id)
    },

    deselectAll() {
      this.selectedStoreIds = []
    }
  }
})
