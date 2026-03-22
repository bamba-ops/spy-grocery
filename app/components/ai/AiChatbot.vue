<script setup lang="ts">
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import { Loader2, Send, X } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
}>()

const input = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const messagesContainerRef = ref<HTMLElement | null>(null)
const quickPrompts = [
  'Montre-moi les 5 produits les moins chers (titre, magasin, prix).',
  'Y a-t-il des produits chez Costco ? Donne quelques exemples.',
  'Quelles marques apparaissent le plus souvent ?',
  'Dans quels magasins les bananes sont les moins chères ?',
  "Donne 5 produits dont le titre contient 'organic'."
]

const chat = new Chat({
  transport: new DefaultChatTransport({
    api: '/api/ai/chat'
  })
})


const isBusy = computed(() => chat.status === 'submitted' || chat.status === 'streaming')
const canSend = computed(() => input.value.trim().length > 0 && !isBusy.value)

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

const hasTextPart = (message: any) =>
  message.parts.some((part: any) => part.type === 'text' && typeof part.text === 'string' && part.text.trim().length > 0)

const hasSafeTextPart = (message: any) =>
  message.parts.some((part: any) =>
    part.type === 'text' &&
    typeof part.text === 'string' &&
    part.text.trim().length > 0 &&
    !isUnsafeAssistantText(part.text)
  )

const visibleMessages = computed(() => {
  return chat.messages.filter((message) => {
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

  const lastMessage = chat.messages.at(-1)
  if (!lastMessage || lastMessage.role !== 'assistant') {
    return true
  }

  return !hasTextPart(lastMessage)
})

const showSanitizedLeakNotice = computed(() => {
  if (isBusy.value || !!chat.error) {
    return false
  }

  const lastMessage = chat.messages.at(-1)
  if (!lastMessage || lastMessage.role !== 'assistant') {
    return false
  }

  return hasTextPart(lastMessage) && !hasSafeTextPart(lastMessage)
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

const setSubmitMessage = async () => {
  const text = input.value.trim()
  if (!text || isBusy.value) {
    return
  }

  input.value = ''
  await chat.sendMessage({ text })
}

const setQuickPrompt = async (prompt: string) => {
  if (!prompt || isBusy.value) {
    return
  }

  await chat.sendMessage({ text: prompt })
}

watch(
  () => props.open,
  (open) => {
    if (!open) {
      return
    }

    nextTick(() => {
      inputRef.value?.focus()
      scrollToBottom()
    })
  }
)

watch(messageKey, () => {
  nextTick(scrollToBottom)
})

watch(
  () => chat.status,
  () => {
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
        <div>
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/55">Spy AI</p>
          <h2 class="font-display text-3xl italic tracking-tight text-white sm:text-4xl">Spy Assistant</h2>
        </div>
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label="Close AI chat"
          @click="setClosePanel"
        >
          <X class="h-4 w-4" />
        </button>
      </header>

      <div ref="messagesContainerRef" class="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
        <template v-if="visibleMessages.length === 0">
          <div>
            <p class="mb-2 text-[10px] uppercase tracking-[0.35em] text-white/55">Spy AI</p>
            <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p class="mb-3 text-sm leading-relaxed text-white/90 sm:text-base">
                Prompts rapides
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(prompt, index) in quickPrompts"
                  :key="`quick-prompt-${index}`"
                  type="button"
                  class="rounded-full border border-white/20 bg-black/60 px-3 py-2 text-left text-xs text-white/90 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                  :disabled="isBusy"
                  @click="setQuickPrompt(prompt)"
                >
                  {{ prompt }}
                </button>
              </div>
            </div>
          </div>
        </template>

        <div
          v-for="(message, index) in visibleMessages"
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
              <p v-if="part.type === 'text' && !isUnsafeAssistantText(part.text)" class="whitespace-pre-wrap">
                {{ part.text }}
              </p>
            </template>
          </div>
        </div>

        <div v-if="showThinking" class="flex flex-col items-start">
          <p class="mb-2 text-[10px] uppercase tracking-[0.35em] text-white/55">Spy AI</p>
          <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm sm:text-base">
            <div class="flex items-center gap-2">
              <!--<Loader2 class="h-4 w-4 animate-spin text-white/60" />-->
              <span
                class="bg-[linear-gradient(110deg,rgba(255,255,255,0.35)_20%,rgba(255,255,255,0.95)_45%,rgba(255,255,255,0.35)_70%)] bg-[length:220%_100%] bg-clip-text text-transparent animate-shimmer"
              >
                Thinking...
              </span>
            </div>
          </div>
        </div>

        <div v-if="showSanitizedLeakNotice" class="flex flex-col items-start">
          <p class="mb-2 text-[10px] uppercase tracking-[0.35em] text-white/55">Spy AI</p>
          <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 sm:text-base">
            I could not format that answer correctly. Please try again.
          </div>
        </div>

        <div
          v-if="chat.error"
          class="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white/80"
        >
          Something went wrong.
        </div>
      </div>

      <form
        class="border-t border-white/10 p-4 sm:p-5"
        @submit.prevent="setSubmitMessage"
      >
        <div class="flex items-center gap-2 rounded-full border border-white/15 bg-black/80 px-3 py-2">
          <input
            ref="inputRef"
            v-model="input"
            type="text"
            class="h-10 flex-1 bg-transparent px-2 text-sm text-white placeholder:text-white/35 focus:outline-none sm:text-base"
            placeholder="Ask Spy AI..."
            :disabled="isBusy"
          >

          <button
            type="submit"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white text-black transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!canSend"
            aria-label="Send message"
          >
            <Loader2 v-if="isBusy" class="h-4 w-4 animate-spin" />
            <Send v-else class="h-4 w-4" />
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
