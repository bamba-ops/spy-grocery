<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { useShoppingListStore } from '~/stores/shoppingList'

const store = useShoppingListStore()

useHead({
  title: 'Search Products — SpyGrocery',
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Manrope:wght@400;500;600&display=swap'
    }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-black font-['Manrope'] text-white">
    <header class="border-b border-white/10">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div class="flex items-center gap-3">
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/20">
            <Search class="h-4 w-4" />
          </span>
          <span class="font-['Cormorant_Garamond'] text-xl font-semibold italic tracking-tight">Spygrocery</span>
        </div>
        <div class="hidden items-center gap-6 text-[10px] uppercase tracking-[0.35em] text-white/70 sm:flex">
          <button
            class="rounded-full border border-white/20 bg-white px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click="store.toggleDrawer()"
          >
            View Compare List
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section>
        <SearchResults />
      </section>

      <aside class="hidden lg:block">
        <SearchListPanel />
      </aside>
    </main>

    <ShoppingListDrawer />

    <button
      class="fixed bottom-6 right-6 z-30 inline-flex items-center justify-center rounded-full border border-white/20 bg-white px-4 py-3 text-[10px] uppercase tracking-[0.35em] text-black shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black lg:hidden"
      @click="store.toggleDrawer()"
    >
      Compare List ({{ store.itemCount }})
    </button>
  </div>
</template>
