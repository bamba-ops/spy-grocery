import type { Database, Json } from '#shared/types/database.types'

type ChatSessionRow = Database['public']['Tables']['ai_chat_sessions']['Row']

interface CreateChatSessionRowParams {
  userId: string
  title: string | null
  messagesJson?: Json
}

interface SetChatSessionMessagesRowParams {
  userId: string
  messagesJson: Json
  updatedAt: string
  lastMessageAt: string
}

const CHAT_SESSION_SELECT_FIELDS = [
  'id',
  'user_id',
  'title',
  'messages_json',
  'created_at',
  'updated_at',
  'last_message_at'
].join(',')

export const getChatSessionRowsByUserId = async (
  supabase: any,
  userId: string
): Promise<ChatSessionRow[]> => {
  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .select(CHAT_SESSION_SELECT_FIELDS)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Could not load chat sessions: ${error.message}`
    })
  }

  return (data || []) as ChatSessionRow[]
}

export const getChatSessionRowById = async (
  supabase: any,
  sessionId: string,
  userId: string
): Promise<ChatSessionRow | null> => {
  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .select(CHAT_SESSION_SELECT_FIELDS)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Could not load chat session: ${error.message}`
    })
  }

  return (data as ChatSessionRow | null) ?? null
}

export const createChatSessionRow = async (
  supabase: any,
  params: CreateChatSessionRowParams
): Promise<ChatSessionRow> => {
  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .insert({
      user_id: params.userId,
      title: params.title,
      messages_json: params.messagesJson ?? []
    })
    .select(CHAT_SESSION_SELECT_FIELDS)
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Could not create chat session: ${error.message}`
    })
  }

  return data as ChatSessionRow
}

export const setChatSessionMessagesRowById = async (
  supabase: any,
  sessionId: string,
  params: SetChatSessionMessagesRowParams
): Promise<ChatSessionRow | null> => {
  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .update({
      messages_json: params.messagesJson,
      updated_at: params.updatedAt,
      last_message_at: params.lastMessageAt
    })
    .eq('id', sessionId)
    .eq('user_id', params.userId)
    .select(CHAT_SESSION_SELECT_FIELDS)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Could not update chat session: ${error.message}`
    })
  }

  return (data as ChatSessionRow | null) ?? null
}

export const deleteChatSessionRowById = async (
  supabase: any,
  sessionId: string,
  userId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Could not delete chat session: ${error.message}`
    })
  }

  return Boolean(data?.id)
}
