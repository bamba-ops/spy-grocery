import type { Json } from '#shared/types/database.types'

interface ListRow {
  id: string
  user_id: string
  name: string
  items_json: Json
  created_at: string
  updated_at: string
}

interface UpsertListRowParams {
  userId: string
  name: string
  itemsJson: Json
}

const LIST_SELECT_FIELDS = [
  'id',
  'user_id',
  'name',
  'items_json',
  'created_at',
  'updated_at'
].join(',')

const getIsDuplicateNameError = (code: string | undefined) => code === '23505'

export const getListsRowsByUserId = async (supabase: any, userId: string): Promise<ListRow[]> => {
  const { data, error } = await supabase
    .from('lists')
    .select(LIST_SELECT_FIELDS)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Could not load saved lists: ${error.message}`
    })
  }

  return (data || []) as ListRow[]
}

export const createListRow = async (
  supabase: any,
  params: UpsertListRowParams
): Promise<ListRow> => {
  const { data, error } = await supabase
    .from('lists')
    .insert({
      user_id: params.userId,
      name: params.name,
      items_json: params.itemsJson
    })
    .select(LIST_SELECT_FIELDS)
    .single()

  if (error) {
    if (getIsDuplicateNameError(error.code)) {
      throw createError({
        statusCode: 409,
        message: 'A list with this name already exists.'
      })
    }

    throw createError({
      statusCode: 500,
      message: `Could not create list: ${error.message}`
    })
  }

  return data as ListRow
}

export const updateListRowById = async (
  supabase: any,
  listId: string,
  params: UpsertListRowParams
): Promise<ListRow | null> => {
  const { data, error } = await supabase
    .from('lists')
    .update({
      name: params.name,
      items_json: params.itemsJson
    })
    .eq('id', listId)
    .eq('user_id', params.userId)
    .select(LIST_SELECT_FIELDS)
    .maybeSingle()

  if (error) {
    if (getIsDuplicateNameError(error.code)) {
      throw createError({
        statusCode: 409,
        message: 'A list with this name already exists.'
      })
    }

    throw createError({
      statusCode: 500,
      message: `Could not update list: ${error.message}`
    })
  }

  return (data as ListRow | null) ?? null
}

export const deleteListRowById = async (supabase: any, listId: string, userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('lists')
    .delete()
    .eq('id', listId)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Could not delete list: ${error.message}`
    })
  }

  return Boolean(data?.id)
}
