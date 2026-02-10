<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
import { useStoresStore } from '~/stores/stores'

const searchStore = useSearchStore()
const storesStore = useStoresStore()
const searchInput = ref(searchStore.query)

onMounted(async () => {
  await storesStore.loadStores()
  searchStore.setSelectedStores(storesStore.getAllStoresIds.join(','))
  if (searchStore.results.length === 0 && !searchStore.loading) {
    searchStore.search()
  }
})

const clearAll = () => {
  searchStore.showPromosOnly = false
  storesStore.selectAll()
  searchStore.setSelectedStores(storesStore.getAllStoresIds.join(','))
  searchStore.search()
}

watch(() => searchStore.sortBy, () => {
  searchStore.search()
})

watch(() => searchStore.selectedStores, () => {
  searchStore.search()
})

watch(() => storesStore.selectedStoreIds, (newIds) => {
  searchStore.setSelectedStores(newIds.join(','))
}, { deep: true })

watch(searchInput, (value) => {
  searchStore.setQuery(value)
})
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-black/70 px-4 py-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div class="flex h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-white/70">
        <span class="text-[10px] uppercase tracking-[0.3em]">⌕</span>
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search"
          class="h-full w-full bg-transparent text-[10px] uppercase tracking-[0.3em] text-white placeholder:text-white/40 focus:outline-none"
        />
      </div>
      <select
        v-model="searchStore.sortBy"
        class="h-10 rounded-full border border-white/15 bg-black px-3 text-[10px] uppercase tracking-[0.3em] text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <option value="price-low">Price: Lowest</option>
        <option value="price-high">Price: Highest</option>
        <option value="name">Name: A-Z</option>
      </select>

      <select
        v-model="searchStore.selectedStores"
        class="h-10 rounded-full border border-white/15 bg-black px-3 text-[10px] uppercase tracking-[0.3em] text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <option :value="storesStore.getAllStoresIds.join(',')">Store: All</option>
        <option v-for="store in storesStore.stores" :key="store.id" :value="store.id">
          {{ store.name }}
        </option>
      </select>

      <label class="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-[10px] uppercase tracking-[0.3em] text-white/70">
        <input
          v-model="searchStore.showPromosOnly"
          type="checkbox"
          class="h-3 w-3 border border-white/30 bg-black accent-white"
          @change="searchStore.search()"
        />
        Promos only
      </label>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/60">
      <button
        class="ml-2 text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        @click="clearAll"
      >
        Clear all
      </button>
    </div>
  </div>
</template>
