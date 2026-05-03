import {
  getIsBlockingOnboardingState,
  ONBOARDING_ROUTE_PATH
} from '#shared/utils/onboarding'
import { getAuthNextPath } from '#shared/utils/authRedirect'
import { useOnboarding } from '~/composables/api/useOnboarding'

interface PostLoginDestinationOptions {
  attempts?: number
  retryDelayMs?: number
  source?: string
}

const wait = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

const getErrorStatusCode = (error: unknown) => {
  const errorLike = error as {
    statusCode?: unknown
    response?: {
      status?: unknown
    }
  }

  return Number(errorLike?.statusCode || errorLike?.response?.status || 0)
}

export const usePostLoginDestination = () => {
  const onboardingApi = useOnboarding()

  const getPostLoginDestination = async (
    nextPath: string | null | undefined,
    options?: PostLoginDestinationOptions
  ) => {
    const intendedPath = getAuthNextPath(nextPath)

    if (intendedPath.startsWith(ONBOARDING_ROUTE_PATH)) {
      return intendedPath
    }

    const attempts = Math.max(1, options?.attempts ?? 1)
    const retryDelayMs = Math.max(0, options?.retryDelayMs ?? 0)

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const onboardingState = await onboardingApi.getOnboardingState()

        if (getIsBlockingOnboardingState(onboardingState.status, onboardingState.current_step)) {
          return ONBOARDING_ROUTE_PATH
        }

        return intendedPath
      } catch (error) {
        const statusCode = getErrorStatusCode(error)

        if (statusCode === 401) {
          return intendedPath
        }

        if (attempt === attempts - 1) {
          console.error('[onboarding] post-login destination check failed:', {
            source: options?.source || 'post_login',
            statusCode,
            error
          })
          break
        }

        if (retryDelayMs > 0) {
          await wait(retryDelayMs)
        }
      }
    }

    return intendedPath
  }

  return {
    getPostLoginDestination
  }
}
