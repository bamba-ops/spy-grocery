import { serverSupabaseClient } from '#supabase/server'
import type { UIMessage } from 'ai'
import { z } from 'zod'
import { streamChatResponse } from '../../services/chat/chatService'

const requestSchema = z.object({
  messages: z.array(z.record(z.string(), z.any())).min(1),
  clientContext: z.object({
    sessionId: z.string().max(120).optional(),
    page: z.string().max(80).optional()
  }).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = requestSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid chat payload'
    })
  }

  const supabase = await serverSupabaseClient(event)

  return streamChatResponse({
    supabase,
    messages: parsed.data.messages as unknown as UIMessage[],
    clientContext: parsed.data.clientContext
  })
})
