import type { DbProduct, StoreOverviewResponse } from '#shared/types'
import { getIsProductActive } from '#shared/utils/productAvailability'
import { fetchStoreProductRowsByStoreSlug } from '../../repositories/storesRepository'
import { toSearchProduct } from '../products/toSearchProduct'

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
  const activeRows = rows.filter((row) => getIsProductActive(row.valid_from, row.valid_to))

  if (rows.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'Store not found'
    })
  }

  const storeName = rows[0]?.store || storeSlug
  const activeSpecialsCount = activeRows.length
  const latestPromos = getLatestPromos(activeRows)
  const bestProducts = getBestProducts(activeRows)

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
