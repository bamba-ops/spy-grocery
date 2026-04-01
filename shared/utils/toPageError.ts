interface ErrorLike {
  statusCode?: number
  status?: number
  response?: { status?: number }
  data?: { message?: string }
  message?: string
}

export const toPageError = (error: unknown, fallbackMessage: string) => {
  const errorLike = error as ErrorLike
  const statusCode = Number(
    errorLike?.statusCode || errorLike?.status || errorLike?.response?.status || 500
  )

  return createError({
    statusCode: Number.isFinite(statusCode) && statusCode > 0 ? statusCode : 500,
    message: errorLike?.data?.message || errorLike?.message || fallbackMessage
  })
}
