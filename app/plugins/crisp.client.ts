const CRISP_SCRIPT_ID = 'crisp-chat-script'
const CRISP_SCRIPT_SRC = 'https://client.crisp.chat/l.js'
const CRISP_WEBSITE_ID = 'f06da635-515f-4d61-9031-1afb4946d3d2'

const CRISP_POPUP_DELAY_MS = 8000
const CRISP_POPUP_SEEN_SESSION_KEY = 'spygrocery:crisp-popup-seen'
const CRISP_POPUP_MESSAGE = 'Bonjour! Besoin d aide pour trouver le meilleur prix?'

const getCanSchedulePopupForPath = (path: string) => {
  return path === '/' || path === '/search' || path.startsWith('/produits/')
}

export default defineNuxtPlugin(() => {
  if (!import.meta.client) {
    return
  }

  const route = useRoute()
  const windowWithCrisp = window as typeof window & {
    $crisp?: Array<unknown>
    CRISP_WEBSITE_ID?: string
  }

  if (!Array.isArray(windowWithCrisp.$crisp)) {
    windowWithCrisp.$crisp = []
  }

  windowWithCrisp.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID

  const existingScript = document.getElementById(CRISP_SCRIPT_ID)

  if (!existingScript) {
    const script = document.createElement('script')
    script.id = CRISP_SCRIPT_ID
    script.src = CRISP_SCRIPT_SRC
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }

  let popupTimer: number | null = null

  const setClearPopupTimer = () => {
    if (!popupTimer) {
      return
    }

    window.clearTimeout(popupTimer)
    popupTimer = null
  }

  const setHasSeenPopup = () => {
    window.sessionStorage.setItem(CRISP_POPUP_SEEN_SESSION_KEY, '1')
  }

  const getHasSeenPopup = () => {
    return window.sessionStorage.getItem(CRISP_POPUP_SEEN_SESSION_KEY) === '1'
  }

  const setShowCompactPrompt = () => {
    if (getHasSeenPopup()) {
      return
    }

    windowWithCrisp.$crisp?.push(['do', 'chat:show'])
    windowWithCrisp.$crisp?.push(['do', 'message:show', ['text', CRISP_POPUP_MESSAGE]])

    setHasSeenPopup()
  }

  const setSchedulePopup = (path: string) => {
    setClearPopupTimer()

    if (!getCanSchedulePopupForPath(path) || getHasSeenPopup()) {
      return
    }

    popupTimer = window.setTimeout(() => {
      setShowCompactPrompt()
      popupTimer = null
    }, CRISP_POPUP_DELAY_MS)
  }

  watch(
    () => route.path,
    (nextPath) => {
      setSchedulePopup(nextPath)
    },
    { immediate: true }
  )
})
