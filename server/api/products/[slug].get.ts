import { serverSupabaseClient } from '#supabase/server'
import { getProductDetails } from '../../services/products/getProductDetails'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const slug = getRouterParam(event, 'slug')?.trim() || ''

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Invalid product slug'
    })
  }

  return getProductDetails({
    supabase,
    slug
  })
})
