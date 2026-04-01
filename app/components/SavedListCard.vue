<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import type { ListsProduct } from '#shared/types/lists'
import { useListsStore } from '~/stores/lists';

const listsStore = useListsStore()

const props = defineProps<{
  list: ListsProduct
}>()

const emit = defineEmits<{
  (e: 'open', name: string): void
  (e: 'delete', name: string): void
}>()


const onOpen = () => {
  emit('open', props.list.name)
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    onOpen()
  }
}

const itemCount = computed(() => {
  return props.list.items.reduce((acc, it) => acc + (it.quantity || 0), 0)
})

const totalValue = computed(() => {
  return props.list.items.reduce((acc, it) => {
    const price = it.product.price_num ?? 0
    return acc + price * it.quantity
  }, 0)
})

const lastEditedLabel = computed(() => {
  const d = new Date(props.list.updatedAt)
  if (Number.isNaN(d.getTime())) return 'LAST EDITED'
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const day = String(d.getDate()).padStart(2, '0')
  return `LAST EDITED ${month} ${day}`
})

const avatarUrls = computed(() => {
  const urls = props.list.items
    .map(i => i.product.image_url)
    .filter((u): u is string => Boolean(u && u.trim() !== ''))

  const seen = new Set<string>()
  const unique: string[] = []
  for (const u of urls) {
    if (seen.has(u)) continue
    seen.add(u)
    unique.push(u)
  }

  return unique
})

const visibleAvatars = computed(() => avatarUrls.value.slice(0, 2))
const overflowCount = computed(() => Math.max(0, avatarUrls.value.length - visibleAvatars.value.length))
const deleteMessage = computed(() => `This will permanently delete "${props.list.name}".`)
</script>

<template>
  <div
    class="group relative flex h-[260px] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-[36px] border border-white/10 bg-white/5 p-7 text-left shadow-[0_30px_80px_rgba(0,0,0,0.55)] transition hover:border-white/15"
    role="button"
    tabindex="0"
    @click="onOpen"
    @keydown="onKeydown"
  >
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_400px_at_30%_20%,rgba(255,255,255,0.08),transparent_55%),radial-gradient(700px_420px_at_80%_80%,rgba(255,255,255,0.05),transparent_60%)] opacity-90"></div>

    <button
      type="button"
      class="absolute right-5 top-5 z-20 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/60 opacity-0 transition hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black group-hover:opacity-100"
      aria-label="Delete list"
      @click.stop="listsStore.isDeleteConfirmOpen = true"
    >
      <Trash2 class="h-4 w-4" />
    </button>

    <div class="relative">
      <p class="text-[10px] uppercase tracking-[0.35em] text-white/40">{{ lastEditedLabel }}</p>
      <h3 class="mt-6 font-display text-4xl font-semibold italic tracking-tight">
        {{ list.name }}
      </h3>
      <div class="mt-4 inline-flex rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white/70">
        {{ itemCount }} items
      </div>
    </div>

    <div class="relative flex items-end justify-between gap-6">
      <div class="inline-flex items-center rounded-full border border-white/10 bg-black/25 px-3 py-2">
        <div class="flex items-center">
          <div class="flex -space-x-2">
            <div
              v-for="(src, idx) in visibleAvatars"
              :key="src + idx"
              class="h-9 w-9 overflow-hidden rounded-full border border-white/15 bg-white/10"
            >
              <img :src="src" alt="" class="h-full w-full object-cover grayscale brightness-95" loading="lazy" />
            </div>
          </div>
          <div
            v-if="overflowCount > 0"
            class="ml-2 inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 px-2 text-[10px] uppercase tracking-[0.3em] text-white/70"
          >
            +{{ overflowCount }}
          </div>
          <div v-if="visibleAvatars.length === 0" class="text-[10px] uppercase tracking-[0.3em] text-white/50">No images</div>
        </div>
      </div>

      <div class="text-right">
        <div class="text-[10px] uppercase tracking-[0.35em] text-white/40">Est. total</div>
        <div class="mt-2 font-display text-4xl font-semibold italic tracking-tight">
          ${{ totalValue.toFixed(2) }}
        </div>
      </div>
    </div>
  </div>

  <ConfirmActionModal
    :open="listsStore.isDeleteConfirmOpen"
    eyebrow="Delete list"
    title="Delete this list?"
    :message="deleteMessage"
    confirm-text="Delete"
    cancel-text="Cancel"
    :destructive="true"
    @close="listsStore.isDeleteConfirmOpen = false"
    @confirm="emit('delete', props.list.name); listsStore.isDeleteConfirmOpen = false"
  />
</template>
