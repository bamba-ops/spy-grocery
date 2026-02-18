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

  const isNameListExist = (name: string): boolean => {
    const trimmedName = name.trim()
    if (!trimmedName) return false

    const items = getParsedStorage()
    return items.some((item) => item.name === trimmedName)
  }

  const setListStorageItem = (name: string, items: unknown[]): ResultListStorage => {
    if (!process.client) {
      return { ok: false, error: 'unavailable' }
    }

    if (isNameListExist(name)) {
      return { ok: false, error: 'duplicate_name' }
    }

    const nextItems = [
      ...getParsedStorage(),
      {
        name,
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
    isNameListExist,
    getListsStorageItems,
    getListStorageItemByName,
    setListStorageItem,
    deleteListStorageItemByName
  }
}
