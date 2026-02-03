<script setup lang="ts">
import { Menu, X } from 'lucide-vue-next'

const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}
</script>

<template>
  <header class="w-full bg-white">
    <nav class="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
      <div class="flex items-center gap-3">
        <div class="flex items-center text-2xl font-black italic tracking-tighter sm:text-3xl">
          <span class="text-black">SPY</span>
          <span class="bg-[#39FF14] px-1 text-black">GROCERY</span>
        </div>
      </div>

      <div class="hidden items-center gap-8 text-xs font-black uppercase tracking-[0.22em] text-black md:flex">
        <NuxtLink class="transition hover:opacity-70" to="#how">How it works</NuxtLink>
        <NuxtLink class="transition hover:opacity-70" to="#price-drops">Price drops</NuxtLink>
        <NuxtLink class="transition hover:opacity-70" to="#wall-of-love">Wall of Love</NuxtLink>
      </div>

      <div class="hidden md:flex">
        <NuxtLink
          class="rounded-full border-4 border-black bg-black px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#39FF14] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/30"
          to="#compare"
        >
          Login
        </NuxtLink>
      </div>

      <button
        class="inline-flex h-11 w-11 items-center justify-center border-4 border-black bg-white text-black md:hidden"
        type="button"
        aria-label="Toggle menu"
        :aria-expanded="isOpen"
        aria-controls="mobile-menu"
        @click="toggleMenu"
      >
        <Menu v-if="!isOpen" class="h-5 w-5" />
        <X v-else class="h-5 w-5" />
      </button>
    </nav>

    <div v-if="isOpen" id="mobile-menu" class="border-t-4 border-black bg-white px-4 pb-6 md:hidden">
      <div class="flex flex-col gap-4 py-4 text-xs font-black uppercase tracking-[0.22em] text-black">
        <NuxtLink class="transition hover:opacity-70" to="#how" @click="closeMenu">
          How it works
        </NuxtLink>
        <NuxtLink class="transition hover:opacity-70" to="#price-drops" @click="closeMenu">
          Price drops
        </NuxtLink>
        <NuxtLink class="transition hover:opacity-70" to="#wall-of-love" @click="closeMenu">
          Wall of Love
        </NuxtLink>
        <NuxtLink
          class="mt-2 inline-flex w-fit rounded-full border-4 border-black bg-black px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#39FF14]"
          to="#compare"
          @click="closeMenu"
        >
          Login
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
