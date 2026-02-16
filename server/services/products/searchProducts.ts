import type { Product } from '#shared/types'
import {
  getLatestPricesByProductIds,
  getPromoProductIds,
  getStoresByIds,
  searchProductsRows
} from '../../repositories/productsRepository'

interface SearchProductsParams {
  supabase: any
  searchQuery: string
  storeFilter: string
  sortBy: string
  limit: number
  offset: number
  promosOnly: boolean
  dedupe: boolean
}

const toPagination = (offset: number, limit: number, total: number) => ({
  page: Math.floor(offset / limit) + 1,
  limit,
  totalPages: Math.ceil(total / limit)
})

export const searchProducts = async ({
  supabase,
  searchQuery,
  storeFilter,
  sortBy,
  limit,
  offset,
  promosOnly,
  dedupe
}: SearchProductsParams) => {
  const storeIds = storeFilter ? storeFilter.split(',').filter(Boolean) : []

  let promoTotal: number | null = null
  let promoPagedIds: string[] | null = null

  if (promosOnly) {
    const promoProductIds = [...new Set(await getPromoProductIds(supabase, storeIds))]

    if (promoProductIds.length === 0) {
      return {
        products: [],
        total: 0,
        ...toPagination(offset, limit, 0)
      }
    }

    promoTotal = promoProductIds.length
    promoPagedIds = promoProductIds.slice(offset, offset + limit)

    if (promoPagedIds.length === 0) {
      return {
        products: [],
        total: promoTotal,
        ...toPagination(offset, limit, promoTotal)
      }
    }
  }

  const { products: productRows, count } = await searchProductsRows(supabase, {
    searchQuery,
    storeIds,
    sortBy,
    limit,
    offset,
    promoPagedIds
  })

  if (!productRows || productRows.length === 0) {
    return {
      products: [],
      total: 0,
      ...toPagination(offset, limit, 0)
    }
  }

  const resultStoreIds = [...new Set(
    productRows
      .map(p => p.store_id)
      .filter((id): id is string => Boolean(id))
  )]

  const [stores, prices] = await Promise.all([
    getStoresByIds(supabase, resultStoreIds),
    getLatestPricesByProductIds(supabase, productRows.map(p => p.id))
  ])

  const storeMap = new Map(stores.map(s => [s.id, s]))
  const priceMap = new Map(prices.map(p => [p.product_id, p]))

  const baseResult = productRows
    .map(product => {
      const store = storeMap.get(product.store_id)
      const price = priceMap.get(product.id)

      if (!store) return null

      return {
        id: product.id,
        name: product.name || '',
        brand: product.brand,
        slug: product.slug || '',
        unit: product.unit,
        image_url: product.image_url,
        link: product.link,
        store: {
          id: store.id,
          name: store.name || '',
          slug: store.slug || '',
          image_url: store.image_url
        },
        price: price?.price || null,
        price_un: price?.price_un || null,
        price_unit: price?.unit || null,
        is_promo: promosOnly ? true : (price?.is_promo ?? null)
      }
    })
    .filter((p): p is Product => p !== null)

  let result = baseResult

  if (promosOnly) {
    result = result.filter(item => item.is_promo)
  }

  if (dedupe) {
    const keyFor = (p: Product) => JSON.stringify([
      p.store.id,
      p.name,
      p.brand,
      p.unit,
      p.image_url,
      p.link
    ])

    const chooseBetter = (a: Product, b: Product) => {
      const aPromo = Boolean(a.is_promo)
      const bPromo = Boolean(b.is_promo)
      if (aPromo !== bPromo) return bPromo ? b : a

      const aPrice = a.price
      const bPrice = b.price
      if (aPrice === null && bPrice !== null) return b
      if (aPrice !== null && bPrice === null) return a
      if (aPrice !== null && bPrice !== null && aPrice !== bPrice) {
        return bPrice < aPrice ? b : a
      }

      return b.id < a.id ? b : a
    }

    const map = new Map<string, Product>()
    for (const item of result) {
      const key = keyFor(item)
      const existing = map.get(key)
      if (!existing) {
        map.set(key, item)
      } else {
        map.set(key, chooseBetter(existing, item))
      }
    }
    result = Array.from(map.values())
  }

  if (sortBy === 'price-low') {
    result.sort((a, b) => {
      const priceA = a.price || Infinity
      const priceB = b.price || Infinity
      return priceA - priceB
    })
  } else if (sortBy === 'price-high') {
    result.sort((a, b) => {
      const priceA = a.price || 0
      const priceB = b.price || 0
      return priceB - priceA
    })
  } else if (sortBy === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name))
  }

  const totalCount = promoTotal ?? count

  return {
    products: result,
    total: totalCount,
    ...toPagination(offset, limit, totalCount)
  }
}
