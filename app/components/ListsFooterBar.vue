<script setup lang="ts">
import { Settings, User } from 'lucide-vue-next'

const year = new Date().getFullYear()
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-0 z-10 hidden lg:block">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 pb-6 pt-6 text-[10px] uppercase tracking-[0.35em] text-white/40 sm:px-6">
      <div class="pointer-events-auto">SpyGrocery © {{ year }}</div>

      <div class="pointer-events-auto flex items-center gap-4">
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label="Settings"
        >
          <Settings class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label="Account"
        >
          <User class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
