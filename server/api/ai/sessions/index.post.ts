import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { CreateChatSessionBody } from '#shared/types/ai-chat'
import { getSupabaseAuthUserId } from '#shared/utils/getSupabaseAuthUserId'
import { createChatSession } from '../../../services/ai/chatSessionsService'

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

  const payload = await readBody<CreateChatSessionBody | null>(event)

  const session = await createChatSession({
    supabase,
    userId,
    payload
  })

  return {
    session
  }
})
