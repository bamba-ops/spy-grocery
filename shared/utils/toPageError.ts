import { H3Error } from 'h3'

interface ErrorLike {
  statusCode?: number
  status?: number
  response?: { status?: number }
  data?: { message?: string }
  message?: string
  fatal?: boolean
}

export const toPageError = (error: unknown, fallbackMessage: string) => {
  // If the error is already a Nuxt/H3 error with a status code, return it directly
  // This prevents "[nuxt] instance unavailable" errors when createError is called 
  // outside the setup context (e.g., in a catch block after an await).
  if (error && typeof error === 'object' && ('statusCode' in error || error instanceof H3Error)) {
    return error
  }

  const errorLike = error as ErrorLike
  const statusCode = Number(
    errorLike?.statusCode || errorLike?.status || errorLike?.response?.status || 500
  )

  return createError({
    statusCode: Number.isFinite(statusCode) && statusCode > 0 ? statusCode : 500,
    message: errorLike?.data?.message || errorLike?.message || fallbackMessage,
    fatal: true
  })
}
