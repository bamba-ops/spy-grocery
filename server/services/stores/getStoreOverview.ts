import type { DbProduct, SearchProduct, StoreOverviewResponse } from '#shared/types'
import { fetchStoreProductRowsByStoreSlug } from '../../repositories/storesRepository'

const MAX_LATEST_PROMOS = 12
const MAX_BEST_PRODUCTS = 12

const normalizeText = (value: string | null) => {
  if (!value) {
    return ''
  }

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
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

const getTimestamp = (value: string | null) => {
  if (!value) {
    return 0
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const getStoreLastUpdatedAt = (rows: DbProduct[]) => {
  let latestValue: string | null = null
  let latestTimestamp = 0

  rows.forEach((row) => {
    const timestamp = getTimestamp(row.scraped_at || null)
    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp
      latestValue = row.scraped_at || null
    }
  })

  return latestValue
}

const getLatestPromos = (rows: DbProduct[]) => {
  return [...rows]
    .sort((a, b) => {
      const timestampOrder = getTimestamp(b.scraped_at || null) - getTimestamp(a.scraped_at || null)
      if (timestampOrder !== 0) {
        return timestampOrder
      }

      return (a.title || '').localeCompare(b.title || '')
    })
    .slice(0, MAX_LATEST_PROMOS)
    .map(toSearchProduct)
}

const getBestProducts = (rows: DbProduct[]) => {
  const byPrice = [...rows]
    .filter((row) => typeof row.price_num === 'number')
    .sort((a, b) => {
      const aPrice = typeof a.price_num === 'number' ? a.price_num : Number.POSITIVE_INFINITY
      const bPrice = typeof b.price_num === 'number' ? b.price_num : Number.POSITIVE_INFINITY

      if (aPrice !== bPrice) {
        return aPrice - bPrice
      }

      return getTimestamp(b.scraped_at || null) - getTimestamp(a.scraped_at || null)
    })

  const deduped = new Map<string, DbProduct>()

  for (const row of byPrice) {
    const key = normalizeText(`${row.title || ''}::${row.brand || ''}`)
    if (!key || deduped.has(key)) {
      continue
    }

    deduped.set(key, row)

    if (deduped.size >= MAX_BEST_PRODUCTS) {
      break
    }
  }

  return Array.from(deduped.values()).map(toSearchProduct)
}

export const getStoreOverview = async (
  supabase: any,
  storeSlug: string
): Promise<StoreOverviewResponse> => {
  const rows = await fetchStoreProductRowsByStoreSlug(supabase, storeSlug)

  if (rows.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'Store not found'
    })
  }

  const storeName = rows[0]?.store || storeSlug
  const explicitOnSaleCount = rows.filter((row) => row.on_sale === true).length
  const activeSpecialsCount = explicitOnSaleCount > 0 ? explicitOnSaleCount : rows.length
  const latestPromos = getLatestPromos(rows)
  const bestProducts = getBestProducts(rows)

  return {
    store: {
      slug: storeSlug,
      name: storeName,
      productCount: rows.length,
      activeSpecialsCount,
      lastUpdatedAt: getStoreLastUpdatedAt(rows)
    },
    latestPromos,
    bestProducts: bestProducts.length > 0 ? bestProducts : latestPromos.slice(0, MAX_BEST_PRODUCTS)
  }
}
