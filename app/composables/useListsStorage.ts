import type { SearchProduct } from '#shared/types'
import type { ListStorage, ResultListStorage } from '#shared/types/lists'

const LISTS_STORAGE_KEY = 'spygrocery:saved-lists'

const toStringOrNull = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

const toBooleanOrNull = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value
  return null
}

const fallbackSlug = (title: string, store: string) => {
  return `${store}-${title}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const normalizeProduct = (value: unknown): SearchProduct | null => {
  if (!value || typeof value !== 'object') return null

  const raw = value as Record<string, unknown>
  const rawStoreObject = raw.store && typeof raw.store === 'object'
    ? (raw.store as Record<string, unknown>)
    : null

  const title = toStringOrNull(raw.title) || toStringOrNull(raw.name) || 'Untitled product'
  const store = toStringOrNull(raw.store)
    || toStringOrNull(rawStoreObject?.name)
    || 'Unknown store'

  const slug = toStringOrNull(raw.slug) || fallbackSlug(title, store)
  const id = toStringOrNull(raw.id) || slug

  return {
    id,
    slug,
    title,
    brand: toStringOrNull(raw.brand),
    store,
    store_id: toStringOrNull(raw.store_id) || toStringOrNull(rawStoreObject?.id),
    image_url: toStringOrNull(raw.image_url),
    url: toStringOrNull(raw.url) || toStringOrNull(raw.link),
    uom: toStringOrNull(raw.uom) || toStringOrNull(raw.unit),
    price_num: toNumberOrNull(raw.price_num) ?? toNumberOrNull(raw.price),
    was_price_num: toNumberOrNull(raw.was_price_num),
    price_text: toStringOrNull(raw.price_text) || toStringOrNull(raw.price_unit),
    pre_price_text: toStringOrNull(raw.pre_price_text),
    on_sale: toBooleanOrNull(raw.on_sale) ?? toBooleanOrNull(raw.is_promo),
    scraped_at: toStringOrNull(raw.scraped_at)
  }
}

const normalizeListItems = (items: unknown[]): unknown[] => {
  return items
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null

      const raw = entry as Record<string, unknown>
      const product = normalizeProduct(raw.product)
      if (!product) return null

      const quantityValue = typeof raw.quantity === 'number' && Number.isFinite(raw.quantity)
        ? raw.quantity
        : 1

      const quantity = Math.max(1, Math.floor(quantityValue))

      return {
        product,
        quantity
      }
    })
    .filter((entry): entry is { product: SearchProduct; quantity: number } => entry !== null)
}

export const useListsStorage = () => {
  const getParsedStorage = (): ListStorage[] => {
    if (!process.client) return []

    try {
      const raw = localStorage.getItem(LISTS_STORAGE_KEY)
      if (!raw) return []

      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []

      return parsed
        .map((entry): ListStorage | null => {
          if (!entry || typeof entry !== 'object') return null

          const row = entry as Record<string, unknown>
          const name = toStringOrNull(row.name)
          const savedAt = toStringOrNull(row.savedAt)
          const items = Array.isArray(row.items) ? row.items : []

          if (!name || !savedAt) return null

          return {
            name,
            items: normalizeListItems(items),
            savedAt
          }
        })
        .filter((entry): entry is ListStorage => entry !== null)
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

    const trimmedName = name.trim()
    if (!trimmedName) {
      return { ok: false, error: 'invalid_name' }
    }

    if (isNameListExist(trimmedName)) {
      return { ok: false, error: 'duplicate_name' }
    }

    const nextItems = [
      ...getParsedStorage(),
      {
        name: trimmedName,
        items: normalizeListItems(items),
        savedAt: new Date().toISOString()
      }
    ]

    const ok = setParsedStorage(nextItems)
    if (!ok) {
      return { ok: false, error: 'storage' }
    }

    return { ok: true }
  }

  const setUpdatedListStorageItemByName = (name: string, items: unknown[]): ResultListStorage => {
    if (!process.client) {
      return { ok: false, error: 'unavailable' }
    }

    const trimmedName = name.trim()
    if (!trimmedName) {
      return { ok: false, error: 'invalid_name' }
    }

    const existingItems = getParsedStorage()
    const index = existingItems.findIndex((item) => item.name === trimmedName)
    if (index < 0) {
      return { ok: false, error: 'storage' }
    }

    const nextItems = [...existingItems]
    nextItems[index] = {
      name: trimmedName,
      items: normalizeListItems(items),
      savedAt: new Date().toISOString()
    }

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
    setUpdatedListStorageItemByName,
    deleteListStorageItemByName
  }
}
