import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport, type UIMessage } from 'ai'
import type { ListProduct } from '#shared/types/lists'
import {
  AI_CHAT_API_PATH,
  GROCERY_LIST_DATA_PART_TYPE,
  SUBMIT_LIST_ITEMS_TOOL_NAME
} from '#shared/utils/aiChat'

interface SendChatMessageParams {
  text: string
  createListMode: boolean
  chatId: string
}

interface LatestListPayload {
  key: string
  items: ListProduct[]
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const isNullableString = (value: unknown): value is string | null => {
  return typeof value === 'string' || value === null
}

const isNullableNumber = (value: unknown): value is number | null => {
  return typeof value === 'number' || value === null
}

const isNullableBoolean = (value: unknown): value is boolean | null => {
  return typeof value === 'boolean' || value === null
}

const isValidListProduct = (value: unknown): value is ListProduct => {
  if (!isRecord(value)) {
    return false
  }

  const product = value.product
  if (!isRecord(product)) {
    return false
  }

  return (
    typeof product.id === 'string'
    && typeof product.slug === 'string'
    && typeof product.title === 'string'
    && isNullableString(product.brand)
    && typeof product.store === 'string'
    && isNullableString(product.store_id)
    && isNullableString(product.image_url)
    && isNullableString(product.url)
    && isNullableString(product.uom)
    && isNullableNumber(product.price_num)
    && isNullableNumber(product.was_price_num)
    && isNullableString(product.price_text)
    && isNullableString(product.pre_price_text)
    && isNullableBoolean(product.on_sale)
    && isNullableString(product.scraped_at)
    && typeof value.quantity === 'number'
    && Number.isInteger(value.quantity)
    && value.quantity > 0
  )
}

const getListItemsFromUnknown = (value: unknown): ListProduct[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is ListProduct => isValidListProduct(item))
}

const getItemsFromPartPayload = (value: unknown): ListProduct[] => {
  if (!isRecord(value)) {
    return []
  }

  return getListItemsFromUnknown(value.items)
}

const getDataGroceryListItems = (part: unknown): ListProduct[] => {
  if (!isRecord(part) || part.type !== GROCERY_LIST_DATA_PART_TYPE) {
    return []
  }

  const data = part.data
  return getItemsFromPartPayload(data)
}

const getSubmitListItemsFromToolPart = (part: unknown): ListProduct[] => {
  if (!isRecord(part)) {
    return []
  }

  const isStaticSubmitPart = part.type === `tool-${SUBMIT_LIST_ITEMS_TOOL_NAME}`
  const isDynamicSubmitPart = part.type === 'dynamic-tool' && part.toolName === SUBMIT_LIST_ITEMS_TOOL_NAME

  if (!isStaticSubmitPart && !isDynamicSubmitPart) {
    return []
  }

  const outputItems = getItemsFromPartPayload(part.output)
  if (outputItems.length > 0) {
    return outputItems
  }

  return getItemsFromPartPayload(part.input)
}

export const useChat = () => {
  const chat = new Chat({
    transport: new DefaultChatTransport({
      api: AI_CHAT_API_PATH
    })
  })

  const sendMessage = async ({ text, createListMode, chatId }: SendChatMessageParams) => {
    console.log('[ai-list] transport send start:', {
      createListMode,
      chatId,
      textLength: text.length
    })

    try {
      await chat.sendMessage(
        { text },
        {
          body: {
            createListMode,
            chatId
          }
        }
      )

      console.log('[ai-list] transport send success')
    } catch (error) {
      console.error('[ai-list] transport send error:', error)
      throw error
    }
  }

  const getLatestAssistantListPayload = (messages: UIMessage[]): LatestListPayload | null => {
    for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex -= 1) {
      const message = messages[messageIndex]
      if (!message || message.role !== 'assistant' || !Array.isArray(message.parts)) {
        continue
      }

      for (const part of message.parts) {
        const items = getDataGroceryListItems(part)
        if (items.length > 0) {
          console.log('[ai-list] received data-grocery-list part:', {
            messageId: message.id,
            itemCount: items.length
          })

          const partId = isRecord(part) && 'id' in part && typeof part.id === 'string'
            ? part.id
            : 'grocery-list'
          return {
            key: `${message.id}:${partId}`,
            items
          }
        }

        const toolItems = getSubmitListItemsFromToolPart(part)
        if (toolItems.length > 0) {
          console.log('[ai-list] recovered list from submit_list_items tool part:', {
            messageId: message.id,
            itemCount: toolItems.length
          })

          const toolCallId = isRecord(part) && 'toolCallId' in part && typeof part.toolCallId === 'string'
            ? part.toolCallId
            : 'submit-list-items'

          return {
            key: `${message.id}:${toolCallId}`,
            items: toolItems
          }
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
