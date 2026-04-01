import type {
  ListResponse,
  ListsResponse,
  PersistedList,
  UpsertListPayload
} from '#shared/types/lists'

export const useLists = () => {
  const getLists = async (): Promise<PersistedList[]> => {
    const response = await $fetch<ListsResponse>('/api/lists')
    return response?.lists || []
  }

  const createList = async (payload: UpsertListPayload): Promise<PersistedList> => {
    const response = await $fetch<ListResponse>('/api/lists', {
      method: 'POST',
      body: payload
    })

    return response.list
  }

  const updateList = async (id: string, payload: UpsertListPayload): Promise<PersistedList> => {
    const response = await $fetch<ListResponse>(`/api/lists/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: payload
    })

    return response.list
  }

  const deleteList = async (id: string): Promise<void> => {
    await $fetch(`/api/lists/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    })
  }

  return {
    getLists,
    createList,
    updateList,
    deleteList
  }
}
