import type { Product } from '#shared/types'
import {
  getLatestPricesByProductIds,
  getProductsByIds,
  getStoresByIds
} from '../../repositories/productsRepository'

interface GetFeaturedProductsParams {
  supabase: any
  ids: string[]
}

export const getFeaturedProducts = async ({ supabase, ids }: GetFeaturedProductsParams) => {
  const normalizedIds = ids
    .map((id) => id.trim())
    .filter(Boolean)

  const uniqueIds = [...new Set(normalizedIds)]

  if (uniqueIds.length === 0) {
    return [] as Product[]
  }

  const productRows = await getProductsByIds(supabase, uniqueIds)

  if (productRows.length === 0) {
    return [] as Product[]
  }

  const storeIds = [...new Set(productRows.map((row) => row.store_id).filter(Boolean))]

  const [stores, latestPrices] = await Promise.all([
    getStoresByIds(supabase, storeIds),
    getLatestPricesByProductIds(supabase, productRows.map((row) => row.id))
  ])

  const storeMap = new Map(stores.map((store) => [store.id, store]))
  const priceMap = new Map(latestPrices.map((price) => [price.product_id, price]))

  return productRows
    .map((row) => {
      const store = storeMap.get(row.store_id)
      if (!store) return null

      const price = priceMap.get(row.id)

      return {
        id: row.id,
        name: row.name || '',
        brand: row.brand,
        slug: row.slug || '',
        unit: row.unit,
        image_url: row.image_url,
        link: row.link,
        store: {
          id: store.id,
          name: store.name || '',
          slug: store.slug || '',
          image_url: store.image_url
        },
        price: price?.price || null,
        price_un: price?.price_un || null,
        price_unit: price?.unit || null,
        is_promo: price?.is_promo ?? null
      } as Product
    })
    .filter((product): product is Product => product !== null)
}
