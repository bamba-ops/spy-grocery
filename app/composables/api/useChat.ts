import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport, generateId, type UIMessage } from 'ai'
import { computed } from 'vue'
import type { ChatClientContext } from '#shared/types'

interface UseChatOptions {
  sessionId: string
}

const buildContext = (sessionId: string, context?: ChatClientContext): ChatClientContext => ({
  sessionId,
  page: 'search',
  ...(context || {})
})

export const useChat = ({ sessionId }: UseChatOptions) => {
  const chat = new Chat<UIMessage>({
    id: `spygrocery-${sessionId}`,
    generateId,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        clientContext: buildContext(sessionId)
      }
    })
  })

  const pending = computed(() => chat.status === 'submitted' || chat.status === 'streaming')

  const sendMessage = async (text: string, context?: ChatClientContext) => {
    const cleanedText = text.trim()
    if (!cleanedText) return

    await chat.sendMessage(
      { text: cleanedText },
      {
        body: {
          clientContext: buildContext(sessionId, context)
        }
      }
    )
  }

  const retry = async (context?: ChatClientContext) => {
    await chat.regenerate({
      body: {
        clientContext: buildContext(sessionId, context)
      }
    })
  }

  const stop = async () => {
    await chat.stop()
  }

  return {
    chat,
    pending,
    sendMessage,
    retry,
    stop
  }
}
