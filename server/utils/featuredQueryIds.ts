export const MAX_IDS_PER_REQUEST = 50

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const getIdsFromQuery = (rawIds: string | string[] | undefined) => {
  if (!rawIds) return []

  const asCsv = Array.isArray(rawIds) ? rawIds.join(',') : rawIds

  return asCsv
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}
