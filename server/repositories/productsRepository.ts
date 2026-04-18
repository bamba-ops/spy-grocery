import type { DbProduct } from '#shared/types'
import type { SearchSort } from '#shared/types/search'
import { toSlug } from '#shared/utils/toSlug'

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

type NonRelevanceSort = Exclude<SearchSort, 'relevance'>

interface RankedSearchRow {
  row: DbProduct
  score: number
}

interface SearchFilterParams {
  rawSearchQuery: string
  normalizedSearchQuery: string
  searchQuerySlug: string
  searchTokens: string[]
  expandedSearchTokens: string[]
}

type SearchFilterMode = 'strict' | 'expanded'

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

const MIN_RELEVANCE_QUERY_LENGTH = 2
const MIN_CANDIDATE_ROWS = 250
const MAX_CANDIDATE_ROWS = 1500
const CANDIDATE_ROW_MULTIPLIER = 6
const MAX_EXPANDED_SEARCH_TOKENS = 14

const SEARCH_STOP_WORDS = new Set([
  'a',
  'au',
  'aux',
  'avec',
  'de',
  'des',
  'du',
  'en',
  'et',
  'la',
  'le',
  'les',
  'ou',
  'pour',
  'sans',
  'sur',
  'the',
  'and',
  'for',
  'with',
  'from'
])

const SEARCH_TOKEN_SYNONYMS: Record<string, string[]> = {
  viande: ['boeuf', 'beef', 'porc', 'pork', 'poulet', 'chicken', 'dinde', 'turkey', 'veau', 'veal', 'agneau', 'lamb'],
  boeuf: ['beef', 'viande', 'bourguignon', 'bourguignonne'],
  beef: ['boeuf', 'viande'],
  fondue: ['chinoise', 'bourguignon', 'bourguignonne', 'raclette'],
  chinoise: ['fondue'],
  bourguignon: ['fondue', 'boeuf'],
  bourguignonne: ['fondue', 'boeuf'],
  surgele: ['surgelee', 'congele', 'congelee', 'frozen'],
  surgelee: ['surgele', 'congele', 'congelee', 'frozen'],
  congele: ['congelee', 'surgele', 'surgelee', 'frozen'],
  congelee: ['congele', 'surgele', 'surgelee', 'frozen']
}

const normalizeSearchText = (value: string | null | undefined) => {
  if (!value) {
    return ''
  }

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const tokenizeSearchText = (value: string) => {
  return value
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token, index, array) => token.length >= 2 && array.indexOf(token) === index)
}

const getMeaningfulSearchTokens = (tokens: string[]) => {
  return tokens.filter((token) => token.length >= 2 && !SEARCH_STOP_WORDS.has(token))
}

const getTokenVariants = (token: string) => {
  const variants = new Set<string>([token])

  if (token.length > 4 && token.endsWith('es')) {
    variants.add(token.slice(0, -2))
  }

  if (token.length > 3 && token.endsWith('s')) {
    variants.add(token.slice(0, -1))
  }

  return Array.from(variants)
}

const getExpandedSearchTokens = (searchTokens: string[]) => {
  const expanded = new Set<string>()

  for (const token of searchTokens) {
    const variants = getTokenVariants(token)

    for (const variant of variants) {
      if (variant.length >= 2) {
        expanded.add(variant)
      }

      const synonyms = SEARCH_TOKEN_SYNONYMS[variant] || []

      for (const synonym of synonyms) {
        const normalizedSynonym = normalizeSearchText(synonym)
        if (normalizedSynonym.length >= 2) {
          expanded.add(normalizedSynonym)
        }
      }
    }
  }

  return Array.from(expanded).slice(0, MAX_EXPANDED_SEARCH_TOKENS)
}

const buildSearchFilterParams = (searchQuery: string): SearchFilterParams => {
  const normalizedSearchQuery = normalizeSearchText(searchQuery)
  const searchQuerySlug = toSlug(normalizedSearchQuery)
  const searchTokens = getMeaningfulSearchTokens(tokenizeSearchText(searchQuerySlug))
  const expandedSearchTokens = getExpandedSearchTokens(searchTokens)

  return {
    rawSearchQuery: searchQuery,
    normalizedSearchQuery,
    searchQuerySlug,
    searchTokens,
    expandedSearchTokens
  }
}

const sanitizeFilterValue = (value: string) => {
  return value
    .replace(/[,%()'"`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const getTimestampOrZero = (value: string | null | undefined) => {
  if (!value) {
    return 0
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const getTitleSlug = (row: DbProduct) => {
  const explicitSlug = (row.title_slug || '').trim().toLowerCase()
  if (explicitSlug) {
    return explicitSlug
  }

  return toSlug(row.title || '')
}

const getResolvedDbSort = (sortBy: SearchSort): NonRelevanceSort => {
  if (sortBy === 'relevance') {
    return 'price_asc'
  }

  return sortBy
}

const compareRowsBySort = (a: DbProduct, b: DbProduct, sortBy: NonRelevanceSort) => {
  switch (sortBy) {
    case 'price_asc': {
      const aPrice = typeof a.price_num === 'number' ? a.price_num : Number.POSITIVE_INFINITY
      const bPrice = typeof b.price_num === 'number' ? b.price_num : Number.POSITIVE_INFINITY

      if (aPrice !== bPrice) {
        return aPrice - bPrice
      }

      return (a.title || '').localeCompare(b.title || '')
    }
    case 'price_desc': {
      const aPrice = typeof a.price_num === 'number' ? a.price_num : Number.NEGATIVE_INFINITY
      const bPrice = typeof b.price_num === 'number' ? b.price_num : Number.NEGATIVE_INFINITY

      if (aPrice !== bPrice) {
        return bPrice - aPrice
      }

      return (a.title || '').localeCompare(b.title || '')
    }
    case 'recent': {
      const byRecent = getTimestampOrZero(b.scraped_at) - getTimestampOrZero(a.scraped_at)

      if (byRecent !== 0) {
        return byRecent
      }

      return (a.title || '').localeCompare(b.title || '')
    }
    case 'title_asc':
    default:
      return (a.title || '').localeCompare(b.title || '')
  }
}

const applySort = (query: any, sortBy: SearchSort) => {
  switch (getResolvedDbSort(sortBy)) {
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

const applyStoreFilter = (dbQuery: any, store: string) => {
  if (!store || store === 'all') {
    return dbQuery
  }

  if (getIsStoreIdQuery(store)) {
    return dbQuery.eq('store_id', store)
  }

  const normalizedStore = store.trim().toLowerCase()

  if (toSlug(normalizedStore) === normalizedStore) {
    return dbQuery.eq('store_slug', normalizedStore)
  }

  return dbQuery.eq('store_id', store)
}

const getTokenSearchConditions = (tokens: string[]) => {
  const conditions: string[] = []

  for (const token of tokens) {
    const safeToken = sanitizeFilterValue(token)

    if (!safeToken) {
      continue
    }

    conditions.push(`title_slug.ilike.%${toSlug(safeToken)}%`)
    conditions.push(`title.ilike.%${safeToken}%`)
    conditions.push(`brand.ilike.%${safeToken}%`)
    conditions.push(`description.ilike.%${safeToken}%`)
    conditions.push(`category.ilike.%${safeToken}%`)
    conditions.push(`search_term.ilike.%${safeToken}%`)
  }

  return conditions
}

const applySearchFilter = (dbQuery: any, params: SearchFilterParams, mode: SearchFilterMode = 'strict') => {
  const conditions: string[] = []
  const safeRawQuery = sanitizeFilterValue(params.rawSearchQuery)
  const safeNormalizedQuery = sanitizeFilterValue(params.normalizedSearchQuery)

  if (params.searchQuerySlug) {
    conditions.push(`title_slug.ilike.%${params.searchQuerySlug}%`)
  }

  const titleAndBrandQuery = safeRawQuery || safeNormalizedQuery

  if (titleAndBrandQuery) {
    conditions.push(`title.ilike.%${titleAndBrandQuery}%`)
    conditions.push(`brand.ilike.%${titleAndBrandQuery}%`)
  }

  if (mode === 'expanded') {
    conditions.push(...getTokenSearchConditions(params.expandedSearchTokens))
  }

  const uniqueConditions = Array.from(new Set(conditions))

  if (uniqueConditions.length === 0) {
    return dbQuery
  }

  return dbQuery.or(uniqueConditions.join(','))
}

const getContainsFullSlugToken = (titleSlug: string, token: string) => {
  return (
    titleSlug === token
    || titleSlug.startsWith(`${token}-`)
    || titleSlug.endsWith(`-${token}`)
    || titleSlug.includes(`-${token}-`)
  )
}

const getContainsSlugTokenPrefix = (titleSlug: string, token: string) => {
  const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const tokenPrefixPattern = new RegExp(`(^|-)${escapedToken}[a-z0-9]+(-|$)`, 'i')

  return tokenPrefixPattern.test(titleSlug)
}

const getContainsFullTextToken = (value: string, token: string) => {
  const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const fullWordPattern = new RegExp(`(^|[^a-z0-9])${escapedToken}([^a-z0-9]|$)`, 'i')

  return fullWordPattern.test(value)
}

const getRelevanceScore = (
  row: DbProduct,
  normalizedSearchQuery: string,
  searchQuerySlug: string,
  primarySearchTokens: string[],
  scoringTokens: string[]
) => {
  const normalizedTitle = normalizeSearchText(row.title)
  const normalizedBrand = normalizeSearchText(row.brand)
  const normalizedDescription = normalizeSearchText(row.description)
  const titleSlug = getTitleSlug(row)
  const primarySearchTokenSet = new Set(primarySearchTokens)
  let score = 0

  if (searchQuerySlug && titleSlug === searchQuerySlug) {
    score += 2400
  }

  if (normalizedSearchQuery && normalizedTitle === normalizedSearchQuery) {
    score += 2200
  }

  if (searchQuerySlug && titleSlug.startsWith(`${searchQuerySlug}-`)) {
    score += 1700
  }

  if (searchQuerySlug && (titleSlug.endsWith(`-${searchQuerySlug}`) || titleSlug.includes(`-${searchQuerySlug}-`))) {
    score += 1500
  }

  if (normalizedSearchQuery && normalizedTitle.startsWith(`${normalizedSearchQuery} `)) {
    score += 1200
  }

  if (normalizedSearchQuery && normalizedTitle.includes(normalizedSearchQuery)) {
    score += 700
  }

  let exactPrimaryTokenMatches = 0
  let tokenPrefixMatches = 0
  let descriptionTokenMatches = 0

  for (const token of scoringTokens) {
    const isPrimaryToken = primarySearchTokenSet.has(token)
    const tokenWeight = isPrimaryToken ? 1 : 0.55

    if (getContainsFullSlugToken(titleSlug, token)) {
      if (isPrimaryToken) {
        exactPrimaryTokenMatches += 1
      }

      score += Math.round(320 * tokenWeight)
    } else if (getContainsSlugTokenPrefix(titleSlug, token)) {
      tokenPrefixMatches += 1
      score += Math.round(90 * tokenWeight)
    }

    if (normalizedDescription) {
      if (getContainsFullTextToken(normalizedDescription, token)) {
        descriptionTokenMatches += 1
        score += Math.round(85 * tokenWeight)
      } else if (normalizedDescription.includes(token)) {
        score += Math.round(35 * tokenWeight)
      }
    }

    if (normalizedBrand) {
      if (getContainsFullTextToken(normalizedBrand, token)) {
        score += Math.round(80 * tokenWeight)
      } else if (normalizedBrand.includes(token)) {
        score += Math.round(30 * tokenWeight)
      }
    }
  }

  if (primarySearchTokens.length > 0 && exactPrimaryTokenMatches === primarySearchTokens.length) {
    score += 400
  }

  if (primarySearchTokens.length >= 2 && (exactPrimaryTokenMatches + descriptionTokenMatches) >= primarySearchTokens.length) {
    score += 280
  }

  if (normalizedSearchQuery && normalizedBrand === normalizedSearchQuery) {
    score += 260
  } else if (normalizedSearchQuery && normalizedBrand.startsWith(normalizedSearchQuery)) {
    score += 170
  } else if (normalizedSearchQuery && normalizedBrand.includes(normalizedSearchQuery)) {
    score += 90
  }

  const hasTitleHit = normalizedSearchQuery ? normalizedTitle.includes(normalizedSearchQuery) : false
  const hasBrandHit = normalizedSearchQuery ? normalizedBrand.includes(normalizedSearchQuery) : false

  if (!hasTitleHit && hasBrandHit) {
    score -= 220
  }

  if (tokenPrefixMatches > 0 && exactPrimaryTokenMatches === 0) {
    score -= 40
  }

  return score
}

const getRankedSearchRows = (
  rows: DbProduct[],
  normalizedSearchQuery: string,
  searchQuerySlug: string,
  sortBy: SearchSort,
  scoringTokens: string[]
) => {
  const primarySearchTokens = getMeaningfulSearchTokens(tokenizeSearchText(searchQuerySlug))
  const resolvedScoringTokens = scoringTokens.length > 0 ? scoringTokens : primarySearchTokens
  const tieBreakSort = getResolvedDbSort(sortBy)

  const rankedRows: RankedSearchRow[] = rows.map((row) => ({
    row,
    score: getRelevanceScore(row, normalizedSearchQuery, searchQuerySlug, primarySearchTokens, resolvedScoringTokens)
  }))

  rankedRows.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score
    }

    const sortComparison = compareRowsBySort(a.row, b.row, tieBreakSort)

    if (sortComparison !== 0) {
      return sortComparison
    }

    return a.row.id.localeCompare(b.row.id)
  })

  return rankedRows.map((entry) => entry.row)
}

const getSearchCandidateLimit = (offset: number, limit: number) => {
  const requestedWindow = offset + (limit * CANDIDATE_ROW_MULTIPLIER)

  return Math.min(Math.max(requestedWindow, MIN_CANDIDATE_ROWS), MAX_CANDIDATE_ROWS)
}

const getSearchCount = async (
  supabase: any,
  params: SearchFilterParams,
  store: string,
  mode: SearchFilterMode = 'strict'
) => {
  let countQuery = supabase
    .from('products')
    .select('id', { count: 'exact', head: true })

  countQuery = applySearchFilter(countQuery, params, mode)
  countQuery = applyStoreFilter(countQuery, store)

  const { error, count } = await countQuery

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Search count failed: ${error.message}`
    })
  }

  return count || 0
}

const getSearchCandidateRows = async (
  supabase: any,
  params: SearchFilterParams,
  store: string,
  limit: number,
  mode: SearchFilterMode = 'strict'
) => {
  let dbQuery = supabase
    .from('products')
    .select(SELECT_FIELDS)

  dbQuery = applySearchFilter(dbQuery, params, mode)
  dbQuery = applyStoreFilter(dbQuery, store)
  dbQuery = dbQuery
    .order('scraped_at', { ascending: false })
    .order('title', { ascending: true })
    .limit(limit)

  const { data, error } = await dbQuery

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Search failed: ${error.message}`
    })
  }

  return (data || []) as DbProduct[]
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
  const requestedItemSearchParams = buildSearchFilterParams(requestedItem)
  const normalizedPreferredStore = preferredStore?.trim() || ''

  const getRowsForMode = async (mode: SearchFilterMode): Promise<DbProduct[]> => {
    let dbQuery = supabase
      .from('products')
      .select(SELECT_FIELDS)
      .not('price_num', 'is', null)

    dbQuery = applySearchFilter(dbQuery, requestedItemSearchParams, mode)

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

  const strictRows = await getRowsForMode('strict')

  if (strictRows.length > 0) {
    return strictRows
  }

  const canUseExpandedSearch = requestedItemSearchParams.expandedSearchTokens.length > requestedItemSearchParams.searchTokens.length

  if (!canUseExpandedSearch) {
    return strictRows
  }

  return getRowsForMode('expanded')
}

export const searchProductsRows = async (supabase: any, params: SearchProductsRowsParams) => {
  const searchParams = buildSearchFilterParams(params.searchQuery)

  const hasSearchQuery = searchParams.normalizedSearchQuery.length > 0
  const canUseRelevanceRanking = hasSearchQuery
    && searchParams.normalizedSearchQuery.length >= MIN_RELEVANCE_QUERY_LENGTH
    && (params.offset + params.limit) <= MAX_CANDIDATE_ROWS

  if (canUseRelevanceRanking) {
    const strictCount = await getSearchCount(supabase, searchParams, params.store, 'strict')
    const canUseExpandedSearch = searchParams.expandedSearchTokens.length > searchParams.searchTokens.length
    const activeMode: SearchFilterMode = strictCount === 0 && canUseExpandedSearch ? 'expanded' : 'strict'
    const count = activeMode === 'expanded'
      ? await getSearchCount(supabase, searchParams, params.store, 'expanded')
      : strictCount

    if (count === 0) {
      return {
        rows: [],
        count: 0
      }
    }

    const candidateLimit = Math.min(getSearchCandidateLimit(params.offset, params.limit), count)
    const candidateRows = await getSearchCandidateRows(supabase, searchParams, params.store, candidateLimit, activeMode)
    const rankedRows = getRankedSearchRows(
      candidateRows,
      searchParams.normalizedSearchQuery,
      searchParams.searchQuerySlug,
      params.sortBy,
      activeMode === 'expanded' ? searchParams.expandedSearchTokens : searchParams.searchTokens
    )

    return {
      rows: rankedRows.slice(params.offset, params.offset + params.limit),
      count
    }
  }

  let dbQuery = supabase
    .from('products')
    .select(SELECT_FIELDS, { count: 'exact' })

  if (hasSearchQuery) {
    dbQuery = applySearchFilter(dbQuery, searchParams)
  }

  dbQuery = applyStoreFilter(dbQuery, params.store)

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

export const getLatestProductRowByStoreAndTitleSlug = async (
  supabase: any,
  storeSlug: string,
  titleSlug: string
): Promise<DbProduct | null> => {
  const { data, error } = await supabase
    .from('products')
    .select(SELECT_FIELDS)
    .eq('store_slug', storeSlug)
    .eq('title_slug', titleSlug)
    .order('scraped_at', { ascending: false, nullsFirst: false })
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to fetch product by store/title slug: ${error.message}`
    })
  }

  return (data as DbProduct | null) ?? null
}

export const getLatestProductRowByExternalId = async (
  supabase: any,
  externalId: string
): Promise<DbProduct | null> => {
  const { data, error } = await supabase
    .from('products')
    .select(SELECT_FIELDS)
    .eq('external_id', externalId)
    .order('scraped_at', { ascending: false, nullsFirst: false })
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to fetch product by external id fallback: ${error.message}`
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

  const broadFilters = terms.flatMap((term) => {
    const safeTerm = sanitizeFilterValue(term)

    if (!safeTerm) {
      return []
    }

    return [
      `title.ilike.%${safeTerm}%`,
      `title_slug.ilike.%${toSlug(safeTerm)}%`
    ]
  })

  if (broadFilters.length === 0) {
    return []
  }

  dbQuery = dbQuery.or(broadFilters.join(','))

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
