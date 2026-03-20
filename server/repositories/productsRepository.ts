import type { SearchSort } from '#shared/types/search'

interface SearchProductsRowsParams {
  searchQuery: string
  store: string
  sortBy: SearchSort
  limit: number
  offset: number
}

const SELECT_FIELDS = [
  'id',
  'slug',
  'title',
  'brand',
  'store',
  'store_id',
  'image_url',
  'url',
  'uom',
  'price_num',
  'was_price_num',
  'price_text',
  'pre_price_text',
  'on_sale',
  'scraped_at'
].join(',')

const applySort = (query: any, sortBy: SearchSort) => {
  switch (sortBy) {
    case 'price_asc':
      return query.order('price_num', { ascending: true, nullsFirst: false }).order('title', { ascending: true })
    case 'price_desc':
      return query.order('price_num', { ascending: false, nullsFirst: false }).order('title', { ascending: true })
    case 'recent':
      return query.order('scraped_at', { ascending: false }).order('title', { ascending: true })
    case 'title_asc':
    default:
      return query.order('title', { ascending: true })
  }
}

export const searchProductsRows = async (supabase: any, params: SearchProductsRowsParams) => {
  let dbQuery = supabase
    .from('products')
    .select(SELECT_FIELDS, { count: 'exact' })

  if (params.searchQuery) {
    dbQuery = dbQuery.or(`title.ilike.%${params.searchQuery}%,brand.ilike.%${params.searchQuery}%`)
  }

  if (params.store && params.store !== 'all') {
    if (/^[0-9]+$/.test(params.store)) {
      dbQuery = dbQuery.eq('store_id', params.store)
    } else {
      dbQuery = dbQuery.ilike('slug', `${params.store}-%`)
    }
  }

  dbQuery = applySort(dbQuery, params.sortBy)
  dbQuery = dbQuery.range(params.offset, params.offset + params.limit - 1)

  const { data, error, count } = await dbQuery

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Search failed: ${error.message}`
    })
  }

  return {
    rows: data || [],
    count: count || 0
  }
}
