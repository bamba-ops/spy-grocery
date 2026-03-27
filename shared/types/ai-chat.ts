import type { UIMessage } from 'ai'
import type { ListProduct } from './lists'

export interface ChatRequestBody {
  messages?: UIMessage[]
  createListMode?: boolean
  chatId?: string
}

export interface ChatSession {
  id: string
  user_id: string
  title: string | null
  messages_json: UIMessage[]
  created_at: string
  updated_at: string
  last_message_at: string
}

export interface CreateChatSessionBody {
  title?: string | null
}

export interface ChatSessionResponse {
  session: ChatSession
}

export interface ChatSessionsResponse {
  sessions: ChatSession[]
}

export interface GroceryListDataPart {
  id?: string
  type: 'data-grocery-list'
  data: {
    items: ListProduct[]
  }
}
