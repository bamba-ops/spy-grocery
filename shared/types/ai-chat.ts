export interface AiChatRequest {
  prompt: string
  debug?: boolean
}

export interface AiChatDebugEntry {
  sql: string
  rowCount: number
  blocked?: string | null
}

export interface AiChatResponse {
  answer: string
  debug?: {
    model: string
    toolCalls: AiChatDebugEntry[]
  }
}
