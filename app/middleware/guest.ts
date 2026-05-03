import {
  clearStoredAuthNextPath,
  getAuthNextPath,
  getSingleQueryValue,
  getStoredAuthNextPath
} from '#shared/utils/authRedirect'
import { usePostLoginDestination } from '~/composables/auth/usePostLoginDestination'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()

  if (!user.value) {
    return
  }

  const nextFromQuery = getSingleQueryValue(to.query.next)
  const nextPath = nextFromQuery
    ? getAuthNextPath(nextFromQuery)
    : getAuthNextPath(getStoredAuthNextPath())
  const { getPostLoginDestination } = usePostLoginDestination()
  const destinationPath = await getPostLoginDestination(nextPath, {
    attempts: 3,
    retryDelayMs: 200,
    source: 'guest_middleware'
  })

  clearStoredAuthNextPath()

  return navigateTo(destinationPath)
})
