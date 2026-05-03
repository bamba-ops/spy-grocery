import { getSafeAuthNextPath } from '#shared/utils/authRedirect'

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  if (user.value) {
    return
  }

  const nextPath = getSafeAuthNextPath(to.fullPath)

  return navigateTo(`/login?next=${encodeURIComponent(nextPath)}`)
})
