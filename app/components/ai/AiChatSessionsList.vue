<script setup lang="ts">
import { Loader2, MessageSquarePlus, RefreshCw, Trash2 } from 'lucide-vue-next'
import type { ChatSession } from '#shared/types/ai-chat'

const props = withDefaults(defineProps<{
  sessions: ChatSession[]
  currentChatId: string | null
  isLoading: boolean
  isHydrating: boolean
  error: string | null
  disabled?: boolean
}>(), {
  disabled: false
})

defineEmits<{
  (event: 'open', id: string): void
  (event: 'create'): void
  (event: 'delete', id: string): void
  (event: 'retry'): void
}>()

const getSessionTitle = (session: ChatSession, index: number) => {
  const title = session.title?.trim()

  if (!title) {
    return `Conversation ${index + 1}`
  }

  return title
}

const getUpdatedAtLabel = (value: string) => {
  const timestamp = Date.parse(value)

  if (Number.isNaN(timestamp)) {
    return 'recently'
  }

  const now = Date.now()
  const elapsedMinutes = Math.max(0, Math.round((now - timestamp) / 60000))

  if (elapsedMinutes < 1) {
    return 'just now'
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`
  }

  const elapsedHours = Math.round(elapsedMinutes / 60)

  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`
  }

  const elapsedDays = Math.round(elapsedHours / 24)

  if (elapsedDays < 7) {
    return `${elapsedDays}d ago`
  }

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <section class="flex h-full flex-col px-5 py-4 sm:px-6">
    <div class="mb-3 flex items-center justify-between gap-3">
      <p class="text-[10px] uppercase tracking-[0.35em] text-white/55">Recent chats</p>

      <button
        type="button"
        class="inline-flex h-9 items-center gap-2 rounded-full border border-white/20 bg-white px-3 text-[10px] uppercase tracking-[0.3em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="disabled || isHydrating"
        @click="$emit('create')"
      >
        <MessageSquarePlus class="h-3.5 w-3.5" />
        New chat
      </button>
    </div>

    <p v-if="isHydrating" class="mb-2 text-[10px] uppercase tracking-[0.3em] text-white/60">Opening conversation...</p>

    <div v-if="isLoading" class="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/70">
      <span class="inline-flex items-center gap-2">
        <Loader2 class="h-3.5 w-3.5 animate-spin" />
        Loading conversations...
      </span>
    </div>

    <div v-else-if="error" class="rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-sm text-white/75">
      <p>{{ error }}</p>
      <button
        type="button"
        class="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        @click="$emit('retry')"
      >
        <RefreshCw class="h-3 w-3" />
        Retry
      </button>
    </div>

    <p
      v-else-if="sessions.length === 0"
      class="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/70"
    >
      No conversations yet. Start one with "New chat".
    </p>

    <ul v-else class="flex-1 space-y-2 overflow-y-auto pr-1">
      <li
        v-for="(session, index) in sessions"
        :key="session.id"
        class="flex items-center gap-2"
      >
        <button
          type="button"
          class="min-w-0 flex-1 rounded-2xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50"
          :class="currentChatId === session.id
            ? 'border-white/30 bg-white text-black shadow-[0_10px_30px_rgba(0,0,0,0.45)]'
            : 'border-white/10 bg-white/5 text-white/85 hover:bg-white/10'"
          :disabled="disabled || isHydrating"
          @click="$emit('open', session.id)"
        >
          <p class="truncate text-sm font-semibold italic">{{ getSessionTitle(session, index) }}</p>
          <p class="mt-1 text-[10px] uppercase tracking-[0.3em]" :class="currentChatId === session.id ? 'text-black/70' : 'text-white/60'">
            {{ getUpdatedAtLabel(session.updated_at) }}
          </p>
        </button>

        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="disabled || isHydrating"
          aria-label="Delete conversation"
          @click="$emit('delete', session.id)"
        >
          <Trash2 class="h-3.5 w-3.5" />
        </button>
      </li>
    </ul>
  </section>
</template>
