<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { useSearchStore } from '~/stores/search'

const searchStore = useSearchStore()
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-black/70 px-4 py-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div class="flex h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-white/70">
        <Search class="h-4 w-4 shrink-0 text-white/70" />
        <input
          :value="searchStore.searchInput"
          type="text"
          placeholder="Rechercher un produit en special"
          class="h-full w-full bg-transparent text-[10px] uppercase tracking-[0.3em] text-white placeholder:text-white/40 focus:outline-none"
          @input="searchStore.setSearchInput(($event.target as HTMLInputElement).value)"
        />
      </div>
      <select
        :value="searchStore.sortBy"
        class="h-10 rounded-full border border-white/15 bg-black px-3 text-[10px] uppercase tracking-[0.3em] text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        @change="searchStore.setSortBy(($event.target as HTMLSelectElement).value as 'relevance' | 'price_asc' | 'price_desc' | 'title_asc' | 'recent')"
      >
        <option value="relevance">Pertinence</option>
        <option value="price_asc">Prix : plus bas</option>
        <option value="price_desc">Prix : plus haut</option>
        <option value="title_asc">Titre : A-Z</option>
        <option value="recent">Plus recent</option>
      </select>

      <select
        :value="searchStore.availability"
        class="h-10 rounded-full border border-white/15 bg-black px-3 text-[10px] uppercase tracking-[0.3em] text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        @change="searchStore.setAvailability(($event.target as HTMLSelectElement).value as 'active' | 'inactive' | 'all')"
      >
        <option value="active">Promos en cours</option>
        <option value="all">Toutes</option>
        <option value="inactive">Non valides</option>
      </select>

      <select
        :value="searchStore.selectedStoreId"
        class="h-10 rounded-full border border-white/15 bg-black px-3 text-[10px] uppercase tracking-[0.3em] text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        @change="searchStore.setStoreFilter(($event.target as HTMLSelectElement).value)"
      >
        <option value="all">Magasin : tous</option>
        <option v-for="store in searchStore.stores" :key="store.id" :value="store.id">
          {{ store.name }}
        </option>
      </select>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/60">
      <button
        class="ml-2 text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        @click="searchStore.setFiltersCleared()"
      >
        Effacer tout
      </button>
    </div>
  </div>
</template>
