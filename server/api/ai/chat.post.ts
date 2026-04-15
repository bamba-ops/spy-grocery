export default defineEventHandler(async () => {
  console.log('[ai] /api/ai/chat temporarily disabled (onboarding v2 rollout)')

  throw createError({
    statusCode: 503,
    message: 'Spy AI est temporairement indisponible pendant la mise a jour du parcours de demarrage.'
  })
})
