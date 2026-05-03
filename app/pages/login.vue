<script setup lang="ts">
import { Chrome, Loader2, Mail } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

interface TurnstileRenderOptions {
  sitekey: string
  theme?: 'auto' | 'light' | 'dark'
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  reset: (widgetId?: string) => void
  remove: (widgetId: string) => void
}

const TURNSTILE_MAX_RENDER_ATTEMPTS = 60
const TURNSTILE_RETRY_DELAY_MS = 150

const authStore = useAuthStore()
const analytics = useAnalytics()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://www.spygrocery.com').replace(/\/$/, '')
const isTurnstileEnabled = computed(() => authStore.getIsLoginCaptchaEnabled)
const turnstileSiteKey = (runtimeConfig.public.turnstileSiteKey || '').trim()
const turnstileContainerRef = ref<HTMLElement | null>(null)
const turnstileWidgetId = ref<string | null>(null)
const turnstileError = ref<string | null>(null)

let turnstileRenderTimer: ReturnType<typeof setTimeout> | null = null
let turnstileRenderAttempts = 0

const getTurnstileApi = () => {
  if (!import.meta.client) {
    return null
  }

  const windowWithTurnstile = window as typeof window & {
    turnstile?: TurnstileApi
  }

  return windowWithTurnstile.turnstile || null
}

const setClearTurnstileRenderTimer = () => {
  if (!turnstileRenderTimer) {
    return
  }

  clearTimeout(turnstileRenderTimer)
  turnstileRenderTimer = null
}

const setResetTurnstileWidget = () => {
  authStore.setClearLoginCaptchaToken()
  const turnstile = getTurnstileApi()

  if (!turnstile || !turnstileWidgetId.value) {
    return
  }

  turnstile.reset(turnstileWidgetId.value)
}

const setUnmountTurnstileWidget = () => {
  const turnstile = getTurnstileApi()

  if (turnstile && turnstileWidgetId.value) {
    turnstile.remove(turnstileWidgetId.value)
  }

  turnstileWidgetId.value = null
}

const setRenderTurnstileWidget = () => {
  if (
    !import.meta.client ||
    !isTurnstileEnabled.value ||
    !turnstileSiteKey ||
    !turnstileContainerRef.value ||
    turnstileWidgetId.value
  ) {
    return
  }

  const turnstile = getTurnstileApi()

  if (!turnstile) {
    turnstileRenderAttempts += 1

    if (turnstileRenderAttempts >= TURNSTILE_MAX_RENDER_ATTEMPTS) {
      turnstileError.value = 'Impossible de charger la verification. Rechargez la page.'
      return
    }

    setClearTurnstileRenderTimer()
    turnstileRenderTimer = setTimeout(() => {
      setRenderTurnstileWidget()
    }, TURNSTILE_RETRY_DELAY_MS)
    return
  }

  turnstileError.value = null
  turnstileWidgetId.value = turnstile.render(turnstileContainerRef.value, {
    sitekey: turnstileSiteKey,
    theme: 'dark',
    callback: (token) => {
      turnstileError.value = null
      authStore.setLoginCaptchaToken(token)
    },
    'expired-callback': () => {
      turnstileError.value = 'Verification expiree. Veuillez recommencer.'
      setResetTurnstileWidget()
    },
    'error-callback': () => {
      turnstileError.value = 'Impossible de verifier. Veuillez recommencer.'
      authStore.setClearLoginCaptchaToken()
    }
  })
}

definePageMeta({
  middleware: 'guest'
})

onMounted(() => {
  authStore.setInitializeLoginPage()
  analytics.capture('login_page_viewed', {
    next_path: authStore.loginNextPath,
    has_auth_failed: authStore.loginHasAuthFailed,
    has_captcha_token: authStore.getHasLoginCaptchaToken,
    source: 'login_page'
  })

  if (!isTurnstileEnabled.value) {
    turnstileError.value = null
    return
  }

  if (!turnstileSiteKey) {
    turnstileError.value = 'Configuration manquante. Contactez le support.'
    return
  }

  turnstileRenderAttempts = 0
  void nextTick(() => {
    setRenderTurnstileWidget()
  })
})

onBeforeUnmount(() => {
  setClearTurnstileRenderTimer()
  setUnmountTurnstileWidget()
  authStore.setDisposeLoginPage()
})

watch(
  () => authStore.loginMagicLinkSent,
  (isSent) => {
    if (!isTurnstileEnabled.value) {
      return
    }

    if (!isSent) {
      setResetTurnstileWidget()
    }
  }
)

useServerSeoMeta({
  robots: 'noindex,follow'
})

useHead({
  title: 'Connexion - SpyGrocery',
  link: [
    {
      rel: 'canonical',
      href: `${siteUrl}/login`
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;1,600&family=Manrope:wght@400;500;600&display=swap'
    }
  ]
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-black font-sans text-white">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),rgba(0,0,0,0)_48%)]" />
    <div class="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04] sm:h-[44rem] sm:w-[44rem]" />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black via-black/80 to-transparent" />

    <main class="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
      <NuxtLink
        to="/"
        class="font-display text-4xl italic tracking-tight text-white transition hover:text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-5xl"
      >
        SpyGrocery
      </NuxtLink>

      <h1 class="mt-8 text-center font-display text-5xl font-semibold italic leading-[0.95] tracking-tight text-white sm:mt-10 sm:text-7xl">
        Bon retour
      </h1>
      <p class="mt-4 max-w-xl text-center text-sm text-white/70 sm:text-lg">
        Votre cuisine organisee, avec precision.
      </p>

      <section class="mt-8 w-full max-w-[560px] rounded-[36px] border border-white/10 bg-black/60 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:mt-10 sm:p-6">
        <div
          v-if="authStore.loginMagicLinkSent"
          class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center sm:px-6 sm:py-8"
        >
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Courriel envoye</p>
          <h2 class="mt-3 font-display text-3xl font-semibold italic tracking-tight text-white sm:text-4xl">
            Verifiez votre boite de reception.
          </h2>
          <p class="mt-3 text-sm text-white/70 sm:text-base">
            Nous avons envoye un lien magique a
            <span class="break-all font-semibold text-white">{{ authStore.loginEmail.trim() }}</span>.
          </p>
          <button
            type="button"
            class="mt-6 inline-flex rounded-full border border-white/20 px-5 py-2 text-[10px] uppercase tracking-[0.35em] text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click="authStore.setResetLoginMagicLinkState"
          >
            Utiliser un autre courriel
          </button>
        </div>

        <form v-else class="space-y-4 sm:space-y-5" @submit.prevent="authStore.setSubmitLoginMagicLink">
          <label class="block">
            <span class="text-[10px] uppercase tracking-[0.35em] text-white/60">Identifiant du compte</span>
            <div class="mt-2 flex h-12 items-center gap-3 rounded-full border border-white/15 bg-black px-4 focus-within:ring-2 focus-within:ring-white/70 focus-within:ring-offset-2 focus-within:ring-offset-black sm:h-14 sm:px-5">
              <Mail class="h-4 w-4 shrink-0 text-white/45" />
              <input
                v-model="authStore.loginEmail"
                type="email"
                autocomplete="email"
                placeholder="name@domain.com"
                class="h-full w-full bg-transparent text-base text-white placeholder:text-white/35 focus:outline-none"
              >
            </div>
          </label>

          <div v-if="isTurnstileEnabled" class="flex min-h-[68px] flex-col items-center justify-center gap-2">
            <div ref="turnstileContainerRef" class="flex min-h-[68px] items-center justify-center" />
            <p v-if="turnstileError" class="text-xs text-white/70">
              {{ turnstileError }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="!authStore.getCanSubmitLoginEmail"
            class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white px-6 text-sm font-medium text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40 sm:h-14 sm:text-base"
          >
            <Loader2 v-if="authStore.isLoading" class="h-4 w-4 animate-spin" />
            <template v-else>Continuer avec courriel</template>
          </button>

          <div class="mt-8 flex items-center gap-4">
            <span class="h-px flex-1 bg-white/10" />
            <span class="text-[10px] uppercase tracking-[0.35em] text-white/40">Ou continuer avec</span>
            <span class="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            :disabled="authStore.isLoading"
            class="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-transparent px-6 text-sm text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40 sm:h-14 sm:text-base"
            @click="authStore.setContinueLoginWithGoogle"
          >
            <Chrome class="h-5 w-5" />
            Continuer avec Google
          </button>
        </form>

        <p class="mt-7 text-center text-xs text-white/45 sm:mt-8">
          En continuant, vous acceptez nos
          <NuxtLink to="/terms" class="underline underline-offset-4 transition hover:text-white">conditions de service</NuxtLink>
          et notre
          <NuxtLink to="/privacy" class="underline underline-offset-4 transition hover:text-white">politique de confidentialite</NuxtLink>.
        </p>

        <p
          v-if="authStore.loginHasAuthFailed"
          class="mt-6 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80"
        >
          Nous n'avons pas pu confirmer votre session. Veuillez reessayer.
        </p>

        <p
          v-if="authStore.error"
          class="mt-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80"
        >
          {{ authStore.error }}
        </p>
      </section>

      <!--<p class="mt-8 text-center text-xs text-white/45 sm:mt-10 sm:text-sm">
        New here?
        <NuxtLink
          to="/"
          class="ml-1 inline-flex items-center gap-1 text-white/80 underline underline-offset-4 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Explore the methodology
          <ArrowRight class="h-4 w-4" />
        </NuxtLink>
      </p>-->
    </main>
  </div>
</template>
