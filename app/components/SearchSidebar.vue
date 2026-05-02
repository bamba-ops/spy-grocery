<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { useSearchStore } from '~/stores/search'

const searchStore = useSearchStore()
</script>

<template>
  <div class="rounded-[28px] border border-white/10 bg-black/70 p-4 sm:p-5">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.45fr)_repeat(3,minmax(0,1fr))] xl:items-end">
      <label class="block sm:col-span-2 xl:col-span-1">
        <span class="px-1 text-[10px] uppercase tracking-[0.32em] text-white/55">Recherche</span>
        <div class="mt-2 flex h-12 items-center gap-3 rounded-full border border-white/15 bg-black/80 px-4 text-white/70 xl:h-10 xl:px-3">
          <Search class="h-4 w-4 shrink-0 text-white/60" />
          <input
            :value="searchStore.searchInput"
            type="text"
            placeholder="Rechercher un produit en special"
            class="h-full w-full bg-transparent text-base tracking-[0.02em] text-white placeholder:text-white/35 focus:outline-none"
            @input="searchStore.setSearchInput(($event.target as HTMLInputElement).value)"
          />
        </div>
      </label>

      <label class="block">
        <span class="px-1 text-[10px] uppercase tracking-[0.32em] text-white/55">Tri</span>
        <select
          :value="searchStore.sortBy"
          class="mt-2 h-12 w-full rounded-full border border-white/15 bg-black/80 px-4 text-base text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black xl:h-10 xl:px-3 xl:text-[11px] xl:uppercase xl:tracking-[0.22em]"
          @change="searchStore.setSortBy(($event.target as HTMLSelectElement).value as 'relevance' | 'price_asc' | 'price_desc' | 'title_asc' | 'recent')"
        >
          <option value="relevance">Pertinence</option>
          <option value="price_asc">Prix : plus bas</option>
          <option value="price_desc">Prix : plus haut</option>
          <option value="title_asc">Titre : A-Z</option>
          <option value="recent">Plus recent</option>
        </select>
      </label>

      <label class="block">
        <span class="px-1 text-[10px] uppercase tracking-[0.32em] text-white/55">Disponibilite</span>
        <select
          :value="searchStore.availability"
          class="mt-2 h-12 w-full rounded-full border border-white/15 bg-black/80 px-4 text-base text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black xl:h-10 xl:px-3 xl:text-[11px] xl:uppercase xl:tracking-[0.22em]"
          @change="searchStore.setAvailability(($event.target as HTMLSelectElement).value as 'active' | 'inactive' | 'all')"
        >
          <option value="active">Promos en cours</option>
          <option value="all">Toutes</option>
          <option value="inactive">Non valides</option>
        </select>
      </label>

      <label class="block">
        <span class="px-1 text-[10px] uppercase tracking-[0.32em] text-white/55">Magasin</span>
        <select
          :value="searchStore.selectedStoreId"
          class="mt-2 h-12 w-full rounded-full border border-white/15 bg-black/80 px-4 text-base text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black xl:h-10 xl:px-3 xl:text-[11px] xl:uppercase xl:tracking-[0.22em]"
          @change="searchStore.setStoreFilter(($event.target as HTMLSelectElement).value)"
        >
          <option value="all">Tous les magasins</option>
          <option v-for="store in searchStore.stores" :key="store.id" :value="store.id">
            {{ store.name }}
          </option>
        </select>
      </label>
    </div>

    <div class="mt-4 flex items-center justify-end border-t border-white/10 pt-4">
      <button
        class="inline-flex h-10 items-center justify-center rounded-full border border-white/15 px-4 text-[10px] uppercase tracking-[0.3em] text-white/72 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        @click="searchStore.setFiltersCleared()"
      >
        Effacer les filtres
      </button>
    </div>
  </div>
</template>
