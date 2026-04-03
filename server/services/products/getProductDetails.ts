import type { DbProduct, SearchProduct } from '#shared/types'
import type { ProductDetailsResponse } from '#shared/types/product-details'
import { toSlug } from '#shared/utils/toSlug'
import { getBroadSimilarProductsRows, getProductRowBySlug, getSimilarProductsRows } from '../../repositories/productsRepository'

interface GetProductDetailsParams {
  supabase: any
  slug: string
}

interface ScoredRow {
  row: DbProduct
  score: number
}

const MIN_RESULTS_BEFORE_BROAD_MATCH = 2
const BROAD_MATCH_LIMIT = 220
const MIN_RELEVANCE_SCORE_SINGLE_TOKEN = 900
const MIN_RELEVANCE_SCORE_MULTI_TOKEN = 620
const OFF_TOPIC_PRIMARY_TOKEN_PENALTY = 450

const toNullableTrimmed = (value: string | null) => {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  return trimmed || null
}

const toSearchProduct = (row: DbProduct): SearchProduct => ({
  id: row.id,
  external_id: row.external_id,
  slug: row.slug,
  title_slug: row.title_slug,
  title: row.title || '',
  description: row.description ?? null,
  brand: row.brand,
  store: row.store,
  store_slug: row.store_slug,
  store_id: row.store_id,
  image_url: row.image_url,
  url: row.url,
  uom: row.uom,
  price_num: row.price_num,
  was_price_num: row.was_price_num,
  price_text: row.price_text,
  pre_price_text: row.pre_price_text,
  on_sale: row.on_sale,
  scraped_at: row.scraped_at || null
})

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

const getTokenVariants = (token: string) => {
  const variants = new Set<string>([token])

  if (token.length > 4 && token.endsWith('es')) {
    variants.add(token.slice(0, -2))
  }

  if (token.length > 3 && token.endsWith('s')) {
    variants.add(token.slice(0, -1))
  }

  if (token.length > 4 && token.endsWith('e')) {
    variants.add(token.slice(0, -1))
  }

  if (token.length > 4 && token.endsWith('a')) {
    variants.add(token.slice(0, -1))
  }

  return Array.from(variants)
}

const getTokenRoot = (token: string) => {
  const normalizedToken = token.trim().toLowerCase()
  if (!normalizedToken) {
    return ''
  }

  const shortestVariant = getTokenVariants(normalizedToken).sort((a, b) => a.length - b.length)[0]
  return (shortestVariant || normalizedToken).trim()
}

const getTokenRoots = (tokens: string[]) => {
  return tokens
    .map((token) => getTokenRoot(token))
    .filter((token, index, array) => token.length >= 3 && array.indexOf(token) === index)
}

const getTitleSlug = (row: DbProduct) => {
  const explicitSlug = (row.title_slug || '').trim().toLowerCase()
  if (explicitSlug) {
    return explicitSlug
  }

  return toSlug(row.title || '')
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

const getRelevanceScore = (row: DbProduct, normalizedSearchQuery: string, searchQuerySlug: string, searchTokens: string[]) => {
  const normalizedTitle = normalizeSearchText(row.title)
  const normalizedBrand = normalizeSearchText(row.brand)
  const titleSlug = getTitleSlug(row)
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

  let exactTokenMatches = 0
  let tokenPrefixMatches = 0

  for (const token of searchTokens) {
    const tokenVariants = getTokenVariants(token)
    const hasFullVariantMatch = tokenVariants.some((variant) => getContainsFullSlugToken(titleSlug, variant))

    if (hasFullVariantMatch) {
      exactTokenMatches += 1
      score += 320
      continue
    }

    const hasPrefixVariantMatch = tokenVariants.some((variant) => getContainsSlugTokenPrefix(titleSlug, variant))

    if (hasPrefixVariantMatch) {
      tokenPrefixMatches += 1
      score += 170
    }
  }

  if (searchTokens.length > 0 && exactTokenMatches === searchTokens.length) {
    score += 400
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

  if (tokenPrefixMatches > 0 && exactTokenMatches === 0) {
    score -= 40
  }

  return score
}

const getWordTokens = (value: string) => {
  return tokenizeSearchText(normalizeSearchText(value))
}

const getSearchTerms = (title: string) => {
  const baseTokens = getWordTokens(title)
  const terms = new Set<string>()

  for (const token of baseTokens) {
    if (token.length >= 4) {
      terms.add(token)
    }

    if (token.length >= 5 && token.endsWith('es')) {
      terms.add(token.slice(0, -2))
    }

    if (token.length >= 5 && token.endsWith('s')) {
      terms.add(token.slice(0, -1))
    }

    if (token.length >= 5 && token.endsWith('e')) {
      terms.add(token.slice(0, -1))
    }
  }

  return Array.from(terms)
}

const getMinimumRelevanceScore = (searchTokens: string[]) => {
  if (searchTokens.length === 0) {
    return 0
  }

  if (searchTokens.length === 1) {
    return MIN_RELEVANCE_SCORE_SINGLE_TOKEN
  }

  return MIN_RELEVANCE_SCORE_MULTI_TOKEN
}

const getCandidateSimilarityScore = (
  row: DbProduct,
  normalizedTitle: string,
  titleSlug: string,
  titleTokens: string[],
  brand: string | null,
  uom: string | null
) => {
  let score = getRelevanceScore(row, normalizedTitle, titleSlug, titleTokens)

  const candidateTitleSlug = getTitleSlug(row)
  const searchTokenRoots = getTokenRoots(titleTokens)
  const candidateTokens = tokenizeSearchText(candidateTitleSlug)
  const candidateTokenRoots = getTokenRoots(candidateTokens)

  if (searchTokenRoots.length > 0 && candidateTokenRoots.length > 0) {
    const overlappingRoots = searchTokenRoots.filter((tokenRoot) => candidateTokenRoots.includes(tokenRoot))

    if (overlappingRoots.length > 0) {
      const overlapCoverage = overlappingRoots.length / searchTokenRoots.length
      const overlapPrecision = overlappingRoots.length / candidateTokenRoots.length

      score += Math.round(
        (overlappingRoots.length * 160)
        + (overlapCoverage * 260)
        + (overlapPrecision * 140)
      )

      const primarySearchRoot = searchTokenRoots[0] || ''
      const primaryCandidateRoot = candidateTokenRoots[0] || ''

      if (
        primarySearchRoot
        && primaryCandidateRoot
        && primarySearchRoot !== primaryCandidateRoot
        && candidateTokenRoots.length > searchTokenRoots.length
      ) {
        score -= OFF_TOPIC_PRIMARY_TOKEN_PENALTY
      }
    }
  }

  const normalizedBrand = normalizeSearchText(brand)
  const normalizedCandidateBrand = normalizeSearchText(row.brand)

  if (normalizedBrand && normalizedCandidateBrand) {
    if (normalizedBrand === normalizedCandidateBrand) {
      score += 220
    } else if (
      normalizedCandidateBrand.includes(normalizedBrand)
      || normalizedBrand.includes(normalizedCandidateBrand)
    ) {
      score += 110
    }
  }

  const normalizedUom = normalizeSearchText(uom)
  const normalizedCandidateUom = normalizeSearchText(row.uom)

  if (normalizedUom && normalizedCandidateUom && normalizedUom === normalizedCandidateUom) {
    score += 120
  }

  return score
}

const getTimestampOrZero = (value: string | null | undefined) => {
  if (!value) {
    return 0
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const compareNumbersNullLast = (a: number | null, b: number | null) => {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return a - b
}

const compareRows = (a: DbProduct, b: DbProduct) => {
  const priceOrder = compareNumbersNullLast(a.price_num, b.price_num)
  if (priceOrder !== 0) {
    return priceOrder
  }

  const aScrapedAt = getTimestampOrZero(a.scraped_at)
  const bScrapedAt = getTimestampOrZero(b.scraped_at)

  if (aScrapedAt !== bScrapedAt) {
    return bScrapedAt - aScrapedAt
  }

  return a.store.localeCompare(b.store)
}

const compareScoredRows = (a: ScoredRow, b: ScoredRow) => {
  const scoreOrder = b.score - a.score
  if (scoreOrder !== 0) {
    return scoreOrder
  }

  return compareRows(a.row, b.row)
}

const getStoreKey = (row: DbProduct) => {
  if (row.store_id) {
    return row.store_id
  }

  return row.store.trim().toLowerCase()
}

const getDedupedRowsByStore = (
  rows: DbProduct[],
  normalizedTitle: string,
  titleSlug: string,
  titleTokens: string[],
  brand: string | null,
  uom: string | null
) => {
  const byStore = new Map<string, ScoredRow>()
  const minimumRelevanceScore = getMinimumRelevanceScore(titleTokens)

  for (const row of rows) {
    const key = getStoreKey(row)
    const score = getCandidateSimilarityScore(row, normalizedTitle, titleSlug, titleTokens, brand, uom)

    if (score < minimumRelevanceScore) {
      continue
    }

    const candidate = { row, score }
    const existing = byStore.get(key)

    if (!existing || compareScoredRows(candidate, existing) < 0) {
      byStore.set(key, candidate)
    }
  }

  return Array.from(byStore.values())
    .sort(compareScoredRows)
    .map((entry) => entry.row)
}

export const getProductDetails = async ({ supabase, slug }: GetProductDetailsParams): Promise<ProductDetailsResponse> => {
  const productRow = await getProductRowBySlug(supabase, slug)

  if (!productRow) {
    throw createError({
      statusCode: 404,
      message: 'Product not found'
    })
  }

  const title = toNullableTrimmed(productRow.title)
  if (!title) {
    return {
      product: toSearchProduct(productRow),
      otherStoreProducts: []
    }
  }

  const brand = toNullableTrimmed(productRow.brand)
  const uom = toNullableTrimmed(productRow.uom)
  const normalizedTitle = normalizeSearchText(title)
  const titleSlug = toSlug(normalizedTitle)
  const titleTokens = tokenizeSearchText(titleSlug)
  const searchTerms = getSearchTerms(title)

  const strictRows = await getSimilarProductsRows(supabase, {
    title,
    brand,
    uom,
    excludeProductId: productRow.id,
    excludeStoreId: productRow.store_id,
    excludeStoreName: productRow.store,
    strictUom: true,
    limit: 80
  })

  let candidateRows = strictRows

  if (candidateRows.length === 0 && uom) {
    const relaxedStrictRows = await getSimilarProductsRows(supabase, {
      title,
      brand,
      uom,
      excludeProductId: productRow.id,
      excludeStoreId: productRow.store_id,
      excludeStoreName: productRow.store,
      strictUom: false,
      limit: 80
    })

    candidateRows = [...candidateRows, ...relaxedStrictRows]
  }

  if (candidateRows.length < MIN_RESULTS_BEFORE_BROAD_MATCH && searchTerms.length > 0) {
    const broadRows = await getBroadSimilarProductsRows(supabase, {
      terms: searchTerms,
      excludeProductId: productRow.id,
      excludeStoreId: productRow.store_id,
      excludeStoreName: productRow.store,
      limit: BROAD_MATCH_LIMIT
    })

    candidateRows = [...candidateRows, ...broadRows]
  }

  const uniqueRows = Array.from(new Map(candidateRows.map((row) => [row.id, row])).values())
  const dedupedRows = getDedupedRowsByStore(uniqueRows, normalizedTitle, titleSlug, titleTokens, brand, uom)

  return {
    product: toSearchProduct(productRow),
    otherStoreProducts: dedupedRows.map(toSearchProduct)
  }
}
