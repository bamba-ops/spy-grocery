<script setup lang="ts">
const props = defineProps<{
  open: boolean
  initialName?: string
  eyebrow?: string
  title?: string
  label?: string
  placeholder?: string
  confirmText?: string
  cancelText?: string
  errorText?: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', name: string): void
}>()

const name = ref(props.initialName ?? '')
const error = ref<string | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const displayError = computed(() => error.value ?? props.errorText ?? null)

watch(name, () => {
  if (error.value) error.value = null
})

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return
    name.value = props.initialName ?? ''
    error.value = null
    await nextTick()
    inputRef.value?.focus()
  }
)

const onClose = () => {
  emit('close')
}

const onSave = () => {
  const trimmed = name.value.trim()
  if (!trimmed) {
    error.value = 'Please enter a list name.'
    inputRef.value?.focus()
    return
  }
  error.value = null
  emit('save', trimmed)
}
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="open" class="fixed inset-0 z-[60]">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="onClose"></div>

      <div class="relative mx-auto flex min-h-full max-w-lg items-center justify-center px-4">
        <div class="w-full rounded-2xl border border-white/10 bg-black p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">{{ props.eyebrow ?? 'Save shopping list' }}</p>
          <h3 class="mt-2 font-display text-2xl font-semibold italic">{{ props.title ?? 'Name your list' }}</h3>

          <div class="mt-5">
            <label class="block text-[10px] uppercase tracking-[0.35em] text-white/60">{{ props.label ?? 'List name' }}</label>
            <input
              ref="inputRef"
              v-model="name"
              type="text"
              :placeholder="props.placeholder ?? 'e.g. Weekend groceries'"
              class="mt-2 w-full rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              @keydown.enter.prevent="onSave"
            />
            <p v-if="displayError" class="mt-2 text-xs text-white/70">{{ displayError }}</p>
          </div>

          <div class="mt-6 flex items-center justify-end gap-3">
            <button
              class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              @click="onClose"
            >
              {{ props.cancelText ?? 'Cancel' }}
            </button>
            <button
              class="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-[10px] uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              @click="onSave"
            >
              {{ props.confirmText ?? 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
