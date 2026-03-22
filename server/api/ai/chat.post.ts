import { serverSupabaseClient } from '#supabase/server'
import type { UIMessage } from 'ai'
import { streamChatWithProductsDb } from '../../services/ai/chatService'

interface ChatRequestBody {
  messages?: UIMessage[]
}

const AI_LOG_PREFIX = '[ai-chat]'

const getMessagesFromBody = (body: ChatRequestBody | null): UIMessage[] => {
  if (!Array.isArray(body?.messages)) {
    return []
  }

  return body.messages
}

const getRequestId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const getLastUserMessagePreview = (messages: UIMessage[]) => {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i]
    if (message.role !== 'user' || !Array.isArray(message.parts)) {
      continue
    }

    const text = message.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (text) {
      return text.slice(0, 200)
    }
  }

  return ''
}

export default defineEventHandler(async (event) => {
  const requestId = getRequestId()
  const startedAt = Date.now()
  console.info(`${AI_LOG_PREFIX}[${requestId}] incoming /api/ai/chat request`)

  const body = await readBody<ChatRequestBody | null>(event)
  const messages = getMessagesFromBody(body)

  if (messages.length === 0) {
    console.warn(`${AI_LOG_PREFIX}[${requestId}] invalid payload: empty messages array`)
    throw createError({
      statusCode: 400,
      message: 'Messages are required.'
    })
  }

  const runtimeConfig = useRuntimeConfig()
  const aiGatewayApiKey = runtimeConfig.aiGatewayApiKey?.toString().trim()
  const aiGatewayModel = runtimeConfig.aiGatewayModel?.toString().trim() || 'openai/gpt-5-nano'
  const lastUserMessagePreview = getLastUserMessagePreview(messages)

  console.info(`${AI_LOG_PREFIX}[${requestId}] payload validated`, {
    messageCount: messages.length,
    hasApiKey: Boolean(aiGatewayApiKey),
    model: aiGatewayModel,
    lastUserMessagePreview
  })

  if (!aiGatewayApiKey) {
    console.error(`${AI_LOG_PREFIX}[${requestId}] missing runtime config aiGatewayApiKey`)
    throw createError({
      statusCode: 500,
      message: 'Missing AI gateway API key configuration.'
    })
  }

  try {
    const supabase = await serverSupabaseClient(event)
    console.info(`${AI_LOG_PREFIX}[${requestId}] supabase client ready`)

    const result = await streamChatWithProductsDb({
      supabase,
      messages,
      aiGatewayApiKey,
      aiGatewayModel,
      requestId
    })

    console.info(`${AI_LOG_PREFIX}[${requestId}] stream initialized`, {
      durationMs: Date.now() - startedAt
    })

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error(`${AI_LOG_PREFIX}[${requestId}] stream transport error`, error)
        return 'Something went wrong.'
      }
    })
  } catch (error) {
    console.error(`${AI_LOG_PREFIX}[${requestId}] request failed`, error)
    throw error
  }
})
