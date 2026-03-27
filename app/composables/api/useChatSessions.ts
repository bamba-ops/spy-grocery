import type {
  ChatSession,
  ChatSessionResponse,
  ChatSessionsResponse,
  CreateChatSessionBody
} from '#shared/types/ai-chat'
import { AI_CHAT_SESSIONS_API_PATH } from '#shared/utils/aiChat'

export const useChatSessions = () => {
  const getChatSessions = async (): Promise<ChatSession[]> => {
    const response = await $fetch<ChatSessionsResponse>(AI_CHAT_SESSIONS_API_PATH)
    return response?.sessions || []
  }

  const getChatSessionById = async (id: string): Promise<ChatSession> => {
    const response = await $fetch<ChatSessionResponse>(`${AI_CHAT_SESSIONS_API_PATH}/${encodeURIComponent(id)}`)
    return response.session
  }

  const createChatSession = async (payload?: CreateChatSessionBody): Promise<ChatSession> => {
    const response = await $fetch<ChatSessionResponse>(AI_CHAT_SESSIONS_API_PATH, {
      method: 'POST',
      body: payload || {}
    })

    return response.session
  }

  const deleteChatSession = async (id: string): Promise<void> => {
    await $fetch(`${AI_CHAT_SESSIONS_API_PATH}/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    })
  }

  return {
    getChatSessions,
    getChatSessionById,
    createChatSession,
    deleteChatSession
  }
}
