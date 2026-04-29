import type { SearchAvailability, SearchSort } from '#shared/types/search'
import { searchProductsRows } from '../../repositories/productsRepository'
import { toSearchProduct } from './toSearchProduct'

interface SearchProductsParams {
  supabase: any
  searchQuery: string
  store: string
  sortBy: SearchSort
  availability: SearchAvailability
  limit: number
  offset: number
}

const toPagination = (offset: number, limit: number, total: number) => ({
  page: Math.floor(offset / limit) + 1,
  limit,
  totalPages: Math.ceil(total / limit)
})

const getSearchRowsByAvailability = (
  supabase: any,
  params: Omit<SearchProductsParams, 'availability'>,
  availability: Exclude<SearchAvailability, 'all'>
) => {
  return searchProductsRows(supabase, {
    searchQuery: params.searchQuery,
    store: params.store,
    sortBy: params.sortBy,
    availability,
    limit: params.limit,
    offset: params.offset
  })
}

export const searchProducts = async ({
  supabase,
  searchQuery,
  store,
  sortBy,
  availability,
  limit,
  offset
}: SearchProductsParams) => {
  const baseParams = {
    searchQuery,
    store,
    sortBy,
    limit,
    offset
  }

  let rows
  let count

  if (availability === 'all') {
    const [activeCountResult, inactiveCountResult] = await Promise.all([
      getSearchRowsByAvailability(
        supabase,
        {
          ...baseParams,
          limit: 1,
          offset: 0
        },
        'active'
      ),
      getSearchRowsByAvailability(
        supabase,
        {
          ...baseParams,
          limit: 1,
          offset: 0
        },
        'inactive'
      )
    ])

    const activeCount = activeCountResult.count
    const inactiveCount = inactiveCountResult.count
    count = activeCount + inactiveCount

    if (count === 0) {
      rows = []
    } else if (offset < activeCount) {
      const activeLimit = Math.min(limit, activeCount - offset)
      const activeResult = await getSearchRowsByAvailability(
        supabase,
        {
          ...baseParams,
          limit: activeLimit,
          offset
        },
        'active'
      )

      if (activeResult.rows.length >= limit) {
        rows = activeResult.rows
      } else {
        const inactiveLimit = limit - activeResult.rows.length
        const inactiveResult = inactiveLimit > 0
          ? await getSearchRowsByAvailability(
              supabase,
              {
                ...baseParams,
                limit: inactiveLimit,
                offset: 0
              },
              'inactive'
            )
          : { rows: [] }

        rows = [...activeResult.rows, ...inactiveResult.rows]
      }
    } else {
      const inactiveResult = await getSearchRowsByAvailability(
        supabase,
        {
          ...baseParams,
          offset: offset - activeCount
        },
        'inactive'
      )

      rows = inactiveResult.rows
    }
  } else {
    const result = await getSearchRowsByAvailability(supabase, baseParams, availability)
    rows = result.rows
    count = result.count
  }

  const items = rows.map(toSearchProduct)

  return {
    items,
    total: count,
    ...toPagination(offset, limit, count)
  }
}
