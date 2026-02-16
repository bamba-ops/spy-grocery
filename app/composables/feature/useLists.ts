import { useListsStore } from '~/stores/lists'

type ListsSort = 'recent' | 'name' | 'total'

interface ListsPageControls {
  sort: ListsSort
  query: string
}

interface UseListsOptions {
  // Optional hook for UI-specific side effects after a successful save
  // (example: close the right drawer before redirecting).
  afterSave?: () => void | Promise<void>
}

export const useLists = (options: UseListsOptions = {}) => {
  const listsStore = useListsStore()

  // UI controls for the Lists page:
  // - sort drives ordering strategy
  // - query drives name filtering
  const controls = ref<ListsPageControls>({
    sort: 'recent',
    query: ''
  })

  // Computes the estimated total of a saved list.
  // Each row contributes: unit price (or 0 if missing) * quantity.
  const listScore = (items: { product: { price: number | null }; quantity: number }[]) => {
    return items.reduce((acc, item) => acc + (item.product.price ?? 0) * item.quantity, 0)
  }

  // Pipeline:
  // 1) Normalize query (trim + lowercase)
  // 2) Filter by list name if query is not empty
  // 3) Sort according to selected mode:
  //    - name: alphabetical
  //    - total: highest estimated total first
  //    - recent: latest savedAt first
  const filteredLists = computed(() => {
    const q = controls.value.query.trim().toLowerCase()
    const base = q
      ? listsStore.savedLists.filter((list) => list.name.toLowerCase().includes(q))
      : listsStore.savedLists.slice()

    const sort = controls.value.sort
    base.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'total') return listScore(b.items) - listScore(a.items)
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    })

    return base
  })

  // Reloads persisted saved lists into the lists store.
  const refreshLists = async () => {
    await listsStore.fetchSavedLists()
  }

  // Opens one saved list into the current working shopping list.
  const handleOpenList = (name: string) => {
    const list = listsStore.findSavedList(name)
    if (!list || !Array.isArray(list.items)) return
    listsStore.setItems(list.items)
    listsStore.openDrawer()
  }

  // Delete flow is client-only (uses window.confirm).
  const handleDeleteList = async (name: string) => {
    if (!process.client) return
    const ok = window.confirm(`Delete "${name}"?`)
    if (!ok) return
    await listsStore.deleteSavedList(name)
  }

  // Local UI state for the save modal.
  const isSaveModalOpen = ref(false)

  // Seed list name with last used value or today's fallback.
  const getDefaultListName = () => {
    const today = new Date().toISOString().slice(0, 10)
    return listsStore.lastSavedName ?? `List ${today}`
  }

  const saveNameSeed = ref(getDefaultListName())

  // Open modal and reset validation state each time.
  const openSave = () => {
    listsStore.clearSaveError()
    saveNameSeed.value = getDefaultListName()
    isSaveModalOpen.value = true
  }

  // Close modal and clear save errors to avoid stale feedback.
  const closeSave = () => {
    listsStore.clearSaveError()
    isSaveModalOpen.value = false
  }

  // Save flow used by search panel + drawer:
  // 1) persist named list, 2) clear current cart, 3) refresh saved lists,
  // 4) run optional UI callback, 5) go to /lists.
  const handleSave = async (name: string) => {
    const ok = listsStore.saveListFromItems(name, listsStore.items)
    if (!ok) return false

    isSaveModalOpen.value = false
    listsStore.clearList()
    await listsStore.fetchSavedLists()

    if (options.afterSave) {
      await options.afterSave()
    }

    await navigateTo('/lists')
    return true
  }

  // Clear current cart with explicit user confirmation.
  const handleClear = () => {
    if (!process.client) return
    const ok = window.confirm('Clear the current list?')
    if (!ok) return
    listsStore.clearList()
  }

  return {
    controls,
    filteredLists,
    loading: computed(() => listsStore.loading),
    error: computed(() => listsStore.error),
    refreshLists,
    handleOpenList,
    handleDeleteList,
    isSaveModalOpen,
    saveNameSeed,
    openSave,
    closeSave,
    handleSave,
    handleClear
  }
}
