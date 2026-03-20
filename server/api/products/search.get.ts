import { serverSupabaseClient } from '#supabase/server'
import type { SearchSort } from '#shared/types/search'
import { searchProducts } from '../../services/products/searchProducts'

const ALLOWED_SORTS: SearchSort[] = ['price_asc', 'price_desc', 'title_asc', 'recent']

const toPositiveInt = (value: string | undefined, fallback: number) => {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed < 0) return fallback
  return parsed
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const query = getQuery(event)

  const searchQuery = query.q?.toString().trim() || ''
  const store = query.store?.toString().trim() || 'all'
  const sortParam = query.sort?.toString().trim() || 'price_asc'
  const limit = Math.min(toPositiveInt(query.limit?.toString(), 50), 100)
  const offset = toPositiveInt(query.offset?.toString(), 0)

  if (!ALLOWED_SORTS.includes(sortParam as SearchSort)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid sort value'
    })
  }

  return searchProducts({
    supabase,
    searchQuery,
    store,
    sortBy: sortParam as SearchSort,
    limit,
    offset
  })
})
