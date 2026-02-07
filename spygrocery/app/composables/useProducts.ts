import type { SearchParams } from '~/types'

export const useProducts = () => {
  const search = (params: SearchParams) => {
    return useFetch('/api/products/search', {
      query: params,
      key: `products-${JSON.stringify(params)}`
    })
  }

  return {
    search
  }
}
