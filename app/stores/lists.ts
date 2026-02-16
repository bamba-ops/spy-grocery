import { defineStore } from 'pinia'
import type { Product } from '#shared/types'
import type { CartItem, SavedList } from '#shared/types/lists'

const ADD_FEEDBACK_MS = 300
const SAVE_FEEDBACK_MS = 1200

const ERROR_MESSAGES = {
  duplicateName: 'A list with that name already exists. Choose another.',
  saveFailed: 'Could not save the list. Please try again.',
  deleteFailed: 'Could not delete this list.'
} as const

// Converts a low-level storage write result into a user-facing message.
// Duplicate-name gets a specific message; everything else uses the provided fallback.
const mapWriteResultToError = (result: SavedListWriteResult, fallback: string) => {
  if (result.ok) return null
  return result.reason === 'duplicate_name' ? ERROR_MESSAGES.duplicateName : fallback
}

export const useListsStore = defineStore('lists', {
  state: () => ({
    // Current working compare list (cart-like state).
    items: [] as CartItem[],
    isOpen: false,
    justAdded: false,

    // Saved lists dataset displayed on /lists page.
    savedLists: [] as SavedList[],
    // Async state for fetching/deleting saved lists.
    loading: false,
    error: null as string | null,
    // Save flow feedback state used by SaveListModal and Save button UI.
    justSaved: false,
    lastSavedName: null as string | null,
    lastSaveError: null as string | null
  }),

  getters: {
    // Group current list items by store name for panel/drawer rendering.
    groupedItems: (state) => {
      const groups: Record<string, CartItem[]> = {}
      state.items.forEach((item) => {
        const store = item.product.store.name
        if (!groups[store]) {
          groups[store] = []
        }
        groups[store].push(item)
      })
      return groups
    },

    // Subtotals per store for the current working list.
    storeTotals: (state) => {
      const totals: Record<string, number> = {}
      state.items.forEach((item) => {
        const store = item.product.store.name
        if (!totals[store]) {
          totals[store] = 0
        }
        const price = item.product.price || 0
        totals[store] += price * item.quantity
      })
      return totals
    },

    // Grand total for the current list.
    grandTotal: (state) => {
      return state.items.reduce((total, item) => {
        const price = item.product.price || 0
        return total + price * item.quantity
      }, 0)
    },

    // Quantity sum for badge/counters.
    itemCount: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    }
  },

  actions: {
    addItem(product: Product) {
      const existingItem = this.items.find((item) => item.product.id === product.id)
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({ product, quantity: 1 })
      }

      this.justAdded = true
      setTimeout(() => {
        this.justAdded = false
      }, ADD_FEEDBACK_MS)
    },

    removeItem(productId: string) {
      const index = this.items.findIndex((item) => item.product.id === productId)
      if (index !== -1) {
        this.items.splice(index, 1)
      }
    },

    updateQuantity(productId: string, quantity: number) {
      const item = this.items.find((item) => item.product.id === productId)
      if (!item) return

      item.quantity = quantity
      if (item.quantity <= 0) {
        this.removeItem(productId)
      }
    },

    toggleDrawer() {
      this.isOpen = !this.isOpen
    },

    openDrawer() {
      this.isOpen = true
    },

    closeDrawer() {
      this.isOpen = false
    },

    clearList() {
      this.items = []
    },

    setItems(items: CartItem[]) {
      this.items = items
    },

    // Triggers the temporary "Saved" visual state.
    triggerSavedFeedback() {
      this.justSaved = true
      setTimeout(() => {
        this.justSaved = false
      }, SAVE_FEEDBACK_MS)
    },

    // Clears the last save error before opening/closing save modal.
    clearSaveError() {
      this.lastSaveError = null
    },

    // Loads all saved lists from storage into store state.
    // This is the single entry point for refreshing the /lists data view.
    async fetchSavedLists() {
      this.loading = true
      this.error = null

      try {
        this.savedLists = getSavedLists() as SavedList[]
      } catch {
        this.error = 'Could not load saved lists.'
      } finally {
        this.loading = false
      }
    },

    // Saves the current shopping-list items under a user-provided name.
    // Returns false for invalid/duplicate/storage errors and sets lastSaveError.
    saveListFromItems(name: string, items: CartItem[]) {
      const trimmed = name.trim()
      if (!trimmed) return false

      const result = saveNamedList(trimmed, items as unknown[])
      if (!result.ok) {
        this.lastSaveError = mapWriteResultToError(result, ERROR_MESSAGES.saveFailed)
        return false
      }

      this.lastSavedName = trimmed
      this.lastSaveError = null
      this.triggerSavedFeedback()
      return true
    },

    // Reads one saved list by name from storage.
    // Used when the user clicks a card to load it into the current shopping list.
    findSavedList(name: string) {
      const list = loadSavedListByName(name)
      if (!list || !Array.isArray(list.items)) return null
      return list as SavedList
    },

    // Deletes one saved list by name, then refreshes store state.
    // Keeps /lists UI in sync after deletion.
    async deleteSavedList(name: string) {
      this.error = null

      try {
        const ok = deleteSavedListByName(name)
        if (!ok) {
          this.error = ERROR_MESSAGES.deleteFailed
          return false
        }

        await this.fetchSavedLists()
        return true
      } catch {
        this.error = ERROR_MESSAGES.deleteFailed
        return false
      }
    }
  }
})
