import type { Json } from '#shared/types/database.types'
import type { ListProduct, PersistedList } from '#shared/types/lists'
import {
  createListRow,
  deleteListRowById,
  getListsRowsByUserId,
  updateListRowById
} from '../../repositories/listsRepository'

interface ListMutationPayload {
  name?: unknown
  items?: unknown
}

interface ListParams {
  supabase: any
  userId: string
}

interface ListMutationParams extends ListParams {
  payload: ListMutationPayload
}

interface ListUpdateParams extends ListMutationParams {
  listId: string
}

interface ListDeleteParams extends ListParams {
  listId: string
}

interface ListRow {
  id: string
  name: string
  items_json: Json
  created_at: string
  updated_at: string
}

const getIsRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const getIsNullableString = (value: unknown): value is string | null => {
  return typeof value === 'string' || value === null
}

const getIsNullableNumber = (value: unknown): value is number | null => {
  return typeof value === 'number' || value === null
}

const getIsNullableBoolean = (value: unknown): value is boolean | null => {
  return typeof value === 'boolean' || value === null
}

const getIsValidListProduct = (value: unknown): value is ListProduct => {
  if (!getIsRecord(value)) {
    return false
  }

  const product = value.product
  if (!getIsRecord(product)) {
    return false
  }

  const quantity = value.quantity

  return (
    typeof quantity === 'number'
    && Number.isInteger(quantity)
    && quantity > 0
    && typeof product.id === 'string'
    && typeof product.slug === 'string'
    && typeof product.title === 'string'
    && getIsNullableString(product.description)
    && getIsNullableString(product.brand)
    && typeof product.store === 'string'
    && getIsNullableString(product.store_id)
    && getIsNullableString(product.image_url)
    && getIsNullableString(product.url)
    && getIsNullableString(product.uom)
    && getIsNullableNumber(product.price_num)
    && getIsNullableNumber(product.was_price_num)
    && getIsNullableString(product.price_text)
    && getIsNullableString(product.pre_price_text)
    && getIsNullableBoolean(product.on_sale)
    && getIsNullableString(product.scraped_at)
  )
}

const getListItemsFromUnknown = (value: unknown): ListProduct[] => {
  if (!Array.isArray(value) || !value.every((item) => getIsValidListProduct(item))) {
    throw createError({
      statusCode: 400,
      message: 'Invalid list items payload.'
    })
  }

  return value
}

const getSafeListItemsFromUnknown = (value: unknown): ListProduct[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is ListProduct => getIsValidListProduct(item))
}

const getListNameFromUnknown = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'List name is required.'
    })
  }

  const trimmed = value.trim()

  if (!trimmed) {
    throw createError({
      statusCode: 400,
      message: 'List name is required.'
    })
  }

  if (trimmed.length > 120) {
    throw createError({
      statusCode: 400,
      message: 'List name must be 120 characters or fewer.'
    })
  }

  return trimmed
}

const getListIdFromUnknown = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Invalid list id.'
    })
  }

  const trimmed = value.trim()

  if (!trimmed) {
    throw createError({
      statusCode: 400,
      message: 'Invalid list id.'
    })
  }

  return trimmed
}

const toPersistedList = (row: ListRow): PersistedList => {
  return {
    id: row.id,
    name: row.name,
    items: getSafeListItemsFromUnknown(row.items_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export const listLists = async ({ supabase, userId }: ListParams) => {
  const rows = await getListsRowsByUserId(supabase, userId)
  return rows.map((row) => toPersistedList(row as ListRow))
}

export const createList = async ({ supabase, userId, payload }: ListMutationParams) => {
  const name = getListNameFromUnknown(payload?.name)
  const items = getListItemsFromUnknown(payload?.items)

  const row = await createListRow(supabase, {
    userId,
    name,
    itemsJson: items as unknown as Json
  })

  return toPersistedList(row as ListRow)
}

export const updateList = async ({ supabase, userId, listId, payload }: ListUpdateParams) => {
  const parsedListId = getListIdFromUnknown(listId)
  const name = getListNameFromUnknown(payload?.name)
  const items = getListItemsFromUnknown(payload?.items)

  const row = await updateListRowById(supabase, parsedListId, {
    userId,
    name,
    itemsJson: items as unknown as Json
  })

  if (!row) {
    throw createError({
      statusCode: 404,
      message: 'List not found.'
    })
  }

  return toPersistedList(row as ListRow)
}

export const deleteList = async ({ supabase, userId, listId }: ListDeleteParams) => {
  const parsedListId = getListIdFromUnknown(listId)
  const deleted = await deleteListRowById(supabase, parsedListId, userId)

  if (!deleted) {
    throw createError({
      statusCode: 404,
      message: 'List not found.'
    })
  }
}
