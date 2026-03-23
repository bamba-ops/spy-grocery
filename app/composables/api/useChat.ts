import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport, type UIMessage } from 'ai'
import type { ListProduct } from '#shared/types/lists'
import { AI_CHAT_API_PATH, GROCERY_LIST_DATA_PART_TYPE } from '#shared/utils/aiChat'

interface SendChatMessageParams {
  text: string
  createListMode: boolean
}

interface LatestListPayload {
  key: string
  items: ListProduct[]
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const getDataGroceryListItems = (part: unknown): ListProduct[] => {
  if (!isRecord(part) || part.type !== GROCERY_LIST_DATA_PART_TYPE) {
    return []
  }

  const data = part.data
  if (!isRecord(data) || !Array.isArray(data.items)) {
    return []
  }

  return data.items as ListProduct[]
}

export const useChat = () => {
  const chat = new Chat({
    transport: new DefaultChatTransport({
      api: AI_CHAT_API_PATH
    })
  })

  const sendMessage = async ({ text, createListMode }: SendChatMessageParams) => {
    await chat.sendMessage(
      { text },
      {
        body: {
          createListMode
        }
      }
    )
  }

  const getLatestAssistantListPayload = (messages: UIMessage[]): LatestListPayload | null => {
    for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex -= 1) {
      const message = messages[messageIndex]
      if (!message || message.role !== 'assistant' || !Array.isArray(message.parts)) {
        continue
      }

      for (const part of message.parts) {
        const items = getDataGroceryListItems(part)
        if (items.length === 0) {
          continue
        }

        const partId = isRecord(part) && 'id' in part && typeof part.id === 'string'
          ? part.id
          : 'grocery-list'
        return {
          key: `${message.id}:${partId}`,
          items
        }
      }
    }

    return null
  }

  return {
    chat,
    sendMessage,
    getLatestAssistantListPayload
  }
}
