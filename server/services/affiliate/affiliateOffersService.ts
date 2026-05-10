import {
  AFFILIATE_PROVIDER_AMAZON,
  AFFILIATE_PROVIDER_LABELS,
  type AffiliateOffer
} from '#shared/types/affiliate'
import { getAffiliateProductSignature } from '#shared/utils/affiliateProductSignature'
import {
  getAffiliateProductRowById
} from '../../repositories/affiliateOffersRepository'

interface ListAffiliateOffersParams {
  supabase: any
  productId: string
}

interface AffiliateSearchProduct {
  id: string
  title: string | null
  brand: string | null
  uom: string | null
  category: string | null
  search_term: string | null
  description: string | null
}

const AMAZON_ASSOCIATE_TAG = 'spygrocery-20'

const getSafeProductId = (value: string) => {
  const trimmed = value.trim()

  if (!trimmed) {
    throw createError({
      statusCode: 400,
      message: 'Invalid product id.'
    })
  }

  return trimmed
}

const getNormalizedSearchText = (value: string | null | undefined) => {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const getAmazonSearchText = (product: AffiliateSearchProduct) => {
  return [
    product.title,
    product.brand,
    product.uom,
    product.category,
    product.search_term,
    product.description
  ].filter(Boolean).join(' ')
}

const getCanUseAmazonSearchFallback = (product: AffiliateSearchProduct) => {
  return getNormalizedSearchText(getAmazonSearchText(product)).length > 0
}

const getAmazonSearchUrl = (product: AffiliateSearchProduct) => {
  const searchQuery = [
    product.brand,
    product.title,
    product.uom
  ]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(' ')
    .trim()

  if (!searchQuery) {
    return null
  }

  const params = new URLSearchParams({
    k: searchQuery,
    tag: AMAZON_ASSOCIATE_TAG
  })

  return `https://www.amazon.ca/s?${params.toString()}`
}

const toAmazonSearchFallbackOffer = (
  product: AffiliateSearchProduct,
  productSignature: string
): AffiliateOffer | null => {
  if (!getCanUseAmazonSearchFallback(product)) {
    return null
  }

  const affiliateUrl = getAmazonSearchUrl(product)

  if (!affiliateUrl) {
    return null
  }

  return {
    id: `${AFFILIATE_PROVIDER_AMAZON}-search-${product.id}`,
    provider: AFFILIATE_PROVIDER_AMAZON,
    providerLabel: AFFILIATE_PROVIDER_LABELS.amazon,
    productSignature,
    affiliateUrl,
    offerSource: 'search_fallback',
    label: 'Recherche Amazon',
    ctaLabel: 'Chercher sur Amazon',
    badgeLabel: 'Lien rémunéré'
  }
}

export const listAffiliateOffers = async ({
  supabase,
  productId
}: ListAffiliateOffersParams): Promise<AffiliateOffer[]> => {
  const safeProductId = getSafeProductId(productId)
  const product = await getAffiliateProductRowById(supabase, safeProductId)

  if (!product) {
    throw createError({
      statusCode: 404,
      message: 'Product not found.'
    })
  }

  const productSignature = getAffiliateProductSignature(product)

  if (!productSignature) {
    console.log('[affiliate][amazon] product signature empty:', {
      productId: safeProductId
    })

    return []
  }

  const fallbackOffer = toAmazonSearchFallbackOffer(product, productSignature)

  console.log('[affiliate][amazon] search fallback checked:', {
    productId: safeProductId,
    productSignature,
    hasOffer: Boolean(fallbackOffer)
  })

  return fallbackOffer ? [fallbackOffer] : []
}
