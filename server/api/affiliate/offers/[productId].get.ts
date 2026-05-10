import { serverSupabaseClient } from '#supabase/server'
import { listAffiliateOffers } from '../../../services/affiliate/affiliateOffersService'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const productId = getRouterParam(event, 'productId')?.trim() || ''

  const offers = await listAffiliateOffers({
    supabase,
    productId
  })

  return {
    offers
  }
})
