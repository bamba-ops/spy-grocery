import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { getSupabaseAuthUserId } from '#shared/utils/getSupabaseAuthUserId'
import { getChatSessions } from '../../../services/ai/chatSessionsService'

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

  const sessions = await getChatSessions({
    supabase,
    userId
  })

  return {
    sessions
  }
})
