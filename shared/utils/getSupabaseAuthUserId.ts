export const getSupabaseAuthUserId = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const claims = value as Record<string, unknown>
  const sub = claims.sub

  if (typeof sub !== 'string') {
    return null
  }

  const trimmed = sub.trim()

  return trimmed || null
}
