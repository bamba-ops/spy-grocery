import {
  getIsBlockingOnboardingStatus,
  ONBOARDING_ROUTE_PATH
} from '#shared/utils/onboarding'
import { useOnboarding } from '~/composables/api/useOnboarding'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.isReady) {
    await authStore.initAuth()
  }

  if (!authStore.user) {
    return
  }

  if (to.path.startsWith(ONBOARDING_ROUTE_PATH) || to.path.startsWith('/login') || to.path.startsWith('/auth/confirm')) {
    return
  }

  try {
    const onboardingApi = useOnboarding()
    const onboardingState = await onboardingApi.getOnboardingState()

    if (!getIsBlockingOnboardingStatus(onboardingState.status)) {
      return
    }

    return navigateTo(ONBOARDING_ROUTE_PATH)
  } catch (error: any) {
    const statusCode = Number(error?.statusCode || error?.response?.status || 0)

    if (statusCode === 401) {
      return
    }

    console.error('[onboarding] middleware check failed:', {
      statusCode,
      message: error?.message || 'Unknown onboarding middleware error'
    })
  }
})
