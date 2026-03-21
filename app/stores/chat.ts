import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ChatClientContext } from '#shared/types'

const createSessionId = () => {
  if (process.client && typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `session-${Date.now()}`
}

export const useChatStore = defineStore('chat', () => {
  const isOpen = ref(false)
  const sessionId = ref(createSessionId())

  const { chat, pending, sendMessage: sendMessageApi, retry: retryApi, stop: stopApi } = useChat({
    sessionId: sessionId.value
  })

  const messages = computed(() => chat.messages)
  const status = computed(() => chat.status)
  const error = computed(() => chat.error?.message || null)

  const setOpen = (value: boolean) => {
    isOpen.value = value
  }

  const setToggle = () => {
    isOpen.value = !isOpen.value
  }

  const sendMessage = async (text: string, context?: ChatClientContext) => {
    await sendMessageApi(text, context)
  }

  const retryLast = async (context?: ChatClientContext) => {
    await retryApi(context)
  }

  const stop = async () => {
    await stopApi()
  }

  const clearError = () => {
    chat.clearError()
  }

  return {
    isOpen,
    sessionId,
    messages,
    status,
    error,
    pending,
    setOpen,
    setToggle,
    sendMessage,
    retryLast,
    stop,
    clearError
  }
})
