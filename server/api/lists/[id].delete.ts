import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { getSupabaseAuthUserId } from '#shared/utils/getSupabaseAuthUserId'
import { deleteList } from '../../services/lists/listsService'

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

  const listId = getRouterParam(event, 'id')

  await deleteList({
    supabase,
    userId,
    listId: listId || ''
  })

  return {
    success: true
  }
})
