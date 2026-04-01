import { serverSupabaseClient } from '#supabase/server'
import { toSlug } from '#shared/utils/toSlug'
import { getStoreOverview } from '../../services/stores/getStoreOverview'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const rawStoreParam = getRouterParam(event, 'store')?.trim() || ''
  const storeSlug = toSlug(rawStoreParam)

  if (!storeSlug) {
    throw createError({
      statusCode: 400,
      message: 'Invalid store slug'
    })
  }

  return getStoreOverview(supabase, storeSlug)
})
