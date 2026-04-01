import type { OnboardingStatus } from '../types/onboarding'

export const ONBOARDING_API_PATH = '/api/onboarding'
export const ONBOARDING_ROUTE_PATH = '/onboarding'
export const ONBOARDING_DEFAULT_STEP = 1
export const ONBOARDING_MAX_STEP = 3
export const ONBOARDING_MAX_INTENT_LENGTH = 2000
export const ONBOARDING_FIRST_SESSION_TITLE = 'First grocery list'

export const getIsBlockingOnboardingStatus = (status: OnboardingStatus) => {
  return status === 'not_started' || status === 'in_progress'
}

export const getCanResumeOnboardingStatus = (status: OnboardingStatus) => {
  return status === 'skipped'
}
