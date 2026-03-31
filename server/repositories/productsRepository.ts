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

interface BuildSingleStoreListRowsParams {
  requestedItems: string[]
  preferredStore?: string | null
  perItemLimit?: number
}

interface SingleStoreMatchedItem {
  requestedItem: string
  product: DbProduct
}

interface BuildSingleStoreListRowsResult {
  selectedStore: string | null
  selectedStoreId: string | null
  matchedItems: SingleStoreMatchedItem[]
  missingItems: string[]
  totalEstimated: number
  coverage: number
}

const SELECT_FIELDS = [
  'id',
  'external_id',
  'slug',
  'title_slug',
  'title',
  'description',
  'brand',
  'store',
  'store_slug',
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

const normalizeRequestedItems = (items: string[]) => {
  return items
    .map((item) => item.trim())
    .filter((item, index, array) => item.length > 0 && array.indexOf(item) === index)
}

const getStoreKey = (row: DbProduct) => {
  return `${row.store_id || ''}::${row.store || ''}`
}

const getStoreNameFromKey = (storeKey: string) => {
  return storeKey.split('::')[1] || null
}

const getStoreIdFromKey = (storeKey: string) => {
  const storeId = storeKey.split('::')[0] || null
  return storeId || null
}

const getIsStoreIdQuery = (value: string) => /^[0-9]+$/.test(value)

const getCheapestRow = (rows: DbProduct[]) => {
  if (rows.length === 0) {
    return null
  }

  const sortedRows = [...rows].sort((a, b) => {
    const aPrice = typeof a.price_num === 'number' ? a.price_num : Number.POSITIVE_INFINITY
    const bPrice = typeof b.price_num === 'number' ? b.price_num : Number.POSITIVE_INFINITY

    if (aPrice !== bPrice) {
      return aPrice - bPrice
    }

    const aDate = a.scraped_at ? Date.parse(a.scraped_at) : 0
    const bDate = b.scraped_at ? Date.parse(b.scraped_at) : 0
    return bDate - aDate
  })

  return sortedRows[0] || null
}

const getPriceOrZero = (row: DbProduct) => {
  return typeof row.price_num === 'number' ? row.price_num : 0
}

const getRowsByRequestedItem = async (
  supabase: any,
  requestedItem: string,
  perItemLimit: number,
  preferredStore?: string | null
): Promise<DbProduct[]> => {
  let dbQuery = supabase
    .from('products')
    .select(SELECT_FIELDS)
    .or(`title.ilike.%${requestedItem}%,brand.ilike.%${requestedItem}%`)
    .not('price_num', 'is', null)

  const normalizedPreferredStore = preferredStore?.trim() || ''

  if (normalizedPreferredStore) {
    if (getIsStoreIdQuery(normalizedPreferredStore)) {
      dbQuery = dbQuery.eq('store_id', normalizedPreferredStore)
    } else {
      dbQuery = dbQuery.ilike('store', `%${normalizedPreferredStore}%`)
    }
  }

  dbQuery = dbQuery
    .order('price_num', { ascending: true, nullsFirst: false })
    .order('scraped_at', { ascending: false })
    .limit(perItemLimit)

  const { data, error } = await dbQuery

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to fetch list candidates: ${error.message}`
    })
  }

  return (data || []) as DbProduct[]
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
      dbQuery = dbQuery.or(`store_slug.eq.${params.store},store_id.eq.${params.store}`)
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

export const getProductRowByStoreAndExternalId = async (
  supabase: any,
  storeSlug: string,
  externalId: string
): Promise<DbProduct | null> => {
  const { data, error } = await supabase
    .from('products')
    .select(SELECT_FIELDS)
    .eq('store_slug', storeSlug)
    .eq('external_id', externalId)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to fetch product by route: ${error.message}`
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

export const buildSingleStoreListRows = async (
  supabase: any,
  params: BuildSingleStoreListRowsParams
): Promise<BuildSingleStoreListRowsResult> => {
  const requestedItems = normalizeRequestedItems(params.requestedItems)
  const perItemLimit = Math.max(3, Math.min(params.perItemLimit || 30, 100))

  if (requestedItems.length === 0) {
    return {
      selectedStore: null,
      selectedStoreId: null,
      matchedItems: [],
      missingItems: [],
      totalEstimated: 0,
      coverage: 0
    }
  }

  const rowsByItem = await Promise.all(
    requestedItems.map(async (requestedItem) => {
      const rows = await getRowsByRequestedItem(supabase, requestedItem, perItemLimit, params.preferredStore)
      return {
        requestedItem,
        rows
      }
    })
  )

  if (params.preferredStore?.trim()) {
    const matchedItems: SingleStoreMatchedItem[] = []
    const missingItems: string[] = []

    for (const itemEntry of rowsByItem) {
      const bestRow = getCheapestRow(itemEntry.rows)

      if (!bestRow) {
        missingItems.push(itemEntry.requestedItem)
        continue
      }

      matchedItems.push({
        requestedItem: itemEntry.requestedItem,
        product: bestRow
      })
    }

    const firstMatched = matchedItems[0]?.product || null
    const totalEstimated = matchedItems.reduce((acc, item) => acc + getPriceOrZero(item.product), 0)

    return {
      selectedStore: firstMatched?.store || params.preferredStore.trim(),
      selectedStoreId: firstMatched?.store_id || null,
      matchedItems,
      missingItems,
      totalEstimated,
      coverage: matchedItems.length
    }
  }

  const storeAssignments = new Map<string, { matchedItems: SingleStoreMatchedItem[]; totalEstimated: number }>()

  for (const itemEntry of rowsByItem) {
    const rowsByStore = new Map<string, DbProduct[]>()

    for (const row of itemEntry.rows) {
      const storeKey = getStoreKey(row)
      const existingRows = rowsByStore.get(storeKey) || []
      existingRows.push(row)
      rowsByStore.set(storeKey, existingRows)
    }

    for (const [storeKey, storeRows] of rowsByStore.entries()) {
      const bestRow = getCheapestRow(storeRows)
      if (!bestRow) {
        continue
      }

      const assignment = storeAssignments.get(storeKey) || {
        matchedItems: [],
        totalEstimated: 0
      }

      assignment.matchedItems.push({
        requestedItem: itemEntry.requestedItem,
        product: bestRow
      })
      assignment.totalEstimated += getPriceOrZero(bestRow)

      storeAssignments.set(storeKey, assignment)
    }
  }

  if (storeAssignments.size === 0) {
    return {
      selectedStore: null,
      selectedStoreId: null,
      matchedItems: [],
      missingItems: requestedItems,
      totalEstimated: 0,
      coverage: 0
    }
  }

  const rankedStores = [...storeAssignments.entries()].sort((a, b) => {
    const aCoverage = a[1].matchedItems.length
    const bCoverage = b[1].matchedItems.length

    if (aCoverage !== bCoverage) {
      return bCoverage - aCoverage
    }

    if (a[1].totalEstimated !== b[1].totalEstimated) {
      return a[1].totalEstimated - b[1].totalEstimated
    }

    return a[0].localeCompare(b[0])
  })

  const selectedStoreEntry = rankedStores[0]

  if (!selectedStoreEntry) {
    return {
      selectedStore: null,
      selectedStoreId: null,
      matchedItems: [],
      missingItems: requestedItems,
      totalEstimated: 0,
      coverage: 0
    }
  }

  const selectedStoreKey = selectedStoreEntry[0]
  const selectedStoreData = selectedStoreEntry[1]
  const matchedItemSet = new Set(selectedStoreData.matchedItems.map((item) => item.requestedItem))

  return {
    selectedStore: getStoreNameFromKey(selectedStoreKey),
    selectedStoreId: getStoreIdFromKey(selectedStoreKey),
    matchedItems: selectedStoreData.matchedItems,
    missingItems: requestedItems.filter((item) => !matchedItemSet.has(item)),
    totalEstimated: selectedStoreData.totalEstimated,
    coverage: selectedStoreData.matchedItems.length
  }
}
