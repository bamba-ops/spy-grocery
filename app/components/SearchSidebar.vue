<script setup lang="ts">
import { useSearchStore } from '~/stores/search'

const searchStore = useSearchStore()
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-black/70 px-4 py-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div class="flex h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-white/70">
        <span class="text-[10px] uppercase tracking-[0.3em]">⌕</span>
        <input
          :value="searchStore.searchInput"
          type="text"
          placeholder="Search"
          class="h-full w-full bg-transparent text-[10px] uppercase tracking-[0.3em] text-white placeholder:text-white/40 focus:outline-none"
          @input="searchStore.setSearchInput(($event.target as HTMLInputElement).value)"
        />
      </div>
      <select
        :value="searchStore.sortBy"
        class="h-10 rounded-full border border-white/15 bg-black px-3 text-[10px] uppercase tracking-[0.3em] text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        @change="searchStore.setSortBy(($event.target as HTMLSelectElement).value as 'price-low' | 'price-high' | 'name')"
      >
        <option value="price-low">Price: Lowest</option>
        <option value="price-high">Price: Highest</option>
        <option value="name">Name: A-Z</option>
      </select>

      <select
        :value="searchStore.selectedStores"
        class="h-10 rounded-full border border-white/15 bg-black px-3 text-[10px] uppercase tracking-[0.3em] text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        @change="searchStore.setStoreFilter(($event.target as HTMLSelectElement).value)"
      >
        <option :value="searchStore.getAllStoreIds.join(',')">Store: All</option>
        <option v-for="store in searchStore.stores" :key="store.id" :value="store.id">
          {{ store.name }}
        </option>
      </select>

      <label class="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-[10px] uppercase tracking-[0.3em] text-white/70">
        <input
          :checked="searchStore.showPromosOnly"
          type="checkbox"
          class="h-3 w-3 border border-white/30 bg-black accent-white"
          @change="searchStore.setPromosOnly(($event.target as HTMLInputElement).checked)"
        />
        Promos only
      </label>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/60">
      <button
        class="ml-2 text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        @click="searchStore.setFiltersCleared()"
      >
        Clear all
      </button>
    </div>
  </div>
</template>
