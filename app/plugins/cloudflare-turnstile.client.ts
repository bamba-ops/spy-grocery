const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script'
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

export default defineNuxtPlugin(() => {
  if (!import.meta.client) {
    return
  }

  const runtimeConfig = useRuntimeConfig()
  const siteKey = (runtimeConfig.public.turnstileSiteKey || '').trim()

  if (!siteKey) {
    return
  }

  const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID)

  if (existingScript) {
    return
  }

  const script = document.createElement('script')
  script.id = TURNSTILE_SCRIPT_ID
  script.src = TURNSTILE_SCRIPT_SRC
  script.async = true
  script.defer = true
  document.head.appendChild(script)
})
