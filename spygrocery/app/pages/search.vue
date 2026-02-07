<script setup lang="ts">
import {SlidersHorizontal, ShoppingBag } from 'lucide-vue-next'
import { useShoppingListStore } from '~/stores/shoppingList'

const store = useShoppingListStore()
const showFilters = ref(false)

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const closeFilters = () => {
  showFilters.value = false
}

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
      href: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;1,700;1,800&display=swap'
    }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-[#F5F5DC] font-['Barlow_Condensed']">
    <AppNavBar />
    
    <main class="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
      <!-- Mobile Filter Button -->
      <button
        class="mb-4 flex w-full items-center justify-center gap-2 border-4 border-black bg-[#39FF14] px-4 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[4px_4px_0_#000] transition hover:shadow-[6px_6px_0_#000] lg:hidden"
        @click="toggleFilters"
      >
        <SlidersHorizontal :size="16" :stroke-width="3" />
        {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
      </button>

      <div class="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <!-- Sidebar - Desktop & Mobile Drawer -->
        <aside 
          :class="[
            'w-full lg:w-64 lg:shrink-0',
            showFilters ? 'block' : 'hidden lg:block'
          ]"
        >
          <SearchSidebar @close="closeFilters" />
        </aside>

        <!-- Main Content -->
        <div class="flex-1">
          <SearchResults />
        </div>
      </div>
    </main>

    <!-- Shopping List Drawer -->
    <ShoppingListDrawer />

    <!-- Floating List Button (Mobile/Desktop) -->
    <button
      v-if="!store.isOpen && store.itemCount > 0"
      @click="store.toggleDrawer()"
      :class="[
        'fixed bottom-6 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-[#39FF14] shadow-[4px_4px_0_#000] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_#000] sm:bottom-8 sm:right-8',
        store.justAdded ? 'scale-125 -rotate-6 shadow-[8px_8px_0_#000] bg-white' : ''
      ]"
    >
      <div class="relative">
        <ShoppingBag :size="28" :stroke-width="3" />
        <span class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-white text-xs font-black">
          {{ store.itemCount }}
        </span>
      </div>
    </button>

    <AppFooter />
  </div>
</template>
