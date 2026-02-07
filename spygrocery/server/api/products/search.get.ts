import { serverSupabaseClient } from '#supabase/server'
import type { Product } from '~/types'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const query = getQuery(event)

  // Parse query params
  const searchQuery = query.q?.toString() || ''
  const storeFilter = query.stores?.toString() || ''
  const sortBy = query.sort?.toString() || 'price-low'
  const limit = parseInt(query.limit?.toString() || '50')
  const offset = parseInt(query.offset?.toString() || '0')
  const promosOnly = query.promos?.toString() === 'true' || false

  const storeIds = storeFilter ? storeFilter.split(',').filter(Boolean) : []
  let promoTotal: number | null = null
  let promoPagedIds: string[] | null = null

  // If promos only, build a promo product id list first
  let promoProductIds: string[] | null = null
  if (promosOnly) {
    let promoQuery = supabase
      .from('latest_price')
      .select('product_id, store_id')
      .eq('is_promo', true)

    if (storeIds.length > 0) {
      promoQuery = promoQuery.in('store_id', storeIds)
    }

    const { data: promoEntries, error: promoError } = await promoQuery

    if (promoError) {
      throw createError({
        statusCode: 500,
        message: `Promo lookup failed: ${promoError.message}`
      })
    }

    const promoIds = (promoEntries || [])
      .map(entry => entry.product_id)
      .filter((id): id is string => Boolean(id))

    promoProductIds = [...new Set(promoIds)]

    if (promoProductIds.length === 0) {
      return {
        products: [],
        total: 0,
        page: Math.floor(offset / limit) + 1,
        limit,
        totalPages: 0
      }
    }

    promoTotal = promoProductIds.length
    promoPagedIds = promoProductIds.slice(offset, offset + limit)
    if (promoPagedIds.length === 0) {
      return {
        products: [],
        total: promoTotal,
        page: Math.floor(offset / limit) + 1,
        limit,
        totalPages: Math.ceil(promoTotal / limit)
      }
    }
  }

  // Build the query
  const selectFields = `
      id,
      name,
      brand,
      slug,
      unit,
      image_url,
      link,
      store_id
    `

  let dbQuery = supabase
    .from('products')
    .select(selectFields, promoPagedIds ? undefined : { count: 'exact' })

  // Apply search filter
  if (searchQuery) {
    dbQuery = dbQuery.or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
  }

  // Apply store filter
  if (storeIds.length > 0) {
    dbQuery = dbQuery.in('store_id', storeIds)
  }

  if (promoPagedIds) {
    dbQuery = dbQuery.in('id', promoPagedIds)
  }

  // Apply sorting
  switch (sortBy) {
    case 'name':
      dbQuery = dbQuery.order('name', { ascending: true })
      break
    case 'price-high':
    case 'price-low':
      // We'll sort by price after joining with latest_price
      dbQuery = dbQuery.order('name', { ascending: true })
      break
    default:
      dbQuery = dbQuery.order('name', { ascending: true })
  }

  // Apply pagination (skip if promo IDs already paged)
  if (!promoPagedIds) {
    dbQuery = dbQuery.range(offset, offset + limit - 1)
  }

  const { data: products, error, count } = await dbQuery

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Search failed: ${error.message}`
    })
  }

  if (!products || products.length === 0) {
    return {
      products: [],
      total: 0,
      page: Math.floor(offset / limit) + 1,
      limit,
      totalPages: 0
    }
  }

  // Get store info
  const resultStoreIds = [...new Set(
    products
      .map(p => p.store_id)
      .filter((id): id is string => Boolean(id))
  )]
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, slug, image_url')
    .in('id', resultStoreIds)

  const storeMap = new Map(stores?.map(s => [s.id, s]) || [])

  // Get latest prices
  const productIds = products.map(p => p.id)
  let pricesQuery = supabase
    .from('latest_price')
    .select('*')
    .in('product_id', productIds)

  const { data: prices } = await pricesQuery


  const priceMap = new Map(prices?.map(p => [p.product_id, p]) || [])

  // Combine data
  const baseResult = products
    .map(product => {
      const store = storeMap.get(product.store_id!)
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
        is_promo: price?.is_promo ?? null
      }
    })
    .filter((p): p is Product => p !== null)

  let result: Product[] = baseResult

  if (promosOnly) {
    result = result.filter(item => item.is_promo)
  }

  // Sort by price if needed
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
  }

  const totalCount = promoTotal ?? (count || 0)

  return {
    products: result,
    total: totalCount,
    page: Math.floor(offset / limit) + 1,
    limit,
    totalPages: Math.ceil(totalCount / limit)
  }
})
