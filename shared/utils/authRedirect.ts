export const AUTH_CONFIRM_PATH = '/auth/confirm'
export const DEFAULT_AUTH_NEXT_PATH = '/search'
export const LOGIN_NEXT_STORAGE_KEY = 'spygrocery:auth:next-path'
export const LOGIN_PROVIDER_STORAGE_KEY = 'spygrocery:auth:provider'

export type LoginProvider = 'magic_link' | 'google'

interface SessionStorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const getSessionStorage = (): SessionStorageLike | null => {
  if (!import.meta.client) {
    return null
  }

  const globalWithSessionStorage = globalThis as typeof globalThis & {
    sessionStorage?: SessionStorageLike
  }

  return globalWithSessionStorage.sessionStorage || null
}

export const getSingleQueryValue = (value: unknown): string | null => {
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

export const getSafeAuthNextPath = (value: string | null | undefined): string => {
  if (!value) {
    return DEFAULT_AUTH_NEXT_PATH
  }

  const trimmed = value.trim()

  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return DEFAULT_AUTH_NEXT_PATH
  }

  if (
    trimmed === '/login'
    || trimmed.startsWith('/login?')
    || trimmed === AUTH_CONFIRM_PATH
    || trimmed.startsWith(`${AUTH_CONFIRM_PATH}?`)
    || trimmed === '/confirm'
    || trimmed.startsWith('/confirm?')
  ) {
    return DEFAULT_AUTH_NEXT_PATH
  }

  return trimmed
}

export const getAuthNextPath = (value: string | null | undefined): string => {
  if (!value) {
    return DEFAULT_AUTH_NEXT_PATH
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return DEFAULT_AUTH_NEXT_PATH
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const redirectUrl = new URL(trimmed)
      const nestedNext = redirectUrl.searchParams.get('next')

      if (redirectUrl.pathname === AUTH_CONFIRM_PATH && nestedNext) {
        return getAuthNextPath(nestedNext)
      }

      return getSafeAuthNextPath(`${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`)
    } catch {
      return DEFAULT_AUTH_NEXT_PATH
    }
  }

  return getSafeAuthNextPath(trimmed)
}

export const setStoredAuthNextPath = (value: string) => {
  const sessionStorage = getSessionStorage()

  if (!sessionStorage) {
    return
  }

  sessionStorage.setItem(LOGIN_NEXT_STORAGE_KEY, getSafeAuthNextPath(value))
}

export const getStoredAuthNextPath = () => {
  const sessionStorage = getSessionStorage()

  if (!sessionStorage) {
    return null
  }

  return sessionStorage.getItem(LOGIN_NEXT_STORAGE_KEY) || null
}

export const clearStoredAuthNextPath = () => {
  const sessionStorage = getSessionStorage()

  if (!sessionStorage) {
    return
  }

  sessionStorage.removeItem(LOGIN_NEXT_STORAGE_KEY)
}

export const setStoredLoginProvider = (provider: LoginProvider) => {
  const sessionStorage = getSessionStorage()

  if (!sessionStorage) {
    return
  }

  sessionStorage.setItem(LOGIN_PROVIDER_STORAGE_KEY, provider)
}

export const getStoredLoginProvider = () => {
  const sessionStorage = getSessionStorage()

  if (!sessionStorage) {
    return null
  }

  const value = sessionStorage.getItem(LOGIN_PROVIDER_STORAGE_KEY)

  if (value === 'magic_link' || value === 'google') {
    return value
  }

  return null
}

export const clearStoredLoginProvider = () => {
  const sessionStorage = getSessionStorage()

  if (!sessionStorage) {
    return
  }

  sessionStorage.removeItem(LOGIN_PROVIDER_STORAGE_KEY)
}
