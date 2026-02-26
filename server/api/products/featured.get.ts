import { serverSupabaseClient } from '#supabase/server'
import { getFeaturedProducts } from '../../services/products/getFeaturedProducts'
import { MAX_IDS_PER_REQUEST, UUID_REGEX, getIdsFromQuery } from '../../utils/featuredQueryIds'

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
