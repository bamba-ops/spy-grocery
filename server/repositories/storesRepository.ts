export const fetchStores = async (supabase: any) => {
  const { data, error } = await supabase
    .from('stores')
    .select('id, name, slug, image_url')
    .order('name')

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to fetch stores: ${error.message}`
    })
  }

  return data || []
}

export const fetchProductStoreIds = async (supabase: any) => {
  const { data } = await supabase
    .from('products')
    .select('store_id')

  return data || []
}
