import { toast } from 'vue-sonner'

declare global {
  interface Window {
    __spyNetworkStatusCleanup?: () => void
  }
}

export default defineNuxtPlugin(() => {
  if (!import.meta.client) {
    return
  }

  const runtimeConfig = useRuntimeConfig()
  const healthcheckBaseUrl = (runtimeConfig.public.siteUrl || 'https://spygrocery.com').replace(/\/$/, '')
  const NETWORK_TOAST_ID = 'network-status'
  const HEALTHCHECK_INTERVAL_MS = 10000
  const HEALTHCHECK_TIMEOUT_MS = 4000

  // During dev HMR, ensure old listeners are removed before re-registering.
  window.__spyNetworkStatusCleanup?.()

  const navigatorConnection = (window.navigator as Navigator & { connection?: EventTarget }).connection
  let isOffline = !window.navigator.onLine
  let isHealthcheckRunning = false
  let healthcheckIntervalId: number | null = null

  // Keep notifications transition-based, with optional force for initial offline state.
  const setNotifyOffline = (options?: { force?: boolean }) => {
    if (isOffline && !options?.force) {
      return
    }

    isOffline = true

    // Debug log intentionally kept to inspect connectivity transitions.
    console.log('[network] connection lost')

    toast.error('Connexion perdue', {
      id: NETWORK_TOAST_ID,
      description: 'Reconnectez-vous pour continuer votre parcours et vos sauvegardes.'
    })
  }

  const setNotifyOnline = () => {
    if (!isOffline) {
      return
    }

    isOffline = false

    // Debug log intentionally kept to inspect connectivity transitions.
    console.log('[network] connection restored')

    toast.success('Connexion retablie', {
      id: NETWORK_TOAST_ID,
      description: 'La connexion est revenue. Vous pouvez continuer.'
    })
  }

  const getRunConnectivityHealthcheck = async (source: string) => {
    if (isHealthcheckRunning) {
      return
    }

    isHealthcheckRunning = true
    const abortController = new AbortController()
    const timeoutId = window.setTimeout(() => {
      abortController.abort()
    }, HEALTHCHECK_TIMEOUT_MS)

    try {
      const healthcheckUrl = `${healthcheckBaseUrl}/favicon.ico?network-check=${Date.now()}`

      await fetch(healthcheckUrl, {
        method: 'GET',
        mode: 'no-cors',
        credentials: 'omit',
        cache: 'no-store',
        signal: abortController.signal
      })

      if (!window.navigator.onLine) {
        setNotifyOffline()
        return
      }

      // Debug log intentionally kept to inspect connectivity transitions.
      console.log('[network] healthcheck success', { source })

      setNotifyOnline()
    } catch (error) {
      // Debug log intentionally kept to inspect connectivity transitions.
      console.log('[network] healthcheck failed', {
        source,
        message: error instanceof Error ? error.message : 'unknown network error'
      })

      setNotifyOffline()
    } finally {
      window.clearTimeout(timeoutId)
      isHealthcheckRunning = false
    }
  }

  const setHandleOffline = () => {
    setNotifyOffline()
  }

  const setHandleOnline = () => {
    void getRunConnectivityHealthcheck('browser-online-event')
  }

  const setHandleVisibilityChange = () => {
    if (document.visibilityState !== 'visible') {
      return
    }

    void getRunConnectivityHealthcheck('tab-visible')
  }

  const setHandleConnectionChange = () => {
    void getRunConnectivityHealthcheck('navigator-connection-change')
  }

  // Debug log intentionally kept to inspect connectivity monitor startup.
  console.log('[network] monitor initialized', {
    initiallyOnline: window.navigator.onLine,
    hasConnectionApi: Boolean(navigatorConnection)
  })

  window.addEventListener('offline', setHandleOffline)
  window.addEventListener('online', setHandleOnline)
  document.addEventListener('visibilitychange', setHandleVisibilityChange)
  navigatorConnection?.addEventListener('change', setHandleConnectionChange)

  healthcheckIntervalId = window.setInterval(() => {
    if (document.visibilityState !== 'visible') {
      return
    }

    void getRunConnectivityHealthcheck('periodic-healthcheck')
  }, HEALTHCHECK_INTERVAL_MS)

  if (isOffline) {
    setNotifyOffline({ force: true })
  } else {
    void getRunConnectivityHealthcheck('initial-healthcheck')
  }

  window.__spyNetworkStatusCleanup = () => {
    window.removeEventListener('offline', setHandleOffline)
    window.removeEventListener('online', setHandleOnline)
    document.removeEventListener('visibilitychange', setHandleVisibilityChange)
    navigatorConnection?.removeEventListener('change', setHandleConnectionChange)

    if (healthcheckIntervalId !== null) {
      window.clearInterval(healthcheckIntervalId)
      healthcheckIntervalId = null
    }
  }
})
