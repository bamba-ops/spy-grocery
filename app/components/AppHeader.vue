<script setup lang="ts">
import { Menu, X } from 'lucide-vue-next'

const isOpen = ref(false)

const navItems = [
  { label: 'Process', href: '#process' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' }
]

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}
</script>

<template>
  <header class="border-b border-white/10 bg-black text-white">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
      <div class="flex items-center gap-3">
        <span class="text-xs font-semibold uppercase tracking-[0.35em] text-white sm:text-sm">Spygrocery</span>
      </div>

      <nav class="hidden items-center gap-8 text-[11px] uppercase tracking-[0.35em] text-white/70 md:flex">
        <a
          v-for="item in navItems"
          :key="item.label"
          :href="item.href"
          class="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="flex items-center gap-3">
        <button class="hidden rounded-full border border-white/20 bg-white px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:inline-flex">
          Compare Local Prices
        </button>

        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:hidden"
          type="button"
          :aria-expanded="isOpen"
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
          @click="toggleMenu"
        >
          <Menu v-if="!isOpen" class="h-4 w-4" />
          <X v-else class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div v-if="isOpen" id="mobile-menu" class="border-t border-white/10 bg-black px-4 pb-6 md:hidden">
      <div class="flex flex-col gap-4 py-4 text-[10px] uppercase tracking-[0.35em] text-white/70">
        <a
          v-for="item in navItems"
          :key="item.label"
          :href="item.href"
          class="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          @click="closeMenu"
        >
          {{ item.label }}
        </a>

        <button
          class="mt-2 w-full rounded-full border border-white/20 bg-white px-4 py-3 text-[10px] uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Compare Local Prices
        </button>
      </div>
    </div>
  </header>
</template>
