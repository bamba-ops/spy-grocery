import type { DbProduct } from '#shared/types'
import type { SearchSort } from '#shared/types/search'

interface SearchProductsRowsParams {
  searchQuery: string
  store: string
  sortBy: SearchSort
  limit: number
  offset: number
}

interface SimilarProductsRowsParams {
  title: string
  brand: string | null
  uom: string | null
  excludeProductId: string
  excludeStoreId: string | null
  excludeStoreName: string
  strictUom: boolean
  limit: number
}

interface BroadSimilarProductsRowsParams {
  terms: string[]
  excludeProductId: string
  excludeStoreId: string | null
  excludeStoreName: string
  limit: number
}

const SELECT_FIELDS = [
  'id',
  'slug',
  'title',
  'description',
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

export const getProductRowBySlug = async (supabase: any, slug: string): Promise<DbProduct | null> => {
  const { data, error } = await supabase
    .from('products')
    .select(SELECT_FIELDS)
    .eq('slug', slug)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to fetch product by slug: ${error.message}`
    })
  }

  return (data as DbProduct | null) ?? null
}

export const getSimilarProductsRows = async (supabase: any, params: SimilarProductsRowsParams): Promise<DbProduct[]> => {
  let dbQuery = supabase
    .from('products')
    .select(SELECT_FIELDS)
    .eq('title', params.title)
    .neq('id', params.excludeProductId)

  if (params.brand) {
    dbQuery = dbQuery.eq('brand', params.brand)
  }

  if (params.strictUom && params.uom) {
    dbQuery = dbQuery.eq('uom', params.uom)
  }

  if (params.excludeStoreId) {
    dbQuery = dbQuery.neq('store_id', params.excludeStoreId)
  } else if (params.excludeStoreName) {
    dbQuery = dbQuery.neq('store', params.excludeStoreName)
  }

  dbQuery = dbQuery
    .order('price_num', { ascending: true, nullsFirst: false })
    .order('scraped_at', { ascending: false })
    .limit(params.limit)

  const { data, error } = await dbQuery

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to fetch similar products: ${error.message}`
    })
  }

  return (data || []) as DbProduct[]
}

export const getBroadSimilarProductsRows = async (supabase: any, params: BroadSimilarProductsRowsParams): Promise<DbProduct[]> => {
  const terms = params.terms
    .map((term) => term.trim().toLowerCase())
    .filter((term, index, array) => term.length >= 4 && array.indexOf(term) === index)
    .slice(0, 10)

  if (terms.length === 0) {
    return []
  }

  let dbQuery = supabase
    .from('products')
    .select(SELECT_FIELDS)
    .neq('id', params.excludeProductId)

  if (params.excludeStoreId) {
    dbQuery = dbQuery.neq('store_id', params.excludeStoreId)
  } else if (params.excludeStoreName) {
    dbQuery = dbQuery.neq('store', params.excludeStoreName)
  }

  const titleFilters = terms.map((term) => `title.ilike.%${term}%`)
  dbQuery = dbQuery.or(titleFilters.join(','))

  dbQuery = dbQuery
    .order('price_num', { ascending: true, nullsFirst: false })
    .order('scraped_at', { ascending: false })
    .limit(params.limit)

  const { data, error } = await dbQuery

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to fetch broad similar products: ${error.message}`
    })
  }

  return (data || []) as DbProduct[]
}
