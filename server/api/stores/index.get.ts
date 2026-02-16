import { serverSupabaseClient } from '#supabase/server'
import { listStores } from '../../services/stores/listStores'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const storesWithCount = await listStores(supabase)

  return {
    stores: storesWithCount || []
  }
})
