import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { getSupabaseAuthUserId } from '#shared/utils/getSupabaseAuthUserId'
import { getChatSessionById } from '../../../services/ai/chatSessionsService'

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

  const sessionId = getRouterParam(event, 'id') || ''

  const session = await getChatSessionById({
    supabase,
    userId,
    sessionId
  })

  return {
    session
  }
})
