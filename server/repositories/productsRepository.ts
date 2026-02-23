interface SearchProductsRowsParams {
  searchQuery: string
  storeIds: string[]
  sortBy: string
  limit: number
  offset: number
  promoPagedIds: string[] | null
}

export const getPromoProductIds = async (supabase: any, storeIds: string[]) => {
  let promoQuery = supabase
    .from('latest_price')
    .select('product_id, store_id')
    .eq('is_promo', true)

  if (storeIds.length > 0) {
    promoQuery = promoQuery.in('store_id', storeIds)
  }

  const { data, error } = await promoQuery
  if (error) {
    throw createError({
      statusCode: 500,
      message: `Promo lookup failed: ${error.message}`
    })
  }

  return (data || [])
    .map(entry => entry.product_id)
    .filter((id): id is string => Boolean(id))
}

export const searchProductsRows = async (supabase: any, params: SearchProductsRowsParams) => {
  const selectFields = `
      id,
      name,
      brand,
      slug,
      unit,
      image_url,
      link,
      store_id
    `

  let dbQuery = supabase
    .from('products')
    .select(selectFields, params.promoPagedIds ? undefined : { count: 'exact' })

  if (params.searchQuery) {
    dbQuery = dbQuery.or(`name.ilike.%${params.searchQuery}%,brand.ilike.%${params.searchQuery}%`)
  }

  if (params.storeIds.length > 0) {
    dbQuery = dbQuery.in('store_id', params.storeIds)
  }

  if (params.promoPagedIds) {
    dbQuery = dbQuery.in('id', params.promoPagedIds)
  }

  switch (params.sortBy) {
    case 'name':
      dbQuery = dbQuery.order('name', { ascending: true })
      break
    case 'price-high':
    case 'price-low':
      dbQuery = dbQuery.order('name', { ascending: true })
      break
    default:
      dbQuery = dbQuery.order('name', { ascending: true })
  }

  if (!params.promoPagedIds) {
    dbQuery = dbQuery.range(params.offset, params.offset + params.limit - 1)
  }

  const { data, error, count } = await dbQuery

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Search failed: ${error.message}`
    })
  }

  return {
    products: data || [],
    count: count || 0
  }
}

export const getProductsByIds = async (supabase: any, ids: string[]) => {
  if (ids.length === 0) return []

  const selectFields = `
      id,
      name,
      brand,
      slug,
      unit,
      image_url,
      link,
      store_id
    `

  const { data, error } = await supabase
    .from('products')
    .select(selectFields)
    .in('id', ids)

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Featured products lookup failed: ${error.message}`
    })
  }

  const rows = data || []
  const rowsById = new Map(rows.map((row) => [row.id, row]))

  return ids
    .map((id) => rowsById.get(id))
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
}

export const getStoresByIds = async (supabase: any, storeIds: string[]) => {
  if (storeIds.length === 0) return []

  const { data } = await supabase
    .from('stores')
    .select('id, name, slug, image_url')
    .in('id', storeIds)

  return data || []
}

export const getLatestPricesByProductIds = async (supabase: any, productIds: string[]) => {
  if (productIds.length === 0) return []

  const { data } = await supabase
    .from('latest_price')
    .select('*')
    .in('product_id', productIds)

  return data || []
}
