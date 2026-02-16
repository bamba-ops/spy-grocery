import { serverSupabaseClient } from '#supabase/server'
import { searchProducts } from '../../services/products/searchProducts'

export default defineEventHandler(async (event) => {
  console.log('event', event)
  const supabase = await serverSupabaseClient(event)
  const query = getQuery(event)

  // Parse query params
  const searchQuery = query.q?.toString() || ''
  const storeFilter = query.stores?.toString() || ''
  const sortBy = query.sort?.toString() || 'price-low'
  const limit = parseInt(query.limit?.toString() || '50')
  const offset = parseInt(query.offset?.toString() || '0')
  const promosOnly = query.promos?.toString() === 'true' || false
  const dedupe = query.dedupe?.toString() !== 'false'

  return await searchProducts({
    supabase,
    searchQuery,
    storeFilter,
    sortBy,
    limit,
    offset,
    promosOnly,
    dedupe
  })
})
