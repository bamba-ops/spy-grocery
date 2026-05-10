import { detectAiReferral, type AiReferralContext } from '#shared/utils/aiReferrals'

type AnalyticsProperties = Record<string, unknown>

const AI_REFERRAL_SESSION_KEY = 'spygrocery.aiReferralContext'
const AI_REFERRAL_LANDING_CAPTURED_KEY = 'spygrocery.aiReferralLandingCaptured'

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

  const getStoredAiReferralContext = (): AiReferralContext | null => {
    if (!import.meta.client) {
      return null
    }

    try {
      const value = window.sessionStorage.getItem(AI_REFERRAL_SESSION_KEY)
      return value ? JSON.parse(value) as AiReferralContext : null
    } catch {
      return null
    }
  }

  const setStoredAiReferralContext = (context: AiReferralContext) => {
    if (!import.meta.client || !context.isAiReferral) {
      return
    }

    try {
      window.sessionStorage.setItem(AI_REFERRAL_SESSION_KEY, JSON.stringify(context))
    } catch {
      // Storage can be unavailable in private browsing; analytics should continue.
    }
  }

  const getAiReferralContext = () => {
    if (!import.meta.client) {
      return null
    }

    const currentContext = detectAiReferral({
      referrer: document.referrer || null,
      currentUrl: window.location.href
    })

    if (currentContext.isAiReferral) {
      setStoredAiReferralContext(currentContext)
      return currentContext
    }

    return getStoredAiReferralContext()
  }

  const getAiReferralProperties = () => {
    const context = getAiReferralContext()

    if (!context?.isAiReferral) {
      return {
        is_ai_referral: false
      }
    }

    return {
      is_ai_referral: true,
      ai_source: context.aiSource,
      ai_referrer_domain: context.referrerDomain,
      ai_referrer_url: context.referrerUrl,
      ai_landing_path: context.landingPath,
      ai_landing_url: context.landingUrl,
      ai_utm_source: context.utmSource,
      ai_utm_medium: context.utmMedium
    }
  }

  const getBaseProperties = () => {
    const viewportWidth = import.meta.client ? window.innerWidth : null
    const viewportHeight = import.meta.client ? window.innerHeight : null

    return {
      app: 'spygrocery',
      ...getRouteContext(),
      referrer: import.meta.client ? document.referrer || null : null,
      ...getAiReferralProperties(),
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

  const captureAiReferralLanding = () => {
    if (!import.meta.client) {
      return
    }

    const context = getAiReferralContext()

    if (!context?.isAiReferral) {
      return
    }

    try {
      if (window.sessionStorage.getItem(AI_REFERRAL_LANDING_CAPTURED_KEY) === '1') {
        return
      }

      window.sessionStorage.setItem(AI_REFERRAL_LANDING_CAPTURED_KEY, '1')
    } catch {
      // If storage fails, still try to capture the landing once for this render.
    }

    capture('ai_referral_landing', {
      source: 'ai_referral_detector'
    })
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
    captureAiReferralLanding,
    identify,
    reset
  }
}
