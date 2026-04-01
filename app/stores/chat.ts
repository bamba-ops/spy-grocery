import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { UIMessage } from 'ai'
import type { ChatSession } from '#shared/types/ai-chat'
import type { ListProduct } from '#shared/types/lists'
import { useChat } from '~/composables/api/useChat'
import { useChatSessions } from '~/composables/api/useChatSessions'
import { useAuthStore } from '~/stores/auth'

const QUICK_PROMPTS = [
  'Montre-moi les 5 produits les moins chers (titre, magasin, prix).',
  'Y a-t-il des produits chez Costco ? Donne quelques exemples.',
  'Quelles marques apparaissent le plus souvent ?',
  'Dans quels magasins les bananes sont les moins chères ?',
  "Donne 5 produits dont le titre contient 'organic'."
]

const DEFAULT_CHAT_LOGIN_NEXT_PATH = '/search'
const DEFAULT_CHAT_SESSIONS_ERROR_MESSAGE = 'Could not load conversations.'

const isUnsafeAssistantText = (text: string) => {
  const trimmed = text.trim()
  if (!trimmed) {
    return false
  }

  const lower = trimmed.toLowerCase()

  if (/^\{[\s\S]*"sql"\s*:/.test(trimmed)) {
    return true
  }

  if (/\{[\s\S]*"(rows|query|blocked|toolCallId|toolName)"\s*:/.test(trimmed)) {
    return true
  }

  if (/^select\s+[\s\S]+?\s+from\s+/i.test(trimmed)) {
    return true
  }

  if (/```(?:json|sql)?[\s\S]*```/i.test(trimmed)) {
    return true
  }

  if (/\b(i will run|i will query|i will fetch|now fetch|count query|without semicolons?)\b/i.test(lower)) {
    return true
  }

  return false
}

const hasTextPart = (message: UIMessage) => {
  return message.parts.some((part) => {
    return part.type === 'text' && part.text.trim().length > 0
  })
}

const hasSafeTextPart = (message: UIMessage) => {
  return message.parts.some((part) => {
    return part.type === 'text' && part.text.trim().length > 0 && !isUnsafeAssistantText(part.text)
  })
}

export const useChatStore = defineStore('chat', () => {
  const { chat, sendMessage, getLatestAssistantListPayload } = useChat()
  const chatSessionsApi = useChatSessions()
  const authStore = useAuthStore()
  const isCreateListMode = ref(false)
  const dismissedAiListKey = ref<string | null>(null)
  const currentChatId = ref<string | null>(null)
  const sessions = ref<ChatSession[]>([])
  const sessionsLoading = ref(false)
  const sessionsError = ref<string | null>(null)
  const isHydratingSession = ref(false)

  const quickPrompts = QUICK_PROMPTS

  const messages = computed(() => chat.messages)
  const status = computed(() => chat.status)
  const error = computed(() => chat.error)

  const isBusy = computed(() => status.value === 'submitted' || status.value === 'streaming')

  const visibleMessages = computed(() => {
    return messages.value.filter((message) => {
      if (message.role === 'user') {
        return hasTextPart(message)
      }

      if (message.role === 'assistant') {
        return hasSafeTextPart(message)
      }

      return false
    })
  })

  const messageKey = computed(() => {
    return visibleMessages.value
      .map((message) => {
        const text = message.parts
          .filter((part) => part.type === 'text')
          .map((part) => part.text)
          .join('')

        return `${message.id}:${text}`
      })
      .join('|')
  })

  const showThinking = computed(() => {
    if (!isBusy.value) {
      return false
    }

    const lastMessage = messages.value.at(-1)
    if (!lastMessage || lastMessage.role !== 'assistant') {
      return true
    }

    return !hasTextPart(lastMessage)
  })

  const showSanitizedLeakNotice = computed(() => {
    if (isBusy.value || !!error.value) {
      return false
    }

    const lastMessage = messages.value.at(-1)
    if (!lastMessage || lastMessage.role !== 'assistant') {
      return false
    }

    return hasTextPart(lastMessage) && !hasSafeTextPart(lastMessage)
  })

  const latestAiListPayload = computed(() => {
    return getLatestAssistantListPayload(messages.value)
  })

  const aiListItems = computed<ListProduct[]>(() => {
    const payload = latestAiListPayload.value
    if (!payload) {
      return []
    }

    if (dismissedAiListKey.value === payload.key) {
      return []
    }

    return payload.items
  })

  watch(
    () => latestAiListPayload.value?.key,
    (nextKey, previousKey) => {
      if (nextKey) {
        console.log('[ai-list] new list payload:', {
          key: nextKey,
          itemCount: latestAiListPayload.value?.items.length || 0
        })
      }

      if (nextKey && nextKey !== previousKey) {
        dismissedAiListKey.value = null
      }
    }
  )

  const setToggleCreateListMode = () => {
    if (isBusy.value || isHydratingSession.value) {
      return
    }

    isCreateListMode.value = !isCreateListMode.value
    console.log('[ai-list] toggle createListMode:', isCreateListMode.value)
  }

  const setHydrateCurrentChatFromSession = (session: ChatSession) => {
    currentChatId.value = session.id
    dismissedAiListKey.value = null
    chat.messages = Array.isArray(session.messages_json) ? session.messages_json : []
  }

  const setLoadChatSessions = async (options?: { force?: boolean }) => {
    if (!authStore.isReady) {
      await authStore.initAuth()
    }

    if (!authStore.user) {
      sessions.value = []
      sessionsError.value = null
      return []
    }

    const force = options?.force === true

    if (!force && sessionsLoading.value) {
      return sessions.value
    }

    sessionsLoading.value = true
    sessionsError.value = null

    try {
      const nextSessions = await chatSessionsApi.getChatSessions()
      sessions.value = nextSessions

      return sessions.value
    } catch (error) {
      console.error('[ai-list] load chat sessions failed:', error)
      sessionsError.value = DEFAULT_CHAT_SESSIONS_ERROR_MESSAGE
      return sessions.value
    } finally {
      sessionsLoading.value = false
    }
  }

  const setCreateNewChatSession = async () => {
    if (isBusy.value || isHydratingSession.value) {
      return null
    }

    if (!authStore.isReady) {
      await authStore.initAuth()
    }

    if (!authStore.user) {
      authStore.setOpenAuthPrompt({
        title: 'Unlock Spy AI',
        description: 'Sign in to save your conversations and build smarter grocery lists with AI.',
        nextPath: DEFAULT_CHAT_LOGIN_NEXT_PATH,
        ctaLabel: 'Sign in to use AI'
      })
      return null
    }

    try {
      const session = await chatSessionsApi.createChatSession()

      const nextSessions = sessions.value.filter((entry) => entry.id !== session.id)
      sessions.value = [session, ...nextSessions]
      sessionsError.value = null

      setHydrateCurrentChatFromSession(session)
      return session.id
    } catch (error) {
      console.error('[ai-list] create chat session failed:', error)
      sessionsError.value = DEFAULT_CHAT_SESSIONS_ERROR_MESSAGE
      return null
    }
  }

  const setOpenChatSessionById = async (sessionId: string) => {
    const normalizedSessionId = sessionId.trim()

    if (!normalizedSessionId || isBusy.value || isHydratingSession.value) {
      return false
    }

    if (currentChatId.value === normalizedSessionId) {
      return true
    }

    if (!authStore.isReady) {
      await authStore.initAuth()
    }

    if (!authStore.user) {
      authStore.setOpenAuthPrompt({
        title: 'Unlock Spy AI',
        description: 'Sign in to save your conversations and build smarter grocery lists with AI.',
        nextPath: DEFAULT_CHAT_LOGIN_NEXT_PATH,
        ctaLabel: 'Sign in to use AI'
      })
      return false
    }

    isHydratingSession.value = true

    try {
      const session = await chatSessionsApi.getChatSessionById(normalizedSessionId)
      const otherSessions = sessions.value.filter((entry) => entry.id !== session.id)
      sessions.value = [session, ...otherSessions]
      sessionsError.value = null

      setHydrateCurrentChatFromSession(session)
      return true
    } catch (error) {
      console.error('[ai-list] open chat session failed:', error)
      sessionsError.value = 'Could not open this conversation.'
      return false
    } finally {
      isHydratingSession.value = false
    }
  }

  const setDeleteChatSessionById = async (sessionId: string) => {
    const normalizedSessionId = sessionId.trim()

    if (!normalizedSessionId || isHydratingSession.value) {
      return false
    }

    try {
      await chatSessionsApi.deleteChatSession(normalizedSessionId)
      sessions.value = sessions.value.filter((entry) => entry.id !== normalizedSessionId)
      sessionsError.value = null

      if (currentChatId.value === normalizedSessionId) {
        setResetChatSession()
      }

      return true
    } catch (error) {
      console.error('[ai-list] delete chat session failed:', error)
      sessionsError.value = 'Could not delete this conversation.'
      return false
    }
  }

  const setEnsureChatSessionId = async () => {
    if (currentChatId.value) {
      return currentChatId.value
    }

    return setCreateNewChatSession()
  }

  const setResetChatSession = () => {
    currentChatId.value = null
    dismissedAiListKey.value = null
    chat.messages = []
  }

  const setResetSessionsState = () => {
    sessions.value = []
    sessionsLoading.value = false
    sessionsError.value = null
    isHydratingSession.value = false
  }

  const setDismissAiList = () => {
    dismissedAiListKey.value = latestAiListPayload.value?.key ?? null
    console.log('[ai-list] dismiss list payload key:', dismissedAiListKey.value)
  }

  const setSendText = async (rawText: string) => {
    const text = rawText.trim()
    if (!text || isBusy.value || isHydratingSession.value) {
      console.log('[ai-list] send skipped:', {
        emptyText: !text,
        isBusy: isBusy.value,
        isHydratingSession: isHydratingSession.value
      })
      return false
    }

    console.log('[ai-list] send message:', {
      createListMode: isCreateListMode.value,
      textLength: text.length
    })

    const chatId = await setEnsureChatSessionId()
    if (!chatId) {
      return false
    }

    try {
      await sendMessage({
        text,
        createListMode: isCreateListMode.value,
        chatId
      })
    } catch (error) {
      console.error('[ai-list] send message failed:', error)
      currentChatId.value = null
      return false
    }

    console.log('[ai-list] send message completed')

    return true
  }

  watch(
    () => authStore.user?.id,
    (nextUserId, previousUserId) => {
      if (previousUserId === undefined || nextUserId === previousUserId) {
        return
      }

      setResetChatSession()
      setResetSessionsState()
    }
  )

  const setQuickPrompt = async (prompt: string) => {
    return setSendText(prompt)
  }

  return {
    quickPrompts,
    isCreateListMode,
    sessions,
    sessionsLoading,
    sessionsError,
    isHydratingSession,
    messages,
    status,
    error,
    isBusy,
    currentChatId,
    visibleMessages,
    messageKey,
    showThinking,
    showSanitizedLeakNotice,
    aiListItems,
    getIsUnsafeAssistantText: isUnsafeAssistantText,
    setToggleCreateListMode,
    setLoadChatSessions,
    setHydrateCurrentChatFromSession,
    setCreateNewChatSession,
    setOpenChatSessionById,
    setDeleteChatSessionById,
    setDismissAiList,
    setResetChatSession,
    setSendText,
    setQuickPrompt
  }
})
