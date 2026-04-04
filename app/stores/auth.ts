import type { User } from '@supabase/supabase-js'
import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'
import { useAuth } from '~/composables/supabase/useAuth'

const DEFAULT_ERROR_MESSAGE = 'Une erreur est survenue. Veuillez reessayer.'
const DEFAULT_NEXT_PATH = '/search'
const LOGIN_NEXT_STORAGE_KEY = 'spygrocery:auth:next-path'
const DEFAULT_AUTH_PROMPT_TITLE = 'Connexion requise'
const DEFAULT_AUTH_PROMPT_DESCRIPTION = 'Creez un compte pour debloquer cette fonctionnalite.'
const DEFAULT_AUTH_PROMPT_CTA_LABEL = 'Aller a la connexion'

const setStoredNextPath = (value: string) => {
  if (!import.meta.client) {
    return
  }

  window.sessionStorage.setItem(LOGIN_NEXT_STORAGE_KEY, value)
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

const getIsMissingAuthSessionError = (message: string | undefined, name: string | undefined) => {
  const normalizedMessage = message?.toLowerCase().trim() || ''

  if (name === 'AuthSessionMissingError') {
    return true
  }

  return normalizedMessage.includes('auth session missing')
}

const getIsCaptchaError = (message: string | undefined) => {
  const normalizedMessage = message?.toLowerCase().trim() || ''

  if (!normalizedMessage) {
    return false
  }

  return normalizedMessage.includes('captcha') || normalizedMessage.includes('bot detection')
}

const getIsEnabled = (value: unknown, fallback = true) => {
  if (typeof value === 'boolean') {
    return value
  }

  const normalizedValue = typeof value === 'string' ? value.trim().toLowerCase() : ''

  if (!normalizedValue) {
    return fallback
  }

  return !['0', 'false', 'off', 'no'].includes(normalizedValue)
}

const getSingleQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry === 'string') {
        return entry
      }
    }

    return null
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

const setSignedOutToast = () => {
  if (!import.meta.client) {
    return
  }

  toast.success('Deconnexion', {
    description: 'Vous etes maintenant deconnecte.'
  })
}

export const useAuthStore = defineStore('auth', () => {
  const { sendMagicLink, signInWithGoogle, signOut, getCurrentUser } = useAuth()
  const runtimeConfig = useRuntimeConfig()

  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const isReady = ref(false)
  const error = ref<string | null>(null)
  const loginEmail = ref('')
  const loginMagicLinkSent = ref(false)
  const loginCaptchaToken = ref<string | null>(null)
  const loginNextPath = ref(DEFAULT_NEXT_PATH)
  const loginHasAuthFailed = ref(false)
  const isLoginPageInitialized = ref(false)
  const authPromptOpen = ref(false)
  const authPromptTitle = ref(DEFAULT_AUTH_PROMPT_TITLE)
  const authPromptDescription = ref(DEFAULT_AUTH_PROMPT_DESCRIPTION)
  const authPromptNextPath = ref(DEFAULT_NEXT_PATH)
  const authPromptCtaLabel = ref(DEFAULT_AUTH_PROMPT_CTA_LABEL)

  let stopLoginRouteWatcher: (() => void) | null = null
  let stopLoginUserWatcher: (() => void) | null = null

  const getIsLoginCaptchaEnabled = computed(() => {
    return getIsEnabled(runtimeConfig.public.turnstileEnabled, true)
  })

  const getCanSubmitLoginEmail = computed(() => {
    const hasEmail = loginEmail.value.trim().length > 0
    const hasCaptchaToken = Boolean(loginCaptchaToken.value)

    if (!getIsLoginCaptchaEnabled.value) {
      return hasEmail && !isLoading.value
    }

    return hasEmail && hasCaptchaToken && !isLoading.value
  })

  const getHasLoginCaptchaToken = computed(() => {
    return Boolean(loginCaptchaToken.value)
  })

  const setErrorMessage = (message: string | null | undefined, fallback = DEFAULT_ERROR_MESSAGE) => {
    error.value = message?.trim() || fallback
  }

  const setSyncLoginRouteState = (query: Record<string, unknown>) => {
    const queryNextPath = getSingleQueryValue(query.next)

    if (queryNextPath) {
      loginNextPath.value = getSafeNextPath(queryNextPath)
      setStoredNextPath(loginNextPath.value)
    } else {
      loginNextPath.value = getSafeNextPath(getStoredNextPath())
    }

    loginHasAuthFailed.value = getSingleQueryValue(query.error) === 'auth_failed'
  }

  const setInitializeLoginPage = () => {
    if (isLoginPageInitialized.value) {
      return
    }

    const route = useRoute()

    setSyncLoginRouteState(route.query as Record<string, unknown>)

    stopLoginRouteWatcher = watch(
      () => route.query,
      (nextQuery) => {
        setSyncLoginRouteState(nextQuery as Record<string, unknown>)
      },
      {
        deep: true
      }
    )

    stopLoginUserWatcher = watch(
      () => user.value?.id,
      (userId) => {
        if (!userId) {
          return
        }

        void navigateTo(loginNextPath.value, { replace: true })
      },
      {
        immediate: true
      }
    )

    isLoginPageInitialized.value = true
  }

  const setDisposeLoginPage = () => {
    stopLoginRouteWatcher?.()
    stopLoginUserWatcher?.()
    stopLoginRouteWatcher = null
    stopLoginUserWatcher = null
    isLoginPageInitialized.value = false
    setClearLoginCaptchaToken()
  }

  const setOpenAuthPrompt = (options?: {
    title?: string
    description?: string
    nextPath?: string
    ctaLabel?: string
  }) => {
    authPromptTitle.value = options?.title?.trim() || DEFAULT_AUTH_PROMPT_TITLE
    authPromptDescription.value = options?.description?.trim() || DEFAULT_AUTH_PROMPT_DESCRIPTION
    authPromptNextPath.value = getSafeNextPath(options?.nextPath?.trim() || null)
    authPromptCtaLabel.value = options?.ctaLabel?.trim() || DEFAULT_AUTH_PROMPT_CTA_LABEL
    authPromptOpen.value = true
  }

  const setCloseAuthPrompt = () => {
    authPromptOpen.value = false
  }

  const setContinueAuthPromptToLogin = async () => {
    const nextPath = getSafeNextPath(authPromptNextPath.value)
    setStoredNextPath(nextPath)
    setCloseAuthPrompt()
    await navigateTo(`/login?next=${encodeURIComponent(nextPath)}`)
  }

  const setClearStoredLoginNextPath = () => {
    clearStoredNextPath()
  }

  const setLoginCaptchaToken = (value: string | null | undefined) => {
    const normalizedToken = value?.trim() || null
    loginCaptchaToken.value = normalizedToken
  }

  const setClearLoginCaptchaToken = () => {
    loginCaptchaToken.value = null
  }

  const setResetLoginMagicLinkState = () => {
    loginMagicLinkSent.value = false
    setClearLoginCaptchaToken()
  }

  const refreshUser = async () => {
    const { data, error: getUserError } = await getCurrentUser()

    if (getUserError) {
      if (getIsMissingAuthSessionError(getUserError.message, getUserError.name)) {
        user.value = null
        error.value = null
        return true
      }

      setErrorMessage(getUserError.message, 'Impossible de recuperer votre session de compte.')
      user.value = null
      return false
    }

    user.value = data.user ?? null
    error.value = null
    return true
  }

  const initAuth = async () => {
    if (isReady.value || isLoading.value) {
      return
    }

    isLoading.value = true

    try {
      await refreshUser()
    } finally {
      isLoading.value = false
      isReady.value = true
    }
  }

  const loginWithMagicLink = async (email: string, nextPath?: string, captchaToken?: string | null) => {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedCaptchaToken = captchaToken?.trim() || ''
    const isCaptchaEnabled = getIsLoginCaptchaEnabled.value

    if (!normalizedEmail) {
      error.value = 'Veuillez entrer votre adresse courriel.'
      return false
    }

    if (isCaptchaEnabled && !normalizedCaptchaToken) {
      error.value = 'Veuillez completer la verification.'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const { error: signInError } = await sendMagicLink(
        normalizedEmail,
        nextPath,
        isCaptchaEnabled ? normalizedCaptchaToken : null
      )

      if (signInError) {
        if (getIsCaptchaError(signInError.message)) {
          setClearLoginCaptchaToken()

          if (!isCaptchaEnabled) {
            setErrorMessage(
              signInError.message,
              'Le captcha est desactive cote client, mais encore requis par la configuration serveur.'
            )
            return false
          }

          setErrorMessage(signInError.message, 'Verification invalide ou expiree. Veuillez recommencer.')
          return false
        }

        setErrorMessage(signInError.message, 'Impossible d\'envoyer le lien magique.')
        return false
      }

      return true
    } finally {
      isLoading.value = false
    }
  }

  const loginWithGoogle = async (nextPath?: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { error: signInError } = await signInWithGoogle(nextPath)

      if (signInError) {
        setErrorMessage(signInError.message, 'Echec de connexion avec Google.')
        return false
      }

      return true
    } finally {
      isLoading.value = false
    }
  }

  const setSubmitLoginMagicLink = async () => {
    loginMagicLinkSent.value = false
    setStoredNextPath(loginNextPath.value)

    const ok = await loginWithMagicLink(loginEmail.value, loginNextPath.value, loginCaptchaToken.value)
    if (!ok) {
      return false
    }

    loginMagicLinkSent.value = true
    setClearLoginCaptchaToken()
    return true
  }

  const setContinueLoginWithGoogle = async () => {
    setStoredNextPath(loginNextPath.value)
    return loginWithGoogle(loginNextPath.value)
  }

  const logout = async () => {
    isLoading.value = true
    error.value = null

    try {
      const { error: signOutError } = await signOut()

      if (signOutError) {
        setErrorMessage(signOutError.message, 'Impossible de vous deconnecter.')
        return false
      }

      user.value = null
      setSignedOutToast()
      clearStoredNextPath()
      return true
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    isReady,
    error,
    authPromptOpen,
    authPromptTitle,
    authPromptDescription,
    authPromptNextPath,
    authPromptCtaLabel,
    loginEmail,
    loginMagicLinkSent,
    loginCaptchaToken,
    loginHasAuthFailed,
    getIsLoginCaptchaEnabled,
    getCanSubmitLoginEmail,
    getHasLoginCaptchaToken,
    initAuth,
    setInitializeLoginPage,
    setDisposeLoginPage,
    setOpenAuthPrompt,
    setCloseAuthPrompt,
    setContinueAuthPromptToLogin,
    setClearStoredLoginNextPath,
    setLoginCaptchaToken,
    setClearLoginCaptchaToken,
    setResetLoginMagicLinkState,
    loginWithMagicLink,
    loginWithGoogle,
    setSubmitLoginMagicLink,
    setContinueLoginWithGoogle,
    logout,
    refreshUser
  }
})
