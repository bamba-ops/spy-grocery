import type { ListStorage, ResultListStorage } from '#shared/types/lists'

const LISTS_STORAGE_KEY = 'spygrocery:saved-lists'

export const useListsStorage = () => {
  const getParsedStorage = (): ListStorage[] => {
    if (!process.client) return []

    try {
      const raw = localStorage.getItem(LISTS_STORAGE_KEY)
      if (!raw) return []

      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []

      return parsed.filter((entry): entry is ListStorage => {
        return Boolean(
          entry
          && typeof entry === 'object'
          && typeof (entry as { name?: unknown }).name === 'string'
          && Array.isArray((entry as { items?: unknown }).items)
          && typeof (entry as { savedAt?: unknown }).savedAt === 'string'
        )
      })
    } catch {
      return []
    }
  }

  const setParsedStorage = (items: ListStorage[]) => {
    if (!process.client) return false

    try {
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(items))
      return true
    } catch {
      return false
    }
  }

  const getListsStorageItems = (): ListStorage[] => {
    return getParsedStorage()
  }

  const getListStorageItemByName = (name: string): ListStorage | null => {
    const trimmedName = name.trim()
    if (!trimmedName) return null

    const items = getParsedStorage()
    return items.find((item) => item.name === trimmedName) ?? null
  }

  const setListStorageItem = (name: string, items: unknown[]): ResultListStorage => {
    if (!process.client) {
      return { ok: false, error: 'unavailable' }
    }

    const trimmedName = name.trim()
    if (!trimmedName) {
      return { ok: false, error: 'invalid_name' }
    }

    const existingItems = getParsedStorage()
    const alreadyExists = existingItems.some((item) => item.name === trimmedName)
    if (alreadyExists) {
      return { ok: false, error: 'duplicate_name' }
    }

    const nextItems = [
      ...existingItems,
      {
        name: trimmedName,
        items,
        savedAt: new Date().toISOString()
      }
    ]

    const ok = setParsedStorage(nextItems)
    if (!ok) {
      return { ok: false, error: 'storage' }
    }

    return { ok: true }
  }

  const deleteListStorageItemByName = (name: string) => {
    const trimmedName = name.trim()
    if (!trimmedName) return false

    const existingItems = getParsedStorage()
    const nextItems = existingItems.filter((item) => item.name !== trimmedName)
    if (nextItems.length === existingItems.length) return false

    return setParsedStorage(nextItems)
  }

  return {
    getListsStorageItems,
    getListStorageItemByName,
    setListStorageItem,
    deleteListStorageItemByName
  }
}
