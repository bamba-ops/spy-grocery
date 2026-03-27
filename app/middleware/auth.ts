const DEFAULT_NEXT_PATH = '/search'

const getSafeNextPath = (value: string | null | undefined) => {
  if (!value) {
    return DEFAULT_NEXT_PATH
  }

  const trimmed = value.trim()

  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return DEFAULT_NEXT_PATH
  }

  return trimmed
}

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  if (user.value) {
    return
  }

  const nextPath = getSafeNextPath(to.fullPath)

  return navigateTo(`/login?next=${encodeURIComponent(nextPath)}`)
})
