import { defineNuxtPlugin } from '#app'
import posthog, { type PostHog } from 'posthog-js'

const getIsEnabled = (value: unknown, fallback = true) => {
  if (typeof value === 'boolean') {
    return value
  }

  const normalizedValue = typeof value === 'string' ? value.trim().toLowerCase() : ''

  if (!normalizedValue) {
    return fallback
  }

  return !['0', 'false', 'off', 'no'].includes(normalizedValue)
}

export default defineNuxtPlugin<{ posthog: () => PostHog | null }>(() => {
  const runtimeConfig = useRuntimeConfig()
  const posthogEnabled = getIsEnabled(runtimeConfig.public.posthogEnabled, true)
  const posthogPublicKey = String(runtimeConfig.public.posthogPublicKey || '').trim()
  const posthogHost = String(runtimeConfig.public.posthogHost || '').trim()

  let posthogClient: PostHog | null = null

  // This flag allows disabling PostHog without removing key/host env vars.
  if (!posthogEnabled) {
    console.log('[posthog] disabled by NUXT_PUBLIC_POSTHOG_ENABLED')
  } else if (!posthogPublicKey || !posthogHost) {
    console.log('[posthog] disabled because key/host are missing', {
      hasKey: Boolean(posthogPublicKey),
      hasHost: Boolean(posthogHost)
    })
  } else {
    posthogClient = posthog.init(posthogPublicKey, {
      api_host: posthogHost,
      loaded: (loadedPosthog) => {
        if (import.meta.env.MODE === 'development') {
          loadedPosthog.debug()
        }
      }
    })
  }

  return {
    provide: {
      posthog: () => posthogClient
    }
  }
})
