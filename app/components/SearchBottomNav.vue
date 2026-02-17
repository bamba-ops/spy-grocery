<script setup lang="ts">
import { Home, Search, ShoppingBag, List } from 'lucide-vue-next'
import { useListsStore } from '~/stores/lists'

const lists = useListsStore()

const route = useRoute()
const isHome = computed(() => route.path === '/')
const isSearch = computed(() => route.path.startsWith('/search'))
const isLists = computed(() => route.path.startsWith('/lists'))
</script>

<template>
  <div class="fixed inset-x-0 bottom-2 z-40 flex justify-center px-4">
    <nav
      class="flex w-fit items-center gap-5 rounded-full border border-white/15 bg-black/80 px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur"
      aria-label="Primary"
    >
      <NuxtLink
        to="/"
        :class="[
          'inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          isHome ? 'bg-white text-black' : 'text-white/80'
        ]"
        aria-label="Home"
      >
        <Home class="h-5 w-5" />
      </NuxtLink>

      <NuxtLink
        to="/search"
        :class="[
          'inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          isSearch ? 'bg-white text-black' : 'text-white/80 bg-transparent hover:bg-white/10'
        ]"
        aria-label="Search"
      >
        <Search class="h-5 w-5" />
      </NuxtLink>

      <NuxtLink
        to="/lists"
        :class="[
          'inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          isLists ? 'bg-white text-black' : 'text-white/80'
        ]"
        aria-label="Lists"
      >
        <List class="h-5 w-5" />
      </NuxtLink>

      <button
        class="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        @click="lists.toggleDrawer()"
        aria-label="Compare list"
      >
        <ShoppingBag class="h-5 w-5" />
        <span
          v-if="lists.itemCount > 0"
          class="absolute -right-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white text-[10px] font-semibold text-black"
        >
          {{ lists.itemCount }}
        </span>
      </button>
    </nav>
  </div>
</template>
