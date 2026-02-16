import { useListsStore } from '~/stores/lists'
import { useShoppingListStore } from '~/stores/shoppingList'

type ListsSort = 'recent' | 'name' | 'total'

interface ListsPageControls {
  sort: ListsSort
  query: string
}

export const useLists = () => {
  const listsStore = useListsStore()
  const shoppingListStore = useShoppingListStore()

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
    shoppingListStore.setItems(list.items)
    shoppingListStore.openDrawer()
  }

  // Delete flow is client-only (uses window.confirm).
  const handleDeleteList = async (name: string) => {
    if (!process.client) return
    const ok = window.confirm(`Delete "${name}"?`)
    if (!ok) return
    await listsStore.deleteSavedList(name)
  }

  // Initial fetch when page/composable is mounted.
  onMounted(() => {
    refreshLists()
  })

  return {
    controls,
    filteredLists,
    loading: computed(() => listsStore.loading),
    error: computed(() => listsStore.error),
    refreshLists,
    handleOpenList,
    handleDeleteList
  }
}
