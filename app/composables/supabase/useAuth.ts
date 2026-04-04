const AUTH_CONFIRM_PATH = '/auth/confirm'
const DEFAULT_NEXT_PATH = '/search'

const getSafeNextPath = (value: string | undefined): string => {
  if (!value) {
    return DEFAULT_NEXT_PATH
  }

  const trimmed = value.trim()

  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return DEFAULT_NEXT_PATH
  }

  return trimmed
}

const getAuthRedirectUrl = (nextPath?: string) => {
  const safeNextPath = getSafeNextPath(nextPath)

  if (!import.meta.client) {
    return `${AUTH_CONFIRM_PATH}?next=${encodeURIComponent(safeNextPath)}`
  }

  const redirectUrl = new URL(AUTH_CONFIRM_PATH, window.location.origin)
  redirectUrl.searchParams.set('next', safeNextPath)

  return redirectUrl.toString()
}

export const useAuth = () => {
  const supabase = useSupabaseClient()

  const sendMagicLink = async (email: string, nextPath?: string, captchaToken?: string | null) => {
    const normalizedCaptchaToken = captchaToken?.trim() || undefined

    return supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: getAuthRedirectUrl(nextPath),
        captchaToken: normalizedCaptchaToken
      }
    })
  }

  const signInWithGoogle = async (nextPath?: string) => {
    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthRedirectUrl(nextPath)
      }
    })

    if (!result.error && import.meta.client && result.data?.url) {
      window.location.assign(result.data.url)
    }

    return result
  }

  const signOut = async () => {
    return supabase.auth.signOut()
  }

  const getCurrentUser = async () => {
    return supabase.auth.getUser()
  }

  return {
    sendMagicLink,
    signInWithGoogle,
    signOut,
    getCurrentUser
  }
}
