export default defineNuxtPlugin(() => {
  if (!import.meta.client) {
    return
  }

  const windowWithCrisp = window as typeof window & {
    $crisp?: unknown[]
    CRISP_WEBSITE_ID?: string
  }

  windowWithCrisp.$crisp = []
  windowWithCrisp.CRISP_WEBSITE_ID = 'f06da635-515f-4d61-9031-1afb4946d3d2'

  const scriptId = 'crisp-chat-script'
  const existingScript = document.getElementById(scriptId)

  if (existingScript) {
    return
  }

  const script = document.createElement('script')
  script.id = scriptId
  script.src = 'https://client.crisp.chat/l.js'
  script.async = true
  document.head.appendChild(script)
})
