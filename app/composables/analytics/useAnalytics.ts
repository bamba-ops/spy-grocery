type AnalyticsProperties = Record<string, unknown>

export const useAnalytics = () => {
  const getPosthogClient = () => {
    if (!import.meta.client) {
      return null
    }

    const { $posthog } = useNuxtApp()

    if (typeof $posthog !== 'function') {
      return null
    }

    return $posthog()
  }

  const getRouteContext = () => {
    try {
      const route = useRoute()

      return {
        route_path: route.path,
        route_full_path: route.fullPath
      }
    } catch {
      return {
        route_path: null,
        route_full_path: null
      }
    }
  }

  const getDeviceBucket = (width: number | null) => {
    if (typeof width !== 'number') {
      return null
    }

    if (width < 768) {
      return 'mobile'
    }

    if (width < 1024) {
      return 'tablet'
    }

    return 'desktop'
  }

  const getBaseProperties = () => {
    const viewportWidth = import.meta.client ? window.innerWidth : null
    const viewportHeight = import.meta.client ? window.innerHeight : null

    return {
      app: 'spygrocery',
      ...getRouteContext(),
      referrer: import.meta.client ? document.referrer || null : null,
      device_bucket: getDeviceBucket(viewportWidth),
      viewport_width: viewportWidth,
      viewport_height: viewportHeight
    }
  }

  const getCleanProperties = (properties: AnalyticsProperties) => {
    return Object.fromEntries(
      Object.entries(properties).filter(([, value]) => value !== undefined)
    )
  }

  const capture = (event: string, properties: AnalyticsProperties = {}) => {
    const client = getPosthogClient()
    const normalizedEvent = event.trim()

    if (!client || !normalizedEvent) {
      return
    }

    client.capture(normalizedEvent, getCleanProperties({
      ...getBaseProperties(),
      ...properties
    }))
  }

  const identify = (userId: string, properties: AnalyticsProperties = {}) => {
    const client = getPosthogClient()
    const normalizedUserId = userId.trim()

    if (!client || !normalizedUserId) {
      return
    }

    client.identify(normalizedUserId, getCleanProperties({
      app: 'spygrocery',
      ...properties
    }))
  }

  const reset = () => {
    const client = getPosthogClient()

    if (!client) {
      return
    }

    client.reset()
  }

  return {
    capture,
    identify,
    reset
  }
}
