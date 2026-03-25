import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { UIMessage } from 'ai'
import type { ListProduct } from '#shared/types/lists'
import { useChat } from '~/composables/api/useChat'

const QUICK_PROMPTS = [
  'Montre-moi les 5 produits les moins chers (titre, magasin, prix).',
  'Y a-t-il des produits chez Costco ? Donne quelques exemples.',
  'Quelles marques apparaissent le plus souvent ?',
  'Dans quels magasins les bananes sont les moins chères ?',
  "Donne 5 produits dont le titre contient 'organic'."
]

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
  const isCreateListMode = ref(false)
  const dismissedAiListKey = ref<string | null>(null)

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
    if (isBusy.value) {
      return
    }

    isCreateListMode.value = !isCreateListMode.value
    console.log('[ai-list] toggle createListMode:', isCreateListMode.value)
  }

  const setDismissAiList = () => {
    dismissedAiListKey.value = latestAiListPayload.value?.key ?? null
    console.log('[ai-list] dismiss list payload key:', dismissedAiListKey.value)
  }

  const setSendText = async (rawText: string) => {
    const text = rawText.trim()
    if (!text || isBusy.value) {
      console.log('[ai-list] send skipped:', {
        emptyText: !text,
        isBusy: isBusy.value
      })
      return false
    }

    console.log('[ai-list] send message:', {
      createListMode: isCreateListMode.value,
      textLength: text.length
    })

    await sendMessage({
      text,
      createListMode: isCreateListMode.value
    })

    console.log('[ai-list] send message completed')

    return true
  }

  const setQuickPrompt = async (prompt: string) => {
    return setSendText(prompt)
  }

  return {
    quickPrompts,
    isCreateListMode,
    messages,
    status,
    error,
    isBusy,
    visibleMessages,
    messageKey,
    showThinking,
    showSanitizedLeakNotice,
    aiListItems,
    getIsUnsafeAssistantText: isUnsafeAssistantText,
    setToggleCreateListMode,
    setDismissAiList,
    setSendText,
    setQuickPrompt
  }
})
