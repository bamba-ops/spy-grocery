import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)

  // Get all stores with product count
  const { data: stores, error } = await supabase
    .from('stores')
    .select('id, name, slug, image_url')
    .order('name')

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to fetch stores: ${error.message}`
    })
  }

  // Get product counts for each store
  const { data: productCounts } = await supabase
    .from('products')
    .select('store_id')

  const countMap: Record<string, number> = {}
  productCounts?.forEach(p => {
    if (p.store_id) {
      countMap[p.store_id] = (countMap[p.store_id] || 0) + 1
    }
  })

  const storesWithCount = stores?.map(store => ({
    ...store,
    product_count: countMap[store.id] || 0
  }))

  return {
    stores: storesWithCount || []
  }
})
