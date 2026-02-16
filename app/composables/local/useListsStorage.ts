const LEGACY_STORAGE_KEY = 'spygrocery:shopping-list'
const SAVED_LISTS_KEY = 'spygrocery:saved-lists'

interface LegacyShoppingList {
  items: unknown[]
}

export interface SavedListStorageItem {
  name: string
  items: unknown[]
  savedAt: string
}

type SavedListsMap = Record<string, SavedListStorageItem>

export type SavedListWriteReason = 'unavailable' | 'invalid_name' | 'duplicate_name' | 'storage'
export type SavedListWriteResult =
  | { ok: true }
  | { ok: false; reason: SavedListWriteReason }

// Name matching is case-insensitive and whitespace-insensitive.
const normalizeName = (name: string) => name.trim().toLowerCase()

// Safe JSON object parsing helper.
// Returns null for invalid JSON or non-object payloads.
const parseObject = (value: string | null): Record<string, unknown> | null => {
  if (!value) return null
  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

// Reads named lists map from localStorage and validates shape.
// Invalid entries are ignored to keep consumer code resilient.
const readNamedListsMap = (): SavedListsMap => {
  if (!process.client) return {}
  const parsed = parseObject(localStorage.getItem(SAVED_LISTS_KEY))
  if (!parsed) return {}

  const map: SavedListsMap = {}
  for (const [key, value] of Object.entries(parsed)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue

    const item = value as Partial<SavedListStorageItem>
    if (!item.name || typeof item.name !== 'string') continue
    if (!Array.isArray(item.items)) continue
    if (!item.savedAt || typeof item.savedAt !== 'string') continue

    map[key] = {
      name: item.name,
      items: item.items,
      savedAt: item.savedAt
    }
  }

  return map
}

// Persists the full named lists map into localStorage.
const writeNamedListsMap = (map: SavedListsMap) => {
  if (!process.client) return
  localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify(map))
}

// Reads the legacy single-list payload (`spygrocery:shopping-list`).
// Used for one-time backward compatibility import.
const readLegacyList = (): LegacyShoppingList | null => {
  if (!process.client) return null

  const parsed = parseObject(localStorage.getItem(LEGACY_STORAGE_KEY))
  if (!parsed) return null
  const items = parsed.items
  if (!Array.isArray(items)) return null

  return { items }
}

// Finds the actual map key for a given list name using normalized comparison.
const findKeyByName = (map: SavedListsMap, name: string) => {
  const normalized = normalizeName(name)
  return Object.keys(map).find((key) => normalizeName(key) === normalized)
}

// Legacy save path (single current list).
export const saveLegacyList = (items: unknown[]) => {
  if (!process.client) return false
  try {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({ items }))
    return true
  } catch {
    return false
  }
}

// Saves a new named list.
// Fails for unavailable client runtime, invalid name, duplicate name, or storage error.
export const saveNamedList = (name: string, items: unknown[]): SavedListWriteResult => {
  if (!process.client) return { ok: false, reason: 'unavailable' }

  const trimmed = name.trim()
  if (!trimmed) return { ok: false, reason: 'invalid_name' }

  try {
    const map = readNamedListsMap()
    const existingKey = findKeyByName(map, trimmed)
    if (existingKey) return { ok: false, reason: 'duplicate_name' }

    map[trimmed] = {
      name: trimmed,
      items,
      savedAt: new Date().toISOString()
    }

    writeNamedListsMap(map)
    return { ok: true }
  } catch {
    return { ok: false, reason: 'storage' }
  }
}

// Returns all saved named lists.
// If empty, attempts a one-time import from the legacy single-list key.
export const getSavedLists = (): SavedListStorageItem[] => {
  if (!process.client) return []

  try {
    const map = readNamedListsMap()
    let values = Object.values(map)

    if (values.length === 0) {
      const legacy = readLegacyList()
      if (legacy && legacy.items.length > 0) {
        const importedName = `Imported ${new Date().toISOString().slice(0, 10)}`
        map[importedName] = {
          name: importedName,
          items: legacy.items,
          savedAt: new Date().toISOString()
        }
        writeNamedListsMap(map)
        values = Object.values(map)
      }
    }

    return values
  } catch {
    return []
  }
}

// Loads one saved list by name (normalized match).
export const loadSavedListByName = (name: string): SavedListStorageItem | null => {
  if (!process.client) return null

  try {
    const map = readNamedListsMap()
    const key = findKeyByName(map, name)
    if (!key) return null
    return map[key] || null
  } catch {
    return null
  }
}

// Deletes one saved list by name (normalized match).
export const deleteSavedListByName = (name: string) => {
  if (!process.client) return false

  const trimmed = name.trim()
  if (!trimmed) return false

  try {
    const map = readNamedListsMap()
    const key = findKeyByName(map, trimmed)
    if (!key) return false
    delete map[key]
    writeNamedListsMap(map)
    return true
  } catch {
    return false
  }
}
