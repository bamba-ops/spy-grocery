import { getProductRoutePath, parseProductRouteParts } from '#shared/utils/productRoute'
import type { ProductDetailsByRouteResponse } from '#shared/types/product-details'
import {
  getLatestProductRowByExternalId,
  getLatestProductRowByStoreAndTitleSlug,
  getProductRowByStoreAndExternalId,
  searchProductsRows
} from '../../repositories/productsRepository'
import { getProductDetails } from './getProductDetails'

interface GetProductDetailsByRouteParams {
  supabase: any
  storeSlug: string
  productSlug: string
}

const getFallbackSearchQuery = (titleSlug: string) => {
  return titleSlug
    .split('-')
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .join(' ')
}

export const getProductDetailsByRoute = async ({
  supabase,
  storeSlug,
  productSlug
}: GetProductDetailsByRouteParams): Promise<ProductDetailsByRouteResponse> => {
  const routeParts = parseProductRouteParts(storeSlug, productSlug)

  if (!routeParts) {
    throw createError({
      statusCode: 400,
      message: 'Invalid product route parameters'
    })
  }

  let row = await getProductRowByStoreAndExternalId(
    supabase,
    routeParts.storeSlug,
    routeParts.externalId
  )

  if (!row) {
    row = await getLatestProductRowByStoreAndTitleSlug(
      supabase,
      routeParts.storeSlug,
      routeParts.titleSlug
    )
  }

  if (!row) {
    row = await getLatestProductRowByExternalId(
      supabase,
      routeParts.externalId
    )
  }

  if (!row) {
    const fallbackSearchQuery = getFallbackSearchQuery(routeParts.titleSlug)

    if (fallbackSearchQuery) {
      const { rows } = await searchProductsRows(supabase, {
        searchQuery: fallbackSearchQuery,
        store: routeParts.storeSlug,
        sortBy: 'relevance',
        availability: 'all',
        limit: 1,
        offset: 0
      })

      row = rows[0] || null
    }
  }

  if (!row) {
    throw createError({
      statusCode: 410,
      message: 'This product page is no longer available.'
    })
  }

  const details = await getProductDetails({
    supabase,
    slug: row.slug
  })

  const canonicalPath = getProductRoutePath(details.product)
  const currentPath = `/produits/${routeParts.storeSlug}/${routeParts.productSlug}`

  return {
    ...details,
    canonicalPath,
    shouldRedirect: canonicalPath !== currentPath
  }
}
