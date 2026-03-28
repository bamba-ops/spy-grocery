const DEFAULT_NEXT_PATH = '/search'
const LOGIN_NEXT_STORAGE_KEY = 'spygrocery:auth:next-path'

const getSingleQueryValue = (value: unknown) => {
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

  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed === '/login') {
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

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  if (!user.value) {
    return
  }

  const nextFromQuery = getSingleQueryValue(to.query.next)
  const nextPath = nextFromQuery
    ? getSafeNextPath(nextFromQuery)
    : getSafeNextPath(getStoredNextPath())

  clearStoredNextPath()

  return navigateTo(nextPath)
})
