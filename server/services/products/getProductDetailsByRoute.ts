import { getProductRoutePath, parseProductRouteParts } from '#shared/utils/productRoute'
import type { ProductDetailsByRouteResponse } from '#shared/types/product-details'
import { getProductRowByStoreAndExternalId } from '../../repositories/productsRepository'
import { getProductDetails } from './getProductDetails'

interface GetProductDetailsByRouteParams {
  supabase: any
  storeSlug: string
  productSlug: string
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
