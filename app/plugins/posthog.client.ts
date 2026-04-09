import { defineNuxtPlugin } from '#app'
import posthog from 'posthog-js'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()
  const posthogPublicKey = String(runtimeConfig.public.posthogPublicKey || '').trim()
  const posthogHost = String(runtimeConfig.public.posthogHost || '').trim()

  if (!posthogPublicKey || !posthogHost) {
    return {
      provide: {
        posthog: () => null
      }
    }
  }

  const posthogClient = posthog.init(posthogPublicKey, {
    api_host: posthogHost,
    loaded: (loadedPosthog) => {
      if (import.meta.env.MODE === 'development') {
        loadedPosthog.debug()
      }
    }
  })

  return {
    provide: {
      posthog: () => posthogClient
    }
  }
})
