<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useSearchStore } from '~/stores/search'
import { useStoresStore } from '~/stores/stores'

const emit = defineEmits(['close'])

const searchStore = useSearchStore()
const storesStore = useStoresStore()

// Load stores on mount
onMounted(async () => {
  await storesStore.loadStores()
  // Set selected stores in search store
  searchStore.setSelectedStores(storesStore.selectedStoreIds.join(','))
  // Trigger initial search if not already done
  if (searchStore.results.length === 0 && !searchStore.loading) {
    searchStore.search()
  }
})

// Watch sort changes
watch(() => searchStore.sortBy, () => {
  searchStore.search()
})

// Handle store toggle
const handleStoreToggle = (storeId: string) => {
  storesStore.toggleStore(storeId)
  // Update search store with selected stores
  searchStore.setSelectedStores(storesStore.selectedStoreIds.join(','))
  searchStore.search()
}

// Sync selected stores to search store when stores are loaded
watch(() => storesStore.selectedStoreIds, (newIds) => {
  searchStore.setSelectedStores(newIds.join(','))
}, { deep: true })

watch(() => searchStore.showPromosOnly, () => {
  searchStore.search()
})
</script>

<template>
  <div class="w-full border-4 border-black bg-white shadow-[6px_6px_0_#000] lg:sticky lg:top-4">
    <!-- Mobile Close Button Header -->
    <div class="border-b-4 border-black bg-[#F5F5DC] p-4 lg:hidden">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black uppercase italic tracking-tighter text-black">Filters</h2>
        <button 
          @click="emit('close')"
          class="flex h-10 w-10 items-center justify-center border-2 border-black bg-white transition hover:bg-[#39FF14]"
          aria-label="Close filters"
        >
          <X :size="20" :stroke-width="3" />
        </button>
      </div>
    </div>

    <!-- Desktop Header -->
    <div class="hidden border-b-4 border-black bg-[#F5F5DC] p-4 lg:block">
      <h2 class="text-base font-black uppercase italic tracking-tighter text-black">All Filters</h2>
    </div>

    <!-- Filter Content -->
    <div class="space-y-6 p-5 sm:p-6">
      <!-- Sort Results -->
      <div>
        <h3 class="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-black lg:text-xs">
          <span class="h-1 w-6 bg-[#39FF14]"></span>
          Sort Results
        </h3>
        <select 
          v-model="searchStore.sortBy"
          class="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold uppercase tracking-wide text-black transition focus:outline-none focus:ring-2 focus:ring-[#39FF14] focus:ring-offset-2 lg:px-3 lg:py-2 lg:text-xs"
        >
          <option value="price-low">💰 Price: Low to High</option>
          <option value="price-high">💸 Price: High to Low</option>
          <option value="name">🔤 Name: A-Z</option>
        </select>
      </div>

      <!-- Divider -->
      <div class="border-t-2 border-dashed border-black/20"></div>

      <!-- Quick Filters -->
      <div>
        <h3 class="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-black lg:mb-3 lg:text-xs">
          <span class="h-1 w-6 bg-[#39FF14]"></span>
          Quick Filters
        </h3>
        <div class="space-y-3 lg:space-y-2">
          <label class="group flex cursor-pointer items-center gap-3 rounded border-2 border-transparent p-2 transition hover:border-black hover:bg-[#F5F5DC]">
            <input 
              v-model="searchStore.showPromosOnly"
              type="checkbox" 
              class="h-5 w-5 border-2 border-black accent-[#39FF14] lg:h-4 lg:w-4"
              @change="searchStore.search()"
            />
            <span class="text-sm font-bold uppercase tracking-wide text-black lg:text-xs">🔥 Promotions Only</span>
          </label>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t-2 border-dashed border-black/20"></div>

      <!-- Stores -->
      <div>
        <h3 class="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-black lg:mb-3 lg:text-xs">
          <span class="h-1 w-6 bg-[#39FF14]"></span>
          Stores
        </h3>
        
        <div v-if="storesStore.stores.length === 0" class="text-center text-sm text-gray-500">
          Loading stores...
        </div>
        
        <div v-else class="space-y-3 lg:space-y-2">
          <label 
            v-for="store in storesStore.storesWithSelection" 
            :key="store.id"
            class="group flex cursor-pointer items-center gap-3 rounded border-2 border-transparent p-2 transition hover:border-black hover:bg-[#F5F5DC]"
          >
            <input 
              :checked="store.selected"
              type="checkbox" 
              class="h-5 w-5 border-2 border-black accent-[#39FF14] lg:h-4 lg:w-4"
              @change="handleStoreToggle(store.id)"
            />
            <span class="text-sm font-bold uppercase tracking-wide text-black lg:text-xs">
              {{ store.name }}
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
