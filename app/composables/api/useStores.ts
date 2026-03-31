import type { StoreFacet, StoreOverviewResponse } from '#shared/types'

interface StoresResponse {
  stores: StoreFacet[]
}

export const useStores = () => {
  const fetchStores = async (): Promise<StoreFacet[]> => {
    const response = await $fetch<StoresResponse>('/api/stores')
    return response?.stores || []
  }

  const fetchStoreOverview = async (storeSlug: string): Promise<StoreOverviewResponse> => {
    return $fetch<StoreOverviewResponse>(`/api/stores/${encodeURIComponent(storeSlug)}`)
  }

  return {
    fetchStores,
    fetchStoreOverview
  }
}
