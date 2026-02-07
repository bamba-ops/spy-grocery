import { defineStore } from 'pinia'

type StoreItem = {
  id: string
  name: string | null
  slug: string | null
  image_url: string | null
}

export const useStoresStore = defineStore('stores', {
  state: () => ({
    stores: [] as StoreItem[],
    selectedStoreIds: [] as string[],
    loaded: false
  }),

  getters: {
    selectedStores: (state) => {
      return state.stores.filter(s => state.selectedStoreIds.includes(s.id))
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
        const response = await $fetch('/api/stores')
        if (response?.stores) {
          this.stores = response.stores.map((store: StoreItem) => ({
            id: store.id,
            name: store.name,
            slug: store.slug,
            image_url: store.image_url
          }))
          // Select all stores by default
          this.selectedStoreIds = this.stores.map((s: StoreItem) => s.id)
          this.loaded = true
        }
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
