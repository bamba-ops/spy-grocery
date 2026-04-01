<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title?: string
  message?: string
  eyebrow?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const onClose = () => {
  emit('close')
}

const onConfirm = () => {
  emit('confirm')
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
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">{{ props.eyebrow ?? 'Confirmer l\'action' }}</p>
          <h3 class="mt-2 font-display text-2xl font-semibold italic">{{ props.title ?? 'Confirmez-vous cette action ?' }}</h3>
          <p class="mt-3 text-sm text-white/75">{{ props.message ?? 'Veuillez confirmer cette action.' }}</p>

          <div class="mt-6 flex items-center justify-end gap-3">
            <button
              class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              @click="onClose"
            >
              {{ props.cancelText ?? 'Annuler' }}
            </button>
            <button
              :class="[
                'inline-flex h-11 items-center justify-center rounded-full px-5 text-[10px] uppercase tracking-[0.35em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                props.destructive ? 'bg-white text-black hover:bg-white/90' : 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
              ]"
              @click="onConfirm"
            >
              {{ props.confirmText ?? 'Confirmer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
