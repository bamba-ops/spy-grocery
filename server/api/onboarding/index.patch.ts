import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { UpdateOnboardingPayload } from '#shared/types/onboarding'
import { getSupabaseAuthUserId } from '#shared/utils/getSupabaseAuthUserId'
import { updateOnboarding } from '../../services/onboarding/onboardingService'

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

  const payload = await readBody<UpdateOnboardingPayload | null>(event)

  const onboarding = await updateOnboarding({
    supabase,
    userId,
    payload
  })

  return {
    onboarding
  }
})
