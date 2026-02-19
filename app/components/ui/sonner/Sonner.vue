<script setup lang="ts">
import { Toaster } from 'vue-sonner'

const toastOptions = {
  style: {
    background: '#000000',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  class: 'font-sans',
  classes: {
    toast: 'rounded-2xl border border-white/20 bg-black text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)]',
    title: 'font-display text-base font-semibold italic tracking-tight text-white',
    description: 'text-xs uppercase tracking-[0.24em] text-white/80',
    actionButton: 'rounded-full border border-white/25 bg-white text-black hover:bg-white/90',
    cancelButton: 'rounded-full border border-white/25 bg-black text-white hover:bg-white/10',
    closeButton: 'border border-white/25 bg-black text-white hover:bg-white/10'
  }
}
</script>

<template>
  <Toaster
    position="top-center"
    theme="dark"
    :toast-options="toastOptions"
    :close-button="true"
    :rich-colors="false"
    :visible-toasts="3"
    :offset="20"
    :mobile-offset="20"
  />
</template>
