const REDIRECT_HOSTS = new Set(['spygrocery.com', 'app.spygrocery.com'])
const CANONICAL_HOST = 'www.spygrocery.com'

const getNormalizedHost = (value: string | undefined) => {
  if (!value) {
    return ''
  }

  return value.split(',')[0]?.trim().split(':')[0]?.toLowerCase() || ''
}

export default defineEventHandler((event) => {
  const requestHost = getNormalizedHost(getHeader(event, 'x-forwarded-host') || getHeader(event, 'host') || undefined)

  if (!REDIRECT_HOSTS.has(requestHost)) {
    return
  }

  const requestUrl = getRequestURL(event)
  const destination = `https://${CANONICAL_HOST}${requestUrl.pathname}${requestUrl.search}`

  return sendRedirect(event, destination, 308)
})
