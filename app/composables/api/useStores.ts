import type { StoreFacet } from '#shared/types'

interface StoresResponse {
  stores: StoreFacet[]
}

export const useStores = () => {
  const fetchStores = async (): Promise<StoreFacet[]> => {
    const response = await $fetch<StoresResponse>('/api/stores')
    return response?.stores || []
  }

  return {
    fetchStores
  }
}
