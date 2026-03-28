import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { getSupabaseAuthUserId } from '#shared/utils/getSupabaseAuthUserId'
import { getOnboarding } from '../../services/onboarding/onboardingService'

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

  const onboarding = await getOnboarding({
    supabase,
    userId
  })

  return {
    onboarding
  }
})
