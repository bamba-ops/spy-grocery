<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import {
  getIsBlockingOnboardingState,
  ONBOARDING_ROUTE_PATH
} from '#shared/utils/onboarding'
import { useOnboarding } from '~/composables/api/useOnboarding'
import { useAuthStore } from '~/stores/auth'

const DEFAULT_NEXT_PATH = '/search'
const LOGIN_NEXT_STORAGE_KEY = 'spygrocery:auth:next-path'
const LOGIN_PROVIDER_STORAGE_KEY = 'spygrocery:auth:provider'

const authStore = useAuthStore()
const analytics = useAnalytics()
const onboardingApi = useOnboarding()
const route = useRoute()
const supabase = useSupabaseClient()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://www.spygrocery.com').replace(/\/$/, '')

const statusMessage = ref('Connexion en cours...')

const getSingleQueryValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value.find((entry) => typeof entry === 'string') || null
  }

  return typeof value === 'string' ? value : null
}

const getSafeNextPath = (value: string | null) => {
  if (!value) {
    return DEFAULT_NEXT_PATH
  }

  const trimmed = value.trim()

  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return DEFAULT_NEXT_PATH
  }

  return trimmed
}

const getStoredNextPath = () => {
  if (!import.meta.client) {
    return null
  }

  const value = window.sessionStorage.getItem(LOGIN_NEXT_STORAGE_KEY)

  if (!value) {
    return null
  }

  return value
}

const clearStoredNextPath = () => {
  if (!import.meta.client) {
    return
  }

  window.sessionStorage.removeItem(LOGIN_NEXT_STORAGE_KEY)
}

const getStoredLoginProvider = () => {
  if (!import.meta.client) {
    return null
  }

  const value = window.sessionStorage.getItem(LOGIN_PROVIDER_STORAGE_KEY)

  if (value === 'magic_link' || value === 'google') {
    return value
  }

  return null
}

const clearStoredLoginProvider = () => {
  if (!import.meta.client) {
    return
  }

  window.sessionStorage.removeItem(LOGIN_PROVIDER_STORAGE_KEY)
}

const nextPath = computed(() => {
  const nextFromQuery = getSingleQueryValue(route.query.next as string | string[] | undefined)

  if (nextFromQuery) {
    return getSafeNextPath(nextFromQuery)
  }

  return getSafeNextPath(getStoredNextPath())
})

const wait = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

const getPostLoginPath = async () => {
  const intendedPath = nextPath.value

  if (intendedPath.startsWith(ONBOARDING_ROUTE_PATH)) {
    return intendedPath
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const onboardingState = await onboardingApi.getOnboardingState()

      if (getIsBlockingOnboardingState(onboardingState.status, onboardingState.current_step)) {
        return ONBOARDING_ROUTE_PATH
      }

      return intendedPath
    } catch (error) {
      if (attempt === 3) {
        console.error('[onboarding] auth confirm onboarding check failed:', error)
        break
      }

      await wait(200)
    }
  }

  return intendedPath
}

const setFinalizeAuth = async () => {
  const authCode = getSingleQueryValue(route.query.code as string | string[] | undefined)

  if (authCode) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode)

    if (exchangeError) {
      await authStore.initAuth()
      await authStore.refreshUser()

      if (!authStore.user) {
        await navigateTo('/login?error=auth_failed', { replace: true })
        return
      }
    }
  }

  await authStore.initAuth()

  for (let attempt = 0; attempt < 6; attempt += 1) {
    await authStore.refreshUser()

    if (authStore.user) {
      statusMessage.value = 'Session restauree. Redirection en cours...'
      const destinationPath = await getPostLoginPath()
      const userEmail = typeof authStore.user.email === 'string'
        ? authStore.user.email.trim().toLowerCase()
        : ''

      analytics.identify(authStore.user.id, {
        email: userEmail || undefined,
        is_authenticated: true
      })
      analytics.capture('login_success', {
        next_path: destinationPath,
        provider: getStoredLoginProvider(),
        source: 'auth_confirm'
      })

      clearStoredNextPath()
      clearStoredLoginProvider()
      await navigateTo(destinationPath, { replace: true })
      return
    }

    await wait(350)
  }

  await navigateTo('/login?error=auth_failed', { replace: true })
}

onMounted(() => {
  void setFinalizeAuth()
})

useServerSeoMeta({
  robots: 'noindex,follow'
})

useHead({
  title: 'Confirmation de session - SpyGrocery',
  link: [
    {
      rel: 'canonical',
      href: `${siteUrl}/auth/confirm`
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
  <div class="min-h-screen bg-black font-sans text-white">
    <main class="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
      <section class="w-full rounded-[32px] border border-white/10 bg-white/5 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:p-10">
        <p class="text-[10px] uppercase tracking-[0.35em] text-white/55">Authentification SpyGrocery</p>
        <h1 class="mt-3 font-display text-4xl font-semibold italic tracking-tight text-white sm:text-5xl">
          Finalisation de la connexion.
        </h1>

        <div class="mt-8 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/5">
          <Loader2 class="h-6 w-6 animate-spin text-white/70" />
        </div>

        <p class="mt-5 text-sm text-white/80 sm:text-base">
          {{ statusMessage }}
        </p>
      </section>
    </main>
  </div>
</template>
