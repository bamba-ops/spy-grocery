import { defineStore } from 'pinia'
import type { Product } from '#shared/types'
import type { ListProduct, ListsProduct } from '#shared/types/lists'

const ERROR_MESSAGES = {
  duplicateName: 'A list with that name already exists. Choose another.',
  saveFailed: 'Could not save the list. Please try again.',
  deleteFailed: 'Could not delete this list.'
} as const

// Converts a low-level storage write result into a user-facing message.
// Duplicate-name gets a specific message; everything else uses the provided fallback.
const mapWriteResultToError = (result: SavedListWriteResult, fallback: string) => {
  void result
  // TODO(exercise): map low-level storage errors to UI-friendly messages.
  return fallback
}

export const useListsStore = defineStore('lists', {
  state: () => ({
    // Like a cart, but for lists.
    productList: [] as ListProduct[],
    isOpen: false,
    isClearConfirmModalOpen: false,
    isSaveModalOpen: false,
    saveNameSeed: '',
    lastAddedProductId: null as string | null,
    // Saved lists dataset displayed on /lists page.
    multipleListsOfProducts: [] as ListsProduct[],
    // Async state for fetching/deleting saved lists.
    loading: false,
    error: null as string | null,
    // Save flow feedback state used by SaveListModal and Save button UI.
    justSaved: false,
    lastSavedName: null as string | null,
    lastSaveError: null as string | null,
    ADD_FEEDBACK_MS: 300,
    SAVE_FEEDBACK_MS: 1200
  }),

  getters: {
    // Group current list items by store name for panel/drawer rendering.
    groupedItems: (state) => {
      return state.productList.reduce((groups, item) => {
        const storeName = item.product.store.name
        if (!groups[storeName]) {
          groups[storeName] = []
        }
        groups[storeName].push(item)
        return groups
      }, {} as Record<string, ListProduct[]>)
    },

    // Subtotals per store for the current working list.
    storeTotals: (state) => {
      return state.productList.reduce((totals, item) => {
        const storeName = item.product.store.name
        totals[storeName] = (totals[storeName] ?? 0) + (item.product.price ?? 0) * item.quantity
        return totals
      }, {} as Record<string, number>)
    },

    // Grand total for the current list.
    grandTotal: (state) => {
      return state.productList.reduce((total, item) => total + (item.product.price ?? 0) * item.quantity, 0)
    },

    // Quantity sum for badge/counters.
    itemCount: (state) => {
      return state.productList.reduce((total, item) => total + item.quantity, 0)
    }
  },

  actions: {
    addProductToList(product: Product) {
      this.addProduct(product)
      this.lastAddedProductId = product.id

      setTimeout(() => {
        if (this.lastAddedProductId === product.id) {
          this.lastAddedProductId = null
        }
      }, this.ADD_FEEDBACK_MS)
    },

    updateProductQuantity(productId: string, quantity: number) {
      const item = this.productList.find((entry) => entry.product.id === productId)
      if (!item) return
      item.quantity = quantity
      if (item.quantity <= 0) {
        this.removeProductFromList(productId)
      }
    },

    addProduct(product: Product) {
      const existingProduct = this.productList.find((item) => item.product.id === product.id)
      if (existingProduct) {
        existingProduct.quantity += 1
      } else {
        this.productList.push({ product, quantity: 1 })
      }
    },

    isExistProduct(product: Product) {
      return this.productList.some((item) => item.product.id === product.id)
    },

    removeProductFromList(productId: string) {
      void productId
      // TODO(exercise): remove one product row by id.
      this.productList = this.productList.filter((item) => item.product.id !== productId)
    },

    updateQuantity(productId: string, quantity: number) {
      const item = this.productList.find((entry) => entry.product.id === productId)
      if (!item) return
      item.quantity = quantity
      if (item.quantity <= 0) {
        this.removeProductFromList(productId)
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

    openClearConfirmModal() {
      this.isClearConfirmModalOpen = true
    },

    closeClearConfirmModal() {
      this.isClearConfirmModalOpen = false
    },

    openSave() {
      const today = new Date().toISOString().slice(0, 10)
      this.saveNameSeed = this.lastSavedName ?? `List ${today}`
      this.isSaveModalOpen = true
    },

    closeSave() {
      this.isSaveModalOpen = false
      this.clearSaveError()
    },

    handleClear() {
      this.clearCurrentList()
      this.closeClearConfirmModal()
    },

    async handleSave(name: string) {
      const ok = this.saveListFromItems(name, this.productList)
      if (!ok) return false

      this.closeSave()
      return true
    },

    clearCurrentList() {
      this.productList = []
    },

    setItems(items: ListProduct[]) {
      this.productList = items
    },

    // Triggers the temporary "Saved" visual state.
    triggerSavedFeedback() {
      void this.SAVE_FEEDBACK_MS
      // TODO(exercise): temporary "saved" feedback state.
    },

    // Clears the last save error before opening/closing save modal.
    clearSaveError() {
      // TODO(exercise): clear latest save error.
    },

    // Loads all saved lists from storage into store state.
    // This is the single entry point for refreshing the /lists data view.
    async fetchSavedLists() {
      // TODO(exercise): load saved lists from storage and set loading/error states.
    },

    // Saves the current shopping-list items under a user-provided name.
    // Returns false for invalid/duplicate/storage errors and sets lastSaveError.
    saveListFromItems(name: string, items: ListProduct[]) {
      void name
      void items
      void mapWriteResultToError
      void ERROR_MESSAGES
      // TODO(exercise): validate name, persist list, set feedback/error fields.
      return false
    },

    // Reads one saved list by name from storage.
    // Used when the user clicks a card to load it into the current shopping list.
    findSavedList(name: string) {
      void name
      // TODO(exercise): load one saved list from storage by name.
      return null as ListProduct | null
    },

    // Deletes one saved list by name, then refreshes store state.
    // Keeps /lists UI in sync after deletion.
    async deleteSavedList(name: string) {
      void name
      // TODO(exercise): delete one saved list + refresh state.
      return false
    }
  }
})
