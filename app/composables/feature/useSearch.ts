import { useDebounceFn } from '@vueuse/core'
import { useSearchStore } from '~/stores/search'
import { useStoresStore } from '~/stores/stores'

export const useSearch = () => {
  const searchStore = useSearchStore()
  const storesStore = useStoresStore()

  // Shared query input model for search UI controls.
  const searchInput = useState<string>('search-input', () => searchStore.query)

  const runSearch = async () => {
    await searchStore.search()
  }

  const runSearchDebounced = useDebounceFn(async () => {
    searchStore.setQuery(searchInput.value)
    await runSearch()
  }, 400)

  const initSearchPage = async () => {
    await storesStore.loadStores()

    if (!searchStore.selectedStores) {
      searchStore.setStoreFilter(storesStore.getAllStoresIds.join(','))
    }

    if (searchStore.results.length === 0 && !searchStore.loading) {
      await runSearch()
    }
  }

  const updateSearchInput = (value: string) => {
    searchInput.value = value
    runSearchDebounced()
  }

  const updateSort = async (sort: 'price-low' | 'price-high' | 'name') => {
    searchStore.setSortBy(sort)
  }

  const updateStoreFilter = async (storeIds: string) => {
    searchStore.setStoreFilter(storeIds)
    await runSearch()
  }

  const updatePromosOnly = async (enabled: boolean) => {
    searchStore.setPromosOnly(enabled)
    await runSearch()
  }

  const clearAllFilters = async () => {
    searchInput.value = ''
    searchStore.setQuery('')
    searchStore.setPromosOnly(false)
    searchStore.setStoreFilter(storesStore.getAllStoresIds.join(','))
    await runSearch()
  }

  return {
    searchInput,
    runSearch,
    initSearchPage,
    updateSearchInput,
    updateSort,
    updateStoreFilter,
    updatePromosOnly,
    clearAllFilters
  }
}
