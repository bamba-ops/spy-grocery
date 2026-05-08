export default defineEventHandler((event) => {
  throw createError({
    statusCode: 410,
    statusMessage: 'Gone',
    message: 'Cette ancienne structure d\'URL n\'est plus disponible.',
    fatal: true
  })
})
