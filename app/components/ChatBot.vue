<script setup lang="ts">
import { Loader2, MessageCircle, RotateCcw, Send, Square, X } from 'lucide-vue-next'
import { computed, nextTick, ref, watch } from 'vue'
import { useChatStore } from '~/stores/chat'

const chatStore = useChatStore()
const input = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const hasMessages = computed(() => chatStore.messages.length > 0)
const isDisabled = computed(() => chatStore.pending || !input.value.trim())

const extractText = (message: any) => {
  const parts = Array.isArray(message?.parts) ? message.parts : []

  return parts
    .filter((part: any) => part?.type === 'text' && typeof part.text === 'string' && part.text.trim() !== '')
    .map((part: any) => part.text)
    .join('\n')
}

const extractToolParts = (message: any) => {
  const parts = Array.isArray(message?.parts) ? message.parts : []

  return parts.filter((part: any) => typeof part?.type === 'string' && part.type.startsWith('tool-'))
}

const formatToolName = (toolType: string) => toolType.replace(/^tool-/, '').replaceAll('_', ' ')

const setScrollToBottom = async () => {
  await nextTick()

  if (!messagesContainer.value) return
  messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
}

watch(
  () => chatStore.messages.length,
  () => {
    void setScrollToBottom()
  }
)

const onSubmit = async () => {
  if (isDisabled.value) return

  const text = input.value
  input.value = ''

  await chatStore.sendMessage(text, {
    sessionId: chatStore.sessionId,
    page: 'search'
  })
}

const onRetry = async () => {
  await chatStore.retryLast({
    sessionId: chatStore.sessionId,
    page: 'search'
  })
}

const onStop = async () => {
  await chatStore.stop()
}

const onOpenToggle = () => {
  chatStore.setToggle()
  if (!chatStore.isOpen) return
  void setScrollToBottom()
}
</script>

<template>
  <button
    class="fixed bottom-24 right-4 z-[70] inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-black px-4 text-[10px] uppercase tracking-[0.32em] text-white/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    :aria-expanded="chatStore.isOpen"
    aria-controls="spygrocery-chat-panel"
    @click="onOpenToggle"
  >
    <MessageCircle class="h-4 w-4" />
    <span>AI Chat</span>
  </button>

  <section
    id="spygrocery-chat-panel"
    :class="[
      'fixed bottom-40 right-4 z-[70] flex h-[70vh] w-[calc(100%-2rem)] max-w-md flex-col rounded-2xl border border-white/15 bg-black/95 shadow-[0_30px_80px_rgba(0,0,0,0.6)] transition duration-200 sm:bottom-24',
      chatStore.isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
    ]"
  >
    <header class="flex items-center justify-between border-b border-white/10 px-4 py-3">
      <div>
        <p class="text-[9px] uppercase tracking-[0.32em] text-white/60">SpyGrocery</p>
        <h3 class="font-display text-lg font-semibold italic">Assistant</h3>
      </div>
      <button
        class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        aria-label="Close chat"
        @click="chatStore.setOpen(false)"
      >
        <X class="h-4 w-4" />
      </button>
    </header>

    <div ref="messagesContainer" class="flex-1 space-y-3 overflow-y-auto p-4">
      <div v-if="!hasMessages" class="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
        Demande une recette ou une liste de courses. Exemple: "J'ai besoin d'un plan repas budget pour 4 jours".
      </div>

      <article
        v-for="message in chatStore.messages"
        :key="message.id"
        :class="[
          'max-w-[90%] rounded-2xl border px-3 py-2 text-sm',
          message.role === 'user'
            ? 'ml-auto border-white/25 bg-white/10 text-white'
            : 'border-white/10 bg-white/5 text-white/90'
        ]"
      >
        <p v-if="extractText(message)">{{ extractText(message) }}</p>

        <div v-if="extractToolParts(message).length" class="mt-2 flex flex-wrap gap-2">
          <span
            v-for="(part, idx) in extractToolParts(message)"
            :key="`${message.id}-${idx}`"
            class="rounded-full border border-white/20 px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-white/70"
          >
            {{ formatToolName(part.type) }}
          </span>
        </div>
      </article>
    </div>

    <div class="space-y-2 border-t border-white/10 p-3">
      <p v-if="chatStore.error" class="text-xs text-red-300/90">{{ chatStore.error }}</p>

      <form class="flex items-end gap-2" @submit.prevent="onSubmit">
        <textarea
          v-model="input"
          rows="2"
          placeholder="Ask SpyGrocery AI..."
          class="min-h-12 flex-1 resize-none rounded-xl border border-white/15 bg-black px-3 py-2 text-sm text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          :disabled="chatStore.pending"
        />

        <button
          type="submit"
          :disabled="isDisabled"
          class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          <Loader2 v-if="chatStore.pending" class="h-4 w-4 animate-spin" />
          <Send v-else class="h-4 w-4" />
        </button>
      </form>

      <div class="flex items-center justify-between">
        <button
          class="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[9px] uppercase tracking-[0.28em] text-white/75 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!hasMessages || chatStore.pending"
          @click="onRetry"
        >
          <RotateCcw class="h-3 w-3" />
          Retry
        </button>

        <button
          class="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[9px] uppercase tracking-[0.28em] text-white/75 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!chatStore.pending"
          @click="onStop"
        >
          <Square class="h-3 w-3" />
          Stop
        </button>
      </div>
    </div>
  </section>
</template>
