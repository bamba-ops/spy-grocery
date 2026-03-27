import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { getSupabaseAuthUserId } from '#shared/utils/getSupabaseAuthUserId'
import { listLists } from '../../services/lists/listsService'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const userClaims = await serverSupabaseUser(event).catch(() => null)
  const userId = getSupabaseAuthUserId(userClaims)

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required.'
    })
  }

  const lists = await listLists({
    supabase,
    userId
  })

  return {
    lists
  }
})
