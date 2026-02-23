import { serverSupabaseClient } from '#supabase/server'
import { getFeaturedProducts } from '../../services/products/getFeaturedProducts'

const MAX_IDS_PER_REQUEST = 50
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const getIdsFromQuery = (rawIds: string | string[] | undefined) => {
  if (!rawIds) return []

  const asCsv = Array.isArray(rawIds) ? rawIds.join(',') : rawIds

  return asCsv
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const ids = getIdsFromQuery(query.ids as string | string[] | undefined)

  if (ids.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'ids query param is required'
    })
  }

  if (ids.length > MAX_IDS_PER_REQUEST) {
    throw createError({
      statusCode: 400,
      message: `ids query param accepts up to ${MAX_IDS_PER_REQUEST} values`
    })
  }

  if (!ids.every((id) => UUID_REGEX.test(id))) {
    throw createError({
      statusCode: 400,
      message: 'ids must be valid UUID values'
    })
  }

  const supabase = await serverSupabaseClient(event)

  const products = await getFeaturedProducts({
    supabase,
    ids
  })

  return {
    products
  }
})
