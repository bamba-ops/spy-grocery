import { serverSupabaseClient } from '#supabase/server'
import type { SearchAvailability, SearchSort } from '#shared/types/search'
import { searchProducts } from '../../services/products/searchProducts'

const ALLOWED_SORTS: SearchSort[] = ['relevance', 'price_asc', 'price_desc', 'title_asc', 'recent']
const ALLOWED_AVAILABILITY: SearchAvailability[] = ['active', 'inactive', 'all']

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
  const store = query.store?.toString().trim().toLowerCase() || 'all'
  const sortParam = query.sort?.toString().trim() || (searchQuery ? 'relevance' : 'price_asc')
  const availabilityParam = query.availability?.toString().trim() || 'active'
  const limit = Math.min(toPositiveInt(query.limit?.toString(), 50), 100)
  const offset = toPositiveInt(query.offset?.toString(), 0)

  if (!ALLOWED_SORTS.includes(sortParam as SearchSort)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid sort value'
    })
  }

  if (!ALLOWED_AVAILABILITY.includes(availabilityParam as SearchAvailability)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid availability value'
    })
  }

  return searchProducts({
    supabase,
    searchQuery,
    store,
    sortBy: sortParam as SearchSort,
    availability: availabilityParam as SearchAvailability,
    limit,
    offset
  })
})
