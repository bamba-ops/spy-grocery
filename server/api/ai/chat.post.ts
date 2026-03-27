import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { ChatRequestBody, GroceryListDataPart } from '#shared/types/ai-chat'
import type { ListProduct } from '#shared/types/lists'
import { GROCERY_LIST_DATA_PART_TYPE } from '#shared/utils/aiChat'
import { getSupabaseAuthUserId } from '#shared/utils/getSupabaseAuthUserId'
import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from 'ai'
import { streamChatWithProductsDb } from '../../services/ai/chatService'
import {
  getChatSessionById,
  setChatSessionMessages
} from '../../services/ai/chatSessionsService'

const getMessagesFromBody = (body: ChatRequestBody | null): UIMessage[] => {
  if (!Array.isArray(body?.messages)) {
    return []
  }

  return body.messages
}

const getChatIdFromBody = (body: ChatRequestBody | null): string => {
  if (typeof body?.chatId !== 'string') {
    return ''
  }

  return body.chatId.trim()
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ChatRequestBody | null>(event)
  const messages = getMessagesFromBody(body)
  const createListMode = body?.createListMode === true
  const chatId = getChatIdFromBody(body)

  console.log('[ai-list][api] incoming request:', {
    createListMode,
    messageCount: messages.length
  })

  if (messages.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Messages are required.'
    })
  }

  if (!chatId) {
    throw createError({
      statusCode: 400,
      message: 'chatId is required.'
    })
  }

  try {
    const supabase = await serverSupabaseClient(event)
    const userClaims = await serverSupabaseUser(event).catch(() => null)
    const userId = getSupabaseAuthUserId(userClaims)

    if (!userId) {
      throw createError({
        statusCode: 401,
        message: 'Authentication required.'
      })
    }

    await getChatSessionById({
      supabase,
      userId,
      sessionId: chatId
    })

    const runtimeConfig = useRuntimeConfig()
    const aiGatewayApiKey = runtimeConfig.aiGatewayApiKey?.toString().trim()
    const aiGatewayModel = runtimeConfig.aiGatewayModel?.toString().trim() || 'openai/gpt-5-nano'

    if (!aiGatewayApiKey) {
      throw createError({
        statusCode: 500,
        message: 'Missing AI gateway API key configuration.'
      })
    }

    let listItems: ListProduct[] = []

    const setPersistMessages = async (nextMessages: UIMessage[]) => {
      try {
        await setChatSessionMessages({
          supabase,
          userId,
          sessionId: chatId,
          messages: nextMessages
        })

        console.log('[ai-list][api] persisted chat session snapshot:', {
          chatId,
          messageCount: nextMessages.length
        })
      } catch (error) {
        console.error('[ai-list][api] failed to persist chat session snapshot:', {
          chatId,
          error
        })
      }
    }

    const result = await streamChatWithProductsDb({
      supabase,
      messages,
      aiGatewayApiKey,
      aiGatewayModel,
      createListMode,
      onListItems: (items) => {
        listItems = items
        console.log('[ai-list][api] onListItems callback:', {
          itemCount: items.length
        })
      }
    })

    if (createListMode) {
      const stream = createUIMessageStream({
        originalMessages: messages,
        execute: ({ writer }) => {
          writer.merge(result.toUIMessageStream({
            onFinish: () => {
              console.log('[ai-list][api] stream finish (list mode):', {
                itemCount: listItems.length
              })

              const dataPart: GroceryListDataPart = {
                type: GROCERY_LIST_DATA_PART_TYPE,
                data: {
                  items: listItems
                }
              }

              writer.write(dataPart as Parameters<typeof writer.write>[0])
            }
          }))
        },
        onFinish: async ({ messages: finishedMessages }) => {
          await setPersistMessages(finishedMessages)
        },
        onError: () => 'Something went wrong.'
      })

      return createUIMessageStreamResponse({ stream })
    }

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ messages: finishedMessages }) => {
        await setPersistMessages(finishedMessages)
      },
      onError: () => 'Something went wrong.'
    })
  } catch (error) {
    console.error('[ai-list][api] request failed:', error)
    throw error
  }
})
