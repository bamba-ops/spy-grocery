import { serverSupabaseClient } from '#supabase/server'
import { getProductDetailsByRoute } from '../../../../services/products/getProductDetailsByRoute'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)

  const storeSlug = getRouterParam(event, 'store')?.trim() || ''
  const productSlug = getRouterParam(event, 'product')?.trim() || ''

  if (!storeSlug || !productSlug) {
    throw createError({
      statusCode: 400,
      message: 'Invalid product route parameters'
    })
  }

  return getProductDetailsByRoute({
    supabase,
    storeSlug,
    productSlug
  })
})
