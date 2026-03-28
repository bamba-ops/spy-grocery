import type {
  OnboardingResponse,
  OnboardingState,
  UpdateOnboardingPayload
} from '#shared/types/onboarding'
import { ONBOARDING_API_PATH } from '#shared/utils/onboarding'

export const useOnboarding = () => {
  const getOnboardingState = async (): Promise<OnboardingState> => {
    const response = await $fetch<OnboardingResponse>(ONBOARDING_API_PATH)
    return response.onboarding
  }

  const setOnboardingState = async (payload: UpdateOnboardingPayload): Promise<OnboardingState> => {
    const response = await $fetch<OnboardingResponse>(ONBOARDING_API_PATH, {
      method: 'PATCH',
      body: payload
    })

    return response.onboarding
  }

  return {
    getOnboardingState,
    setOnboardingState
  }
}
