import type { SearchProduct } from '#shared/types'
import type { ListProduct } from '#shared/types/lists'

export const getAnalyticsNormalizedQuery = (query: string | null | undefined) => {
  return (query || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export const getAnalyticsQueryProperties = (query: string | null | undefined) => {
  const normalizedQuery = getAnalyticsNormalizedQuery(query)

  return {
    query: (query || '').trim(),
    normalized_query: normalizedQuery,
    query_length: normalizedQuery.length
  }
}

export const getAnalyticsProductProperties = (product: SearchProduct | null | undefined) => {
  return {
    product_id: product?.id ?? null,
    external_id: product?.external_id ?? null,
    product_title: product?.title ?? null,
    brand: product?.brand ?? null,
    store: product?.store ?? null,
    store_slug: product?.store_slug ?? null,
    price_num: product?.price_num ?? null,
    is_active: product?.is_active ?? null
  }
}

export const getAnalyticsTopProductsProperties = (products: SearchProduct[], limit = 5) => {
  const topProducts = products.slice(0, limit)
  const getUniqueValues = (values: Array<string | null | undefined>) => {
    return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))]
      .slice(0, limit)
  }

  return {
    top_product_ids: topProducts.map((product) => product.id),
    top_product_titles: topProducts.map((product) => product.title),
    top_brands: getUniqueValues(topProducts.map((product) => product.brand)),
    top_stores: getUniqueValues(topProducts.map((product) => product.store))
  }
}

export const getAnalyticsListProperties = (items: ListProduct[]) => {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const uniqueProductCount = new Set(items.map((item) => item.product.id)).size
  const uniqueStoreCount = new Set(items.map((item) => item.product.store).filter(Boolean)).size
  const listTotalValue = items.reduce((total, item) => {
    return total + (item.product.price_num ?? 0) * item.quantity
  }, 0)

  return {
    list_item_count: itemCount,
    unique_product_count: uniqueProductCount,
    list_total_value: Number(listTotalValue.toFixed(2)),
    unique_store_count: uniqueStoreCount
  }
}
