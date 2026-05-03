<script setup lang="ts">
import type { EmailOtpType } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-vue-next'
import {
  clearStoredAuthNextPath,
  clearStoredLoginProvider,
  getAuthNextPath,
  getSingleQueryValue,
  getStoredAuthNextPath,
  getStoredLoginProvider
} from '#shared/utils/authRedirect'
import { usePostLoginDestination } from '~/composables/auth/usePostLoginDestination'
import { useAuthStore } from '~/stores/auth'

const EMAIL_OTP_TYPES = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'] as const

const authStore = useAuthStore()
const analytics = useAnalytics()
const { getPostLoginDestination } = usePostLoginDestination()
const route = useRoute()
const supabase = useSupabaseClient()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://www.spygrocery.com').replace(/\/$/, '')

const statusMessage = ref('Connexion en cours...')

const getEmailOtpType = (value: string | null): EmailOtpType => {
  const normalizedValue = value?.trim() || ''

  if ((EMAIL_OTP_TYPES as readonly string[]).includes(normalizedValue)) {
    return normalizedValue as EmailOtpType
  }

  return 'email' as EmailOtpType
}

const nextPath = computed(() => {
  const nextFromQuery = getSingleQueryValue(route.query.next)

  if (nextFromQuery) {
    return getAuthNextPath(nextFromQuery)
  }

  const redirectTo = getSingleQueryValue(route.query.redirect_to) || getSingleQueryValue(route.query.redirectTo)

  if (redirectTo) {
    return getAuthNextPath(redirectTo)
  }

  return getAuthNextPath(getStoredAuthNextPath())
})

const wait = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

const setFinalizeAuth = async () => {
  const authCode = getSingleQueryValue(route.query.code)
  const tokenHash = getSingleQueryValue(route.query.token_hash)

  if (tokenHash) {
    statusMessage.value = 'Verification du lien en cours...'
    const otpType = getEmailOtpType(getSingleQueryValue(route.query.type))
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType
    })

    if (verifyError) {
      await authStore.initAuth()
      await authStore.refreshUser()

      if (!authStore.user) {
        console.error('[auth] token hash verification failed:', verifyError)
        await navigateTo('/login?error=auth_failed', { replace: true })
        return
      }
    }
  } else if (authCode) {
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
      const destinationPath = await getPostLoginDestination(nextPath.value, {
        attempts: 4,
        retryDelayMs: 200,
        source: 'auth_confirm'
      })
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

      clearStoredAuthNextPath()
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
