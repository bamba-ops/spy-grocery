import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'
import type { Product } from '#shared/types'
import type { ListProduct, ListsProduct } from '#shared/types/lists'
import { useListsStorage } from '~/composables/useListsStorage'

type ListsSort = 'recent' | 'name' | 'total'
type ListsControls = {
  sort: ListsSort
  query: string
}

const getListItemsSnapshot = (items: ListProduct[]) => {
  const compact = items
    .map((item) => ({ id: item.product.id, quantity: item.quantity }))
    .sort((a, b) => a.id.localeCompare(b.id))

  return JSON.stringify(compact)
}

export const useListsStore = defineStore('lists', {
  state: () => ({
    productList: [] as ListProduct[],
    isShoppingListDrawerOpen: false,
    isClearConfirmModalOpen: false,
    isSaveModalOpen: false,
    setNameSeed: '',
    lastAddedProductId: null as string | null,
    multipleListsOfProducts: [] as ListsProduct[],
    listsControls: {
      sort: 'recent' as ListsSort,
      query: ''
    } as ListsControls,
    loading: false,
    isDeleteConfirmOpen: false,
    error: null as string | null,
    justSaved: false,
    setNameList: '' as string,
    currentListSourceName: null as string | null,
    currentListSourceSnapshot: '' as string,
    lastSaveError: null as string | null,
    ADD_FEEDBACK_MS: 300,
    SAVE_FEEDBACK_MS: 1200,
    listsStorage: useListsStorage()
  }),

  getters: {
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

    storeTotals: (state) => {
      return state.productList.reduce((totals, item) => {
        const storeName = item.product.store.name
        totals[storeName] = (totals[storeName] ?? 0) + (item.product.price ?? 0) * item.quantity
        return totals
      }, {} as Record<string, number>)
    },

    grandTotal: (state) => {
      return state.productList.reduce((total, item) => total + (item.product.price ?? 0) * item.quantity, 0)
    },

    itemCount: (state) => {
      return state.productList.reduce((total, item) => total + item.quantity, 0)
    },

    getIsCurrentListEmpty: (state) => {
      return state.productList.length === 0
    },

    filteredLists: (state) => {
      const query = state.listsControls.query.trim().toLowerCase()
      const base = query
        ? state.multipleListsOfProducts.filter((list) => list.name.toLowerCase().includes(query))
        : state.multipleListsOfProducts.slice()

      const listScore = (items: ListProduct[]) => {
        return items.reduce((acc, item) => acc + (item.product.price ?? 0) * item.quantity, 0)
      }

      base.sort((a, b) => {
        if (state.listsControls.sort === 'name') return a.name.localeCompare(b.name)
        if (state.listsControls.sort === 'total') return listScore(b.items) - listScore(a.items)
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })

      return base
    },

    getSaveActionLabel: (state) => {
      return state.currentListSourceName ? 'Update list' : 'Save list'
    },

    getCanSubmitList: (state) => {
      return state.productList.length > 0
    }
  },

  actions: {
    setProductInCurrentList(product: Product) {
      const existingProduct = this.productList.find((item) => item.product.id === product.id)
      if (existingProduct) {
        existingProduct.quantity += 1
      } else {
        this.productList.push({ product, quantity: 1 })
        this.setProductAddedToast(product)
      }

      this.lastAddedProductId = product.id

      setTimeout(() => {
        if (this.lastAddedProductId === product.id) {
          this.lastAddedProductId = null
        }
      }, this.ADD_FEEDBACK_MS)
    },

    setProductAddedToast(product: Product) {
      if (!process.client) return

      toast.success(product.name, {
        description: `${product.store.name} - added to your list.`
      })
    },

    setListSavedToast(name: string) {
      if (!process.client) return

      toast.success(name, {
        description: 'List saved successfully.'
      })
    },

    setListClearedToast() {
      if (!process.client) return

      toast.success('List cleared', {
        description: 'Your current list is now empty.'
      })
    },

    setListDeletedToast(name: string) {
      if (!process.client) return

      toast.success(name, {
        description: 'List deleted successfully.'
      })
    },

    setListUpdatedToast(name: string) {
      if (!process.client) return

      toast.success(name, {
        description: 'List updated successfully.'
      })
    },

    setProductQuantityInCurrentList(productId: string, quantity: number) {
      const item = this.productList.find((entry) => entry.product.id === productId)
      if (!item) return
      item.quantity = quantity
      if (item.quantity <= 0) {
        this.deleteProductFromCurrentList(productId)
      }
    },

    deleteProductFromCurrentList(productId: string) {
      this.productList = this.productList.filter((item) => item.product.id !== productId)
    },

    setToggleShoppingListDrawer() {
      this.isShoppingListDrawerOpen = !this.isShoppingListDrawerOpen
    },

    setShoppingListDrawerOpen() {
      this.isShoppingListDrawerOpen = true
    },

    setShoppingListDrawerClosed() {
      this.isShoppingListDrawerOpen = false
    },

    setClearConfirmModalOpen() {
      this.isClearConfirmModalOpen = true
    },

    setClearConfirmModalClosed() {
      this.isClearConfirmModalOpen = false
    },

    setSaveListModalOpen() {
      this.setNameSeed = this.currentListSourceName ?? ''
      if (!this.setNameSeed) {
        this.setUniqueSetNameSeed()
      }
      this.lastSaveError = null
      this.isSaveModalOpen = true
    },

    setSaveOrUpdateCurrentList() {
      if (this.currentListSourceName) {
        return this.setUpdatedCurrentList()
      }

      this.setSaveListModalOpen()
      return true
    },

    setUniqueSetNameSeed() {
      const adjectives = getAdjectives()
      const startIndex = Math.floor(Math.random() * adjectives.length)
      const datePart = new Date().toISOString().slice(0, 10)

      for (let offset = 0; offset < adjectives.length; offset += 1) {
        const adjective = adjectives[(startIndex + offset) % adjectives.length]
        const candidate = `Liste ${adjective} ${datePart}`
        if (!this.listsStorage.isNameListExist(candidate)) {
          this.setNameSeed = candidate
          return
        }
      }

      const fallbackAdjective = adjectives[startIndex]
      let suffix = 2
      let candidate = `Liste ${fallbackAdjective} ${datePart} (${suffix})`

      while (this.listsStorage.isNameListExist(candidate)) {
        suffix += 1
        candidate = `Liste ${fallbackAdjective} ${datePart} (${suffix})`
      }

      this.setNameSeed = candidate
    },

    setSaveListModalClosed() {
      this.isSaveModalOpen = false
      this.lastSaveError = null
    },

    setClearCurrentList() {
      this.setCurrentListItems([])
      this.setClearConfirmModalClosed()
      this.setListClearedToast()
    },

    setSavedFeedback() {
      this.justSaved = true
      setTimeout(() => {
        this.justSaved = false
      }, this.SAVE_FEEDBACK_MS)
    },

    async setSaveCurrentList(name: string) {
      const trimmed = name.trim()
      if (!trimmed) {
        this.lastSaveError = 'Please enter a list name.'
        return false
      }

      this.setNameList = trimmed
      this.lastSaveError = null

      const isCurrentListName = this.currentListSourceName === trimmed
      const ok = isCurrentListName
        ? this.setUpdatedListsStorage(trimmed)
        : this.setListsStorage(trimmed)

      if (!ok) return false

      this.setCurrentListItems([])
      this.currentListSourceName = null
      this.currentListSourceSnapshot = ''
      this.setSavedFeedback()
      this.setSaveListModalClosed()
      this.setListSavedToast(trimmed)
      return true
    },

    setUpdatedCurrentList() {
      if (!this.currentListSourceName) return false
      if (!this.getCanSubmitList) return false

      const ok = this.setUpdatedListsStorage(this.currentListSourceName)
      if (!ok) return false

      this.currentListSourceSnapshot = getListItemsSnapshot(this.productList)
      this.setSavedFeedback()
      this.setListUpdatedToast(this.currentListSourceName)
      return true
    },

    setCurrentListItems(items: ListProduct[]) {
      this.productList = items
    },

    setListsControls(controls: ListsControls) {
      this.listsControls = controls
    },

    async getListsStorage() {
      this.loading = true
      this.error = null

      try {
        const saved = this.listsStorage.getListsStorageItems()
        this.multipleListsOfProducts = saved.map((list) => ({
          id: list.name,
          name: list.name,
          items: list.items as ListProduct[],
          createdAt: new Date(list.savedAt),
          updatedAt: new Date(list.savedAt)
        }))
      } catch {
        this.error = 'Could not load lists storage.'
      } finally {
        this.loading = false
      }
    },

    setListsStorage(name: string) {
      const items = this.productList.map((item) => ({ product: item.product, quantity: item.quantity }))
      const result = this.listsStorage.setListStorageItem(name, items as unknown[])

      if (!result.ok) {
        this.lastSaveError = result.error === 'duplicate_name'
          ? 'A list with that name already exists.'
          : 'Could not save the list.'
        return false
      }

      this.getListsStorage()
      return true
    },

    setUpdatedListsStorage(name: string) {
      const items = this.productList.map((item) => ({ product: item.product, quantity: item.quantity }))
      const result = this.listsStorage.setUpdatedListStorageItemByName(name, items as unknown[])
      if (!result.ok) {
        this.lastSaveError = 'Could not save the list.'
        return false
      }

      this.getListsStorage()
      return true
    },

    async deleteListsStorageByName(name: string) {
      const ok = this.listsStorage.deleteListStorageItemByName(name)
      if (!ok) {
        this.error = 'Could not delete this list.'
        return false
      }

      if (this.currentListSourceName === name) {
        this.currentListSourceName = null
        this.currentListSourceSnapshot = ''
      }

      await this.getListsStorage()
      this.setListDeletedToast(name)
      return true
    },

    getListsStorageByName(name: string) {
      const list = this.listsStorage.getListStorageItemByName(name)
      if (!list) return null

      return {
        id: list.name,
        name: list.name,
        items: list.items as ListProduct[],
        createdAt: new Date(list.savedAt),
        updatedAt: new Date(list.savedAt)
      } as ListsProduct
    },

    setCurrentListFromStorageByName(name: string) {
      const list = this.getListsStorageByName(name)
      if (!list || !Array.isArray(list.items)) return false

      this.setCurrentListItems(list.items)
      this.currentListSourceName = list.name
      this.currentListSourceSnapshot = getListItemsSnapshot(list.items)
      this.setShoppingListDrawerOpen()
      return true
    },

    async setLoadListsPage() {
      await this.getListsStorage()
    }
  }
})
