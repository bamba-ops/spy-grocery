const CRISP_SCRIPT_ID = 'crisp-chat-script'
const CRISP_SCRIPT_SRC = 'https://client.crisp.chat/l.js'
const CRISP_WEBSITE_ID = 'f06da635-515f-4d61-9031-1afb4946d3d2'

export default defineNuxtPlugin(() => {
  if (!import.meta.client) {
    return
  }

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
})
