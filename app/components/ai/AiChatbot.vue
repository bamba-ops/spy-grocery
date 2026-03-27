<script setup lang="ts">
import { ArrowLeft, Loader2, Send, X } from 'lucide-vue-next'
import { computed } from 'vue'
import { useChatStore } from '~/stores/chat'
import { useListsStore } from '~/stores/lists'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
}>()

const input = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const messagesContainerRef = ref<HTMLElement | null>(null)
const lists = useListsStore()
const chatStore = useChatStore()
const panelView = ref<'sessions' | 'chat'>('sessions')
const isDeleteConfirmOpen = ref(false)
const pendingDeleteChatId = ref<string | null>(null)

const currentSessionTitle = computed(() => {
  if (!chatStore.currentChatId) {
    return 'Conversation'
  }

  const session = chatStore.sessions.find((entry) => entry.id === chatStore.currentChatId)
  const title = session?.title?.trim()

  if (!title) {
    return 'Conversation'
  }

  return title
})

const panelTitle = computed(() => {
  if (panelView.value === 'sessions') {
    return 'Conversations'
  }

  return currentSessionTitle.value
})

const pendingDeleteChatTitle = computed(() => {
  if (!pendingDeleteChatId.value) {
    return 'this conversation'
  }

  const session = chatStore.sessions.find((entry) => entry.id === pendingDeleteChatId.value)
  const title = session?.title?.trim()

  if (!title) {
    return 'this conversation'
  }

  return `"${title}"`
})

const canSend = computed(() => {
  return input.value.trim().length > 0 && !chatStore.isBusy && !chatStore.isHydratingSession
})

const setClosePanel = () => {
  emit('update:open', false)
}

const scrollToBottom = () => {
  if (!messagesContainerRef.value) {
    return
  }

  messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
}

const setAddAiItemsToCurrentList = () => {
  if (chatStore.aiListItems.length === 0) {
    return
  }

  for (const item of chatStore.aiListItems) {
    for (let index = 0; index < item.quantity; index += 1) {
      lists.setProductInCurrentList(item.product)
    }
  }

  lists.setShoppingListDrawerOpen()
  chatStore.setDismissAiList()
  setClosePanel()
}

const setSubmitMessage = async () => {
  const draft = input.value
  if (!draft.trim() || chatStore.isBusy || chatStore.isHydratingSession) {
    return
  }

  input.value = ''
  const isSent = await chatStore.setSendText(draft)

  if (!isSent) {
    input.value = draft
  }
}

const setQuickPrompt = async (prompt: string) => {
  await chatStore.setQuickPrompt(prompt)
}

const setBackToSessions = () => {
  panelView.value = 'sessions'
}

const setCreateChatSession = async () => {
  const nextChatId = await chatStore.setCreateNewChatSession()

  if (!nextChatId) {
    return
  }

  panelView.value = 'chat'

  nextTick(() => {
    inputRef.value?.focus()
    scrollToBottom()
  })
}

const setOpenChatSession = async (chatId: string) => {
  const isOpened = await chatStore.setOpenChatSessionById(chatId)

  if (!isOpened) {
    return
  }

  panelView.value = 'chat'

  nextTick(() => {
    inputRef.value?.focus()
    scrollToBottom()
  })
}

const setRetryLoadChatSessions = async () => {
  await chatStore.setLoadChatSessions({ force: true })
}

const setOpenMostRecentSessionIfAvailable = async () => {
  const sessions = await chatStore.setLoadChatSessions({ force: true })

  if (sessions.length === 0) {
    panelView.value = 'sessions'
    return
  }

  chatStore.setHydrateCurrentChatFromSession(sessions[0])
  panelView.value = 'chat'

  nextTick(() => {
    inputRef.value?.focus()
    scrollToBottom()
  })
}

const setRequestDeleteChatSession = (chatId: string) => {
  if (!chatId.trim() || chatStore.isHydratingSession) {
    return
  }

  pendingDeleteChatId.value = chatId
  isDeleteConfirmOpen.value = true
}

const setCloseDeleteConfirm = () => {
  isDeleteConfirmOpen.value = false
  pendingDeleteChatId.value = null
}

const setConfirmDeleteChatSession = async () => {
  const chatId = pendingDeleteChatId.value
  if (!chatId) {
    setCloseDeleteConfirm()
    return
  }

  const deleted = await chatStore.setDeleteChatSessionById(chatId)
  setCloseDeleteConfirm()

  if (!deleted) {
    return
  }

  if (!chatStore.currentChatId) {
    panelView.value = 'sessions'
  }
}

watch(
  () => props.open,
  async (open) => {
    if (!open) {
      setCloseDeleteConfirm()
      return
    }

    await setOpenMostRecentSessionIfAvailable()
  }
)

watch(() => chatStore.messageKey, () => {
  if (panelView.value !== 'chat') {
    return
  }

  nextTick(scrollToBottom)
})

watch(
  () => chatStore.status,
  () => {
    if (panelView.value !== 'chat') {
      return
    }

    nextTick(scrollToBottom)
  }
)
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-x-4 bottom-20 z-50 sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[min(46rem,calc(100vw-3rem))]"
  >
    <section
      class="flex h-[min(78vh,640px)] w-full flex-col overflow-hidden rounded-[32px] border border-white/15 bg-black/90 shadow-[0_40px_100px_rgba(0,0,0,0.65)] backdrop-blur-md"
      aria-label="Spy AI"
    >
      <header class="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div class="flex min-w-0 items-center gap-3">
          <button
            v-if="panelView === 'chat'"
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label="Back to conversations"
            @click="setBackToSessions"
          >
            <ArrowLeft class="h-4 w-4" />
          </button>

          <div class="min-w-0">
            <p class="text-[10px] uppercase tracking-[0.35em] text-white/55">Spy AI</p>
            <h2 class="truncate font-display text-2xl italic tracking-tight text-white sm:text-3xl">{{ panelTitle }}</h2>
          </div>
        </div>

        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label="Close AI chat"
          @click="setClosePanel"
        >
          <X class="h-4 w-4" />
        </button>
      </header>

      <template v-if="panelView === 'sessions'">
        <AiChatSessionsList
          :sessions="chatStore.sessions"
          :current-chat-id="chatStore.currentChatId"
          :is-loading="chatStore.sessionsLoading"
          :is-hydrating="chatStore.isHydratingSession"
          :error="chatStore.sessionsError"
          :disabled="chatStore.isBusy"
          @create="setCreateChatSession"
          @open="setOpenChatSession"
          @delete="setRequestDeleteChatSession"
          @retry="setRetryLoadChatSessions"
        />
      </template>

      <template v-else>
        <div ref="messagesContainerRef" class="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <template v-if="chatStore.visibleMessages.length === 0">
            <div>
              <p class="mb-2 text-[10px] uppercase tracking-[0.35em] text-white/55">Spy AI</p>
              <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p class="mb-3 text-sm leading-relaxed text-white/90 sm:text-base">
                  Prompts rapides
                </p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="(prompt, index) in chatStore.quickPrompts"
                    :key="`quick-prompt-${index}`"
                    type="button"
                    class="rounded-full border border-white/20 bg-black/60 px-3 py-2 text-left text-xs text-white/90 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                    :disabled="chatStore.isBusy || chatStore.isHydratingSession"
                    @click="setQuickPrompt(prompt)"
                  >
                    {{ prompt }}
                  </button>
                </div>
              </div>
            </div>
          </template>

          <div
            v-for="(message, index) in chatStore.visibleMessages"
            :key="message.id ? message.id : index"
            :class="[
              'flex flex-col',
              message.role === 'user' ? 'items-end' : 'items-start'
            ]"
          >
            <p class="mb-2 text-[10px] uppercase tracking-[0.35em] text-white/55">
              {{ message.role === 'user' ? 'You' : 'Spy AI' }}
            </p>

            <div
              :class="[
                'max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-base',
                message.role === 'user'
                  ? 'bg-white text-black shadow-[0_10px_30px_rgba(0,0,0,0.45)]'
                  : 'border border-white/10 bg-white/5 text-white/90'
              ]"
            >
              <template v-for="(part, partIndex) in message.parts" :key="`${message.id}-${part.type}-${partIndex}`">
                <p v-if="part.type === 'text' && !chatStore.getIsUnsafeAssistantText(part.text)" class="whitespace-pre-wrap">
                  {{ part.text }}
                </p>
              </template>
            </div>
          </div>

          <div v-if="chatStore.showThinking" class="flex flex-col items-start">
            <p class="mb-2 text-[10px] uppercase tracking-[0.35em] text-white/55">Spy AI</p>
            <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm sm:text-base">
              <div class="flex items-center gap-2">
                <span
                  class="bg-[linear-gradient(110deg,rgba(255,255,255,0.35)_20%,rgba(255,255,255,0.95)_45%,rgba(255,255,255,0.35)_70%)] bg-[length:220%_100%] bg-clip-text text-transparent animate-shimmer"
                >
                  Thinking...
                </span>
              </div>
            </div>
          </div>

          <div v-if="chatStore.showSanitizedLeakNotice" class="flex flex-col items-start">
            <p class="mb-2 text-[10px] uppercase tracking-[0.35em] text-white/55">Spy AI</p>
            <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 sm:text-base">
              I could not format that answer correctly. Please try again.
            </div>
          </div>

          <div
            v-if="chatStore.error"
            class="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white/80"
          >
            Something went wrong.
          </div>

          <div v-if="chatStore.aiListItems.length > 0" class="flex flex-col items-start">
            <p class="mb-2 text-[10px] uppercase tracking-[0.35em] text-white/55">Spy AI</p>
            <AiListPreview
              :items="chatStore.aiListItems"
              @add="setAddAiItemsToCurrentList"
              @dismiss="chatStore.setDismissAiList"
            />
          </div>
        </div>

        <form
          class="border-t border-white/10 p-4 sm:p-5"
          @submit.prevent="setSubmitMessage"
        >
          <div class="mb-3 flex items-center justify-between px-1">
            <p class="text-[10px] uppercase tracking-[0.35em] text-white/55">Action</p>
            <button
              type="button"
              class="inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[10px] uppercase tracking-[0.3em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
              :class="chatStore.isCreateListMode
                ? 'border-white/25 bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.2)]'
                : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10'"
              :disabled="chatStore.isBusy || chatStore.isHydratingSession"
              @click="chatStore.setToggleCreateListMode"
            >
              <span>Liste</span>
              <span
                class="inline-flex min-w-12 items-center justify-center rounded-full px-2 py-1 text-[9px] tracking-[0.25em]"
                :class="chatStore.isCreateListMode ? 'bg-black text-white' : 'bg-white/15 text-white/90'"
              >
                {{ chatStore.isCreateListMode ? 'ON' : 'OFF' }}
              </span>
            </button>
          </div>

          <div class="flex items-center gap-2 rounded-full border border-white/15 bg-black/80 px-3 py-2">
            <input
              ref="inputRef"
              v-model="input"
              type="text"
              class="h-10 flex-1 bg-transparent px-2 text-sm text-white placeholder:text-white/35 focus:outline-none sm:text-base"
              placeholder="Ask Spy AI..."
              :disabled="chatStore.isBusy || chatStore.isHydratingSession"
            >

            <button
              type="submit"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white text-black transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!canSend"
              aria-label="Send message"
            >
              <Loader2 v-if="chatStore.isBusy" class="h-4 w-4 animate-spin" />
              <Send v-else class="h-4 w-4" />
            </button>
          </div>
        </form>
      </template>

      <ConfirmActionModal
        :open="isDeleteConfirmOpen"
        eyebrow="Delete conversation"
        title="Remove chat"
        :message="`Are you sure you want to delete ${pendingDeleteChatTitle}?`"
        confirm-text="Delete"
        cancel-text="Cancel"
        destructive
        @close="setCloseDeleteConfirm"
        @confirm="setConfirmDeleteChatSession"
      />
    </section>
  </div>
</template>
