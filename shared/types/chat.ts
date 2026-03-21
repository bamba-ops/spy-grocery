export type ChatToolName = 'search_products' | 'get_stores'

export interface ChatUserMessage {
  role: 'user'
  text: string
}

export interface ChatToolCall {
  tool: ChatToolName
  args: Record<string, unknown>
}

export interface ChatToolResult {
  tool: ChatToolName
  ok: boolean
  data?: unknown
  error?: string
}

export interface ChatClientContext {
  sessionId?: string
  page?: string
}

export interface ChatApiRequest {
  messages: Array<Record<string, unknown>>
  clientContext?: ChatClientContext
}

export interface ChatApiStreamMeta {
  sessionId: string
  toolCalls: number
  latencyMs: number
}
