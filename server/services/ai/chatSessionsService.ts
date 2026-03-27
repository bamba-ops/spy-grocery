import type { UIMessage } from 'ai'
import type {
  ChatSession,
  CreateChatSessionBody
} from '#shared/types/ai-chat'
import type { Database, Json } from '#shared/types/database.types'
import {
  createChatSessionRow,
  deleteChatSessionRowById,
  getChatSessionRowById,
  getChatSessionRowsByUserId,
  setChatSessionMessagesRowById
} from '../../repositories/ai/chatSessionsRepository'

type ChatSessionRow = Database['public']['Tables']['ai_chat_sessions']['Row']

interface ChatSessionParams {
  supabase: any
  userId: string
}

interface GetChatSessionByIdParams extends ChatSessionParams {
  sessionId: string
}

interface CreateChatSessionParams extends ChatSessionParams {
  payload?: CreateChatSessionBody | null
}

interface SetChatSessionMessagesParams extends GetChatSessionByIdParams {
  messages: UIMessage[]
}

const MAX_SESSION_TITLE_LENGTH = 120
const DEFAULT_SESSION_TITLE_PREFIX = 'Conversation'

const getNormalizedTitle = (value: string) => {
  return value.trim().toLowerCase()
}

const getExistingSessionTitleSet = (rows: ChatSessionRow[]) => {
  const titleSet = new Set<string>()

  for (const row of rows) {
    if (typeof row.title !== 'string') {
      continue
    }

    const normalizedTitle = getNormalizedTitle(row.title)
    if (!normalizedTitle) {
      continue
    }

    titleSet.add(normalizedTitle)
  }

  return titleSet
}

const getNextDefaultSessionTitle = (existingTitles: Set<string>) => {
  let nextIndex = 1

  while (existingTitles.has(getNormalizedTitle(`${DEFAULT_SESSION_TITLE_PREFIX} ${nextIndex}`))) {
    nextIndex += 1
  }

  return `${DEFAULT_SESSION_TITLE_PREFIX} ${nextIndex}`
}

const getIncrementedTitle = (baseTitle: string, existingTitles: Set<string>) => {
  if (!existingTitles.has(getNormalizedTitle(baseTitle))) {
    return baseTitle
  }

  let nextIndex = 2

  while (existingTitles.has(getNormalizedTitle(`${baseTitle} ${nextIndex}`))) {
    nextIndex += 1
  }

  return `${baseTitle} ${nextIndex}`
}

const getUniqueSessionTitle = (requestedTitle: string | null, rows: ChatSessionRow[]) => {
  const existingTitles = getExistingSessionTitleSet(rows)

  if (!requestedTitle) {
    return getNextDefaultSessionTitle(existingTitles)
  }

  return getIncrementedTitle(requestedTitle, existingTitles)
}

const getSessionIdFromUnknown = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Invalid chat session id.'
    })
  }

  const trimmed = value.trim()

  if (!trimmed) {
    throw createError({
      statusCode: 400,
      message: 'Invalid chat session id.'
    })
  }

  return trimmed
}

const getSessionTitleFromUnknown = (value: unknown): string | null => {
  if (value === undefined || value === null) {
    return null
  }

  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Invalid chat title.'
    })
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  if (trimmed.length > MAX_SESSION_TITLE_LENGTH) {
    throw createError({
      statusCode: 400,
      message: `Chat title must be ${MAX_SESSION_TITLE_LENGTH} characters or fewer.`
    })
  }

  return trimmed
}

const toChatMessagesFromUnknown = (value: unknown): UIMessage[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value as UIMessage[]
}

const toChatSession = (row: ChatSessionRow): ChatSession => {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    messages_json: toChatMessagesFromUnknown(row.messages_json),
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_message_at: row.last_message_at
  }
}

export const getChatSessions = async ({ supabase, userId }: ChatSessionParams): Promise<ChatSession[]> => {
  const rows = await getChatSessionRowsByUserId(supabase, userId)
  return rows.map((row) => toChatSession(row))
}

export const getChatSessionById = async ({
  supabase,
  userId,
  sessionId
}: GetChatSessionByIdParams): Promise<ChatSession> => {
  const parsedSessionId = getSessionIdFromUnknown(sessionId)
  const row = await getChatSessionRowById(supabase, parsedSessionId, userId)

  if (!row) {
    throw createError({
      statusCode: 404,
      message: 'Chat session not found.'
    })
  }

  return toChatSession(row)
}

export const createChatSession = async ({
  supabase,
  userId,
  payload
}: CreateChatSessionParams): Promise<ChatSession> => {
  const requestedTitle = getSessionTitleFromUnknown(payload?.title)
  const existingRows = await getChatSessionRowsByUserId(supabase, userId)
  const title = getUniqueSessionTitle(requestedTitle, existingRows)

  const row = await createChatSessionRow(supabase, {
    userId,
    title,
    messagesJson: []
  })

  return toChatSession(row)
}

export const setChatSessionMessages = async ({
  supabase,
  userId,
  sessionId,
  messages
}: SetChatSessionMessagesParams): Promise<ChatSession> => {
  const parsedSessionId = getSessionIdFromUnknown(sessionId)

  if (!Array.isArray(messages)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid chat messages payload.'
    })
  }

  const now = new Date().toISOString()
  const row = await setChatSessionMessagesRowById(supabase, parsedSessionId, {
    userId,
    messagesJson: messages as unknown as Json,
    updatedAt: now,
    lastMessageAt: now
  })

  if (!row) {
    throw createError({
      statusCode: 404,
      message: 'Chat session not found.'
    })
  }

  return toChatSession(row)
}

export const deleteChatSession = async ({
  supabase,
  userId,
  sessionId
}: GetChatSessionByIdParams): Promise<void> => {
  const parsedSessionId = getSessionIdFromUnknown(sessionId)
  const deleted = await deleteChatSessionRowById(supabase, parsedSessionId, userId)

  if (!deleted) {
    throw createError({
      statusCode: 404,
      message: 'Chat session not found.'
    })
  }
}
