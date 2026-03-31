import type { DbProduct, SearchProduct } from '#shared/types'
import type { ProductDetailsResponse } from '#shared/types/product-details'
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
const MIN_SIMILARITY_SCORE = 0.35

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

const normalizeText = (value: string) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const getWordTokens = (value: string) => {
  const normalized = normalizeText(value)
  return normalized.match(/[a-z0-9]+/g) || []
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

const getSimilarityScore = (baseTitle: string, baseTerms: string[], row: DbProduct) => {
  const candidateTitle = row.title ? normalizeText(row.title) : ''
  if (!candidateTitle) {
    return 0
  }

  let score = 0

  if (candidateTitle === baseTitle) {
    score += 5
  }

  if (candidateTitle.includes(baseTitle)) {
    score += 2.5
  }

  const baseTokens = getWordTokens(baseTitle)
  const candidateTokens = new Set(getWordTokens(candidateTitle))
  const sharedTokensCount = baseTokens.filter((token) => candidateTokens.has(token)).length

  score += sharedTokensCount / Math.max(1, baseTokens.length)

  const matchingTermsCount = baseTerms.filter((term) => candidateTitle.includes(term)).length
  score += matchingTermsCount / Math.max(1, baseTerms.length)

  return score
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

  const aScrapedAt = a.scraped_at ? new Date(a.scraped_at).getTime() : 0
  const bScrapedAt = b.scraped_at ? new Date(b.scraped_at).getTime() : 0

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

const getDedupedRowsByStore = (rows: DbProduct[], baseTitle: string, baseTerms: string[]) => {
  const byStore = new Map<string, ScoredRow>()

  for (const row of rows) {
    const key = getStoreKey(row)
    const score = getSimilarityScore(baseTitle, baseTerms, row)
    if (score < MIN_SIMILARITY_SCORE) {
      continue
    }

    const existing = byStore.get(key)

    if (!existing || compareScoredRows({ row, score }, existing) < 0) {
      byStore.set(key, { row, score })
    }
  }

  return Array.from(byStore.values())
    .sort((a, b) => compareRows(a.row, b.row))
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
  const normalizedTitle = normalizeText(title)
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
  const dedupedRows = getDedupedRowsByStore(uniqueRows, normalizedTitle, searchTerms)

  return {
    product: toSearchProduct(productRow),
    otherStoreProducts: dedupedRows.map(toSearchProduct)
  }
}
