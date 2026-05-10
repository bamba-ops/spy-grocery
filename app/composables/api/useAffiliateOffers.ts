import type { AffiliateOffersResponse } from '#shared/types/affiliate'

export const useAffiliateOffers = () => {
  const getOffersByProductId = async (productId: string) => {
    const response = await $fetch<AffiliateOffersResponse>(
      `/api/affiliate/offers/${encodeURIComponent(productId)}` as string
    )

    return response.offers || []
  }

  return {
    getOffersByProductId
  }
}
