import type { SearchProduct } from '#shared/types'
import { toSlug } from './toSlug'

interface ParsedProductRouteParts {
  storeSlug: string
  productSlug: string
  titleSlug: string
  externalId: string
}

const PRODUCT_ROUTE_PREFIX = '/produits'
const LEGACY_PRODUCT_ROUTE_PREFIX = '/products'

const getNormalizedSegment = (value: string) => value.trim().toLowerCase()

const getIsValidToken = (value: string) => /^[a-z0-9_-]+$/.test(value)

export const parseProductRouteParts = (
  storeParam: string,
  productParam: string
): ParsedProductRouteParts | null => {
  const normalizedStoreSlug = toSlug(storeParam)
  const normalizedProductSlug = getNormalizedSegment(productParam)

  if (!normalizedStoreSlug || !normalizedProductSlug) {
    return null
  }

  const separatorIndex = normalizedProductSlug.lastIndexOf('-')
  if (separatorIndex <= 0 || separatorIndex >= normalizedProductSlug.length - 1) {
    return null
  }

  const titleSlug = toSlug(normalizedProductSlug.slice(0, separatorIndex))
  const externalId = normalizedProductSlug.slice(separatorIndex + 1)

  if (!titleSlug || !getIsValidToken(externalId)) {
    return null
  }

  return {
    storeSlug: normalizedStoreSlug,
    productSlug: `${titleSlug}-${externalId}`,
    titleSlug,
    externalId
  }
}

export const getProductRoutePath = (
  product: Pick<SearchProduct, 'slug' | 'store' | 'title' | 'store_slug' | 'title_slug' | 'external_id'>
) => {
  const storeSlug = product.store_slug || toSlug(product.store || '')
  const titleSlug = product.title_slug || toSlug(product.title || '')
  const externalId = (product.external_id || '').trim()

  if (!storeSlug || !titleSlug || !getIsValidToken(externalId)) {
    return `${LEGACY_PRODUCT_ROUTE_PREFIX}/${encodeURIComponent(product.slug)}`
  }

  return `${PRODUCT_ROUTE_PREFIX}/${encodeURIComponent(storeSlug)}/${encodeURIComponent(`${titleSlug}-${externalId}`)}`
}
