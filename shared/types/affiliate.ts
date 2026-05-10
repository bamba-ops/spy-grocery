export const AFFILIATE_PROVIDER_AMAZON = 'amazon' as const

export const AFFILIATE_PROVIDER_LABELS = {
  [AFFILIATE_PROVIDER_AMAZON]: 'Amazon'
} as const

export type AffiliateProvider = typeof AFFILIATE_PROVIDER_AMAZON

export interface AffiliateOffer {
  id: string
  provider: AffiliateProvider
  providerLabel: string
  productSignature: string
  affiliateUrl: string
  offerSource: 'search_fallback'
  label: string
  ctaLabel: string
  badgeLabel: string
}

export interface AffiliateOffersResponse {
  offers: AffiliateOffer[]
}
