import { serverSupabaseClient } from '#supabase/server'
import type { UIMessage } from 'ai'
import { streamChatWithProductsDb } from '../../services/ai/chatService'

interface ChatRequestBody {
  messages?: UIMessage[]
}

const getMessagesFromBody = (body: ChatRequestBody | null): UIMessage[] => {
  if (!Array.isArray(body?.messages)) {
    return []
  }

  return body.messages
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ChatRequestBody | null>(event)
  const messages = getMessagesFromBody(body)

  if (messages.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Messages are required.'
    })
  }

  const runtimeConfig = useRuntimeConfig()
  const aiGatewayApiKey = runtimeConfig.aiGatewayApiKey?.toString().trim()
  const aiGatewayModel = runtimeConfig.aiGatewayModel?.toString().trim() || 'openai/gpt-5-nano'

  if (!aiGatewayApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Missing AI gateway API key configuration.'
    })
  }

  const supabase = await serverSupabaseClient(event)
  const result = await streamChatWithProductsDb({
    supabase,
    messages,
    aiGatewayApiKey,
    aiGatewayModel
  })

  return result.toUIMessageStreamResponse({
    onError: () => 'Something went wrong.'
  })
})
