import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'
import type { Product } from '#shared/types'
import type {
  ListProduct,
  ListStorage,
  ListsProduct,
  PersistedList
} from '#shared/types/lists'
import { useLists } from '~/composables/api/useLists'
import { useListsStorage } from '~/composables/local/useListsStorage'
import { useAuthStore } from '~/stores/auth'

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

const toUiListFromStorage = (list: ListStorage): ListsProduct => ({
  id: list.name,
  name: list.name,
  items: list.items as ListProduct[],
  createdAt: new Date(list.savedAt),
  updatedAt: new Date(list.savedAt)
})

const toUiListFromPersisted = (list: PersistedList): ListsProduct => ({
  id: list.id,
  name: list.name,
  items: list.items,
  createdAt: new Date(list.createdAt),
  updatedAt: new Date(list.updatedAt)
})

const toStorageListFromPersisted = (list: PersistedList): ListStorage => ({
  name: list.name,
  items: list.items,
  savedAt: list.updatedAt
})

const getApiErrorMessage = (value: unknown, fallback: string): string => {
  if (!value || typeof value !== 'object') {
    return fallback
  }

  const maybeError = value as {
    data?: { message?: unknown }
    message?: unknown
  }

  if (typeof maybeError.data?.message === 'string' && maybeError.data.message.trim()) {
    return maybeError.data.message.trim()
  }

  if (typeof maybeError.message === 'string' && maybeError.message.trim()) {
    return maybeError.message.trim()
  }

  return fallback
}

const toListProducts = (items: unknown[]) => {
  return items as ListProduct[]
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
    currentListSourceId: null as string | null,
    currentListSourceName: null as string | null,
    currentListSourceSnapshot: '' as string,
    lastSaveError: null as string | null,
    ADD_FEEDBACK_MS: 300,
    SAVE_FEEDBACK_MS: 1200,
    listsStorage: useListsStorage(),
    listsApi: useLists(),
    isSyncingLocalToDb: false
  }),

  getters: {
    groupedItems: (state) => {
      return state.productList.reduce((groups, item) => {
        const storeName = item.product.store
        if (!groups[storeName]) {
          groups[storeName] = []
        }
        groups[storeName].push(item)
        return groups
      }, {} as Record<string, ListProduct[]>)
    },

    storeTotals: (state) => {
      return state.productList.reduce((totals, item) => {
        const storeName = item.product.store
        totals[storeName] = (totals[storeName] ?? 0) + (item.product.price_num ?? 0) * item.quantity
        return totals
      }, {} as Record<string, number>)
    },

    grandTotal: (state) => {
      return state.productList.reduce((total, item) => total + (item.product.price_num ?? 0) * item.quantity, 0)
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
        return items.reduce((acc, item) => acc + (item.product.price_num ?? 0) * item.quantity, 0)
      }

      base.sort((a, b) => {
        if (state.listsControls.sort === 'name') return a.name.localeCompare(b.name)
        if (state.listsControls.sort === 'total') return listScore(b.items) - listScore(a.items)
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })

      return base
    },

    getSaveActionLabel: (state) => {
      return state.currentListSourceName ? 'Mettre a jour la liste' : 'Enregistrer la liste'
    },

    getCanSubmitList: (state) => {
      return state.productList.length > 0
    }
  },

  actions: {
    async getCurrentAuthUser() {
      const authStore = useAuthStore()

      if (!authStore.isReady) {
        await authStore.initAuth()
      }

      return authStore.user
    },

    getSavedListByName(name: string) {
      const trimmedName = name.trim()
      if (!trimmedName) return null

      return this.multipleListsOfProducts.find((list) => list.name === trimmedName) || null
    },

    setLoadListsFromLocalStorage() {
      const saved = this.listsStorage.getListsStorageItems()
      this.multipleListsOfProducts = saved.map(toUiListFromStorage)
    },

    setSyncCurrentListSourceWithSavedLists() {
      if (!this.currentListSourceName) {
        return
      }

      const matched = this.multipleListsOfProducts.find((list) => list.name === this.currentListSourceName)

      if (!matched) {
        this.currentListSourceId = null
        this.currentListSourceName = null
        this.currentListSourceSnapshot = ''
        return
      }

      this.currentListSourceId = matched.id
    },

    setListsSyncedToast(created: number, updated: number, deleted: number) {
      if (!import.meta.client) {
        return
      }

      const parts: string[] = []

      if (created > 0) {
        parts.push(`${created} creees`)
      }

      if (updated > 0) {
        parts.push(`${updated} mises a jour`)
      }

      if (deleted > 0) {
        parts.push(`${deleted} supprimees`)
      }

      if (parts.length === 0) {
        return
      }

      toast.success('Listes synchronisees', {
        description: parts.join(', ')
      })
    },

    setListsSyncErrorToast() {
      if (!import.meta.client) {
        return
      }

      toast.error('Impossible de synchroniser les listes locales', {
        description: 'Vos changements locaux sont conserves et seront reessayes plus tard.'
      })
    },

    async setSyncLocalListsToApi(options?: { silent?: boolean }) {
      const authUser = await this.getCurrentAuthUser()
      if (!authUser) {
        return false
      }

      if (this.isSyncingLocalToDb) {
        return true
      }

      this.error = null
      this.isSyncingLocalToDb = true

      try {
        const localLists = this.listsStorage.getListsStorageItems()
        const deletedNames = this.listsStorage.getDeletedListsStorageNames()
        const remoteLists = await this.listsApi.getLists()
        const remoteByName = new Map(remoteLists.map((list) => [list.name, list]))

        let created = 0
        let updated = 0
        let deleted = 0

        for (const deletedName of deletedNames) {
          const name = deletedName.trim()
          if (!name) {
            continue
          }

          const existingRemoteList = remoteByName.get(name)
          if (!existingRemoteList) {
            continue
          }

          await this.listsApi.deleteList(existingRemoteList.id)
          remoteByName.delete(name)
          deleted += 1
        }

        for (const localList of localLists) {
          const name = localList.name.trim()
          if (!name) {
            continue
          }

          const localItems = toListProducts(localList.items)
          const existingRemoteList = remoteByName.get(name)

          if (!existingRemoteList) {
            const createdList = await this.listsApi.createList({
              name,
              items: localItems
            })

            remoteByName.set(createdList.name, createdList)
            created += 1
            continue
          }

          const localSnapshot = getListItemsSnapshot(localItems)
          const remoteSnapshot = getListItemsSnapshot(existingRemoteList.items)

          if (localSnapshot === remoteSnapshot) {
            continue
          }

          const updatedList = await this.listsApi.updateList(existingRemoteList.id, {
            name,
            items: localItems
          })

          remoteByName.set(updatedList.name, updatedList)
          updated += 1
        }

        const latestRemoteLists = await this.listsApi.getLists()
        this.multipleListsOfProducts = latestRemoteLists.map(toUiListFromPersisted)
        this.listsStorage.setReplaceListsStorageItems(
          latestRemoteLists.map(toStorageListFromPersisted),
          { clearDeletedNames: true }
        )
        this.setSyncCurrentListSourceWithSavedLists()

        if (!options?.silent) {
          this.setListsSyncedToast(created, updated, deleted)
        }

        return true
      } catch (error) {
        this.error = getApiErrorMessage(error, 'Impossible de synchroniser les listes locales.')
        this.setLoadListsFromLocalStorage()
        this.setSyncCurrentListSourceWithSavedLists()

        if (!options?.silent) {
          this.setListsSyncErrorToast()
        }

        return false
      } finally {
        this.isSyncingLocalToDb = false
      }
    },

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
      if (!import.meta.client) return

      toast.success(product.title, {
        description: `${product.store} - ajoute a votre liste.`
      })
    },

    setListSavedToast(name: string) {
      if (!import.meta.client) return

      toast.success(name, {
        description: 'Liste enregistree avec succes.'
      })
    },

    setListClearedToast() {
      if (!import.meta.client) return

      toast.success('Liste videe', {
        description: 'Votre liste courante est maintenant vide.'
      })
    },

    setListDeletedToast(name: string) {
      if (!import.meta.client) return

      toast.success(name, {
        description: 'Liste supprimee avec succes.'
      })
    },

    setListUpdatedToast(name: string) {
      if (!import.meta.client) return

      toast.success(name, {
        description: 'Liste mise a jour avec succes.'
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

    async setSaveOrUpdateCurrentList() {
      const authUser = await this.getCurrentAuthUser()

      if (!authUser) {
        const authStore = useAuthStore()

        authStore.setOpenAuthPrompt({
          title: 'Enregistrez vos listes d\'epicerie',
          description: 'Connectez-vous pour garder vos listes synchronisees, reutilisables et pretes a votre retour.',
          nextPath: '/lists',
          ctaLabel: 'Connexion pour enregistrer'
        })

        return false
      }

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
        this.lastSaveError = 'Veuillez entrer un nom de liste.'
        return false
      }

      this.setNameList = trimmed
      this.lastSaveError = null

      const isCurrentListName = this.currentListSourceName === trimmed
      const ok = isCurrentListName
        ? await this.setUpdatedListsStorage(trimmed)
        : await this.setListsStorage(trimmed)

      if (!ok) return false

      this.setCurrentListItems([])
      this.currentListSourceId = null
      this.currentListSourceName = null
      this.currentListSourceSnapshot = ''
      this.setSavedFeedback()
      this.setSaveListModalClosed()
      this.setListSavedToast(trimmed)
      return true
    },

    async setUpdatedCurrentList() {
      if (!this.currentListSourceName) return false
      if (!this.getCanSubmitList) return false

      const ok = await this.setUpdatedListsStorage(this.currentListSourceName)
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
        const authUser = await this.getCurrentAuthUser()

        if (authUser) {
          const synced = await this.setSyncLocalListsToApi({ silent: true })

          if (!synced) {
            this.setLoadListsFromLocalStorage()
          }

          return
        }

        this.setLoadListsFromLocalStorage()
      } catch {
        this.error = 'Impossible de charger le stockage des listes.'
      } finally {
        this.loading = false
      }
    },

    async setListsStorage(name: string) {
      const items = this.productList.map((item) => ({ product: item.product, quantity: item.quantity }))
      const result = this.listsStorage.setListStorageItem(name, items as unknown[])

      if (!result.ok) {
        this.lastSaveError = result.error === 'duplicate_name'
          ? 'Une liste avec ce nom existe deja.'
          : 'Impossible d\'enregistrer la liste.'
        return false
      }

      this.setLoadListsFromLocalStorage()

      const authUser = await this.getCurrentAuthUser()
      if (authUser) {
        await this.setSyncLocalListsToApi()
      }

      const savedList = this.getSavedListByName(name)
      if (savedList) {
        this.currentListSourceId = savedList.id
      }

      return true
    },

    async setUpdatedListsStorage(name: string) {
      const items = this.productList.map((item) => ({ product: item.product, quantity: item.quantity }))
      const result = this.listsStorage.setUpdatedListStorageItemByName(name, items as unknown[])
      if (!result.ok) {
        this.lastSaveError = 'Impossible d\'enregistrer la liste.'
        return false
      }

      this.setLoadListsFromLocalStorage()

      const authUser = await this.getCurrentAuthUser()
      if (authUser) {
        await this.setSyncLocalListsToApi()
      }

      const savedList = this.getSavedListByName(name)
      if (savedList) {
        this.currentListSourceId = savedList.id
      }

      return true
    },

    async deleteListsStorageByName(name: string) {
      const ok = this.listsStorage.deleteListStorageItemByName(name)
      if (!ok) {
        this.error = 'Impossible de supprimer cette liste.'
        return false
      }

      if (this.currentListSourceName === name) {
        this.currentListSourceId = null
        this.currentListSourceName = null
        this.currentListSourceSnapshot = ''
      }

      this.setLoadListsFromLocalStorage()

      const authUser = await this.getCurrentAuthUser()
      if (authUser) {
        await this.setSyncLocalListsToApi()
      }

      this.setListDeletedToast(name)
      return true
    },

    getListsStorageByName(name: string) {
      const fromState = this.getSavedListByName(name)
      if (fromState) {
        return fromState
      }

      const fromStorage = this.listsStorage.getListStorageItemByName(name)
      if (!fromStorage) return null

      return toUiListFromStorage(fromStorage)
    },

    setCurrentListFromStorageByName(name: string) {
      const list = this.getListsStorageByName(name)
      if (!list || !Array.isArray(list.items)) return false

      this.setCurrentListItems(list.items)
      this.currentListSourceId = list.id
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
