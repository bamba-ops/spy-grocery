import type { Product } from '#shared/types'

export interface ListProduct {
  product: Product
  quantity: number
}

export interface ListsProduct {
  id: string
  name: string
  items: ListProduct[]
  createdAt: Date
  updatedAt: Date
}

export interface PersistedList {
  id: string
  name: string
  items: ListProduct[]
  createdAt: string
  updatedAt: string
}

export interface UpsertListPayload {
  name: string
  items: ListProduct[]
}

export interface ListsResponse {
  lists: PersistedList[]
}

export interface ListResponse {
  list: PersistedList
}

export interface ListStorage {
  name: string
  items: unknown[]
  savedAt: string
}

export type ErrorListStorage = 'unavailable' | 'invalid_name' | 'duplicate_name' | 'storage'
export type ResultListStorage =
  | { ok: true }
  | { ok: false; error: ErrorListStorage }
