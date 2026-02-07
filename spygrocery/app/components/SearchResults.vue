<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { Search } from 'lucide-vue-next'
import { useShoppingListStore } from '~/stores/shoppingList'
import { useSearchStore } from '~/stores/search'

const shoppingListStore = useShoppingListStore()
const searchStore = useSearchStore()
const { getImageDisplay } = useProductImage()

const viewMode = ref('grid')
const searchQuery = ref('')

const products = computed(() => searchStore.results)
const isLoading = computed(() => searchStore.loading)
const hasError = computed(() => !!searchStore.error)

// Watch search query input
watch(searchQuery, (newQuery) => {
  searchStore.setQuery(newQuery)
})

// Debounced search
const debouncedSearch = useDebounceFn(() => {
  searchStore.search()
}, 400)

watch(() => searchStore.query, () => {
  debouncedSearch()
})

const resetSearch = () => {
  searchQuery.value = ''
  searchStore.setQuery('')
  searchStore.search()
}

// Format price display
const formatPrice = (price: number | null) => {
  if (price === null) return 'N/A'
  return price.toFixed(2)
}

const formatUnitPrice = (price_un: number | null, unit: string | null) => {
  if (price_un === null) return ''
  const formattedPrice = price_un.toFixed(3)
  const displayUnit = unit || 'unit'
  return `$${formattedPrice}/${displayUnit}`
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 sm:mb-8">
      <h1 class="mb-2 text-4xl font-black italic uppercase leading-none tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
        <span class="text-black">{{ searchQuery || 'GROCERY' }} </span>
        <span class="bg-[#39FF14] px-2 text-black">FINDER</span>
      </h1>
      <p class="text-[10px] font-bold uppercase tracking-wider text-black/60 sm:text-[11px]">
        SCANNING {{ searchStore.total }} PRODUCTS ACROSS LOCAL RETAILERS
      </p>

      <!-- Search Bar -->
      <div class="mt-6 flex max-w-2xl items-center border-4 border-black bg-white shadow-[6px_6px_0_#000] transition-shadow focus-within:shadow-[8px_8px_0_#000]">
        <div class="flex h-12 w-12 items-center justify-center border-r-4 border-black bg-[#39FF14] sm:h-14 sm:w-14">
          <Search :size="24" :stroke-width="3" />
        </div>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="SEARCH PRODUCTS..." 
          class="h-12 w-full bg-transparent px-4 font-bold uppercase tracking-wide text-black placeholder:text-black/40 focus:outline-none sm:h-14"
        />
      </div>
    </div>

    <!-- View Toggle -->
    <div class="mb-4 flex justify-end sm:mb-6">
      <div class="inline-flex border-2 border-black">
        <button 
          :class="viewMode === 'grid' ? 'bg-[#39FF14]' : 'bg-white'"
          class="px-4 py-2 text-xs font-black uppercase tracking-wider text-black transition sm:px-6"
          @click="viewMode = 'grid'"
        >
          Grid
        </button>
        <button 
          :class="viewMode === 'list' ? 'bg-[#39FF14]' : 'bg-white'"
          class="border-l-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider text-black transition sm:px-6"
          @click="viewMode = 'list'"
        >
          List
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="hasError" class="mb-8 border-4 border-black bg-red-50 p-6 text-center">
      <p class="text-sm font-bold text-red-600">{{ searchStore.error }}</p>
      <button 
        @click="searchStore.search()"
        class="mt-4 border-2 border-black bg-black px-6 py-2 text-xs font-black uppercase text-white hover:bg-[#39FF14] hover:text-black"
      >
        Try Again
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="mb-8 grid gap-4 sm:mb-12 sm:grid-cols-2 sm:gap-6">
      <div v-for="i in 6" :key="i" class="animate-pulse border-4 border-black bg-white p-4 shadow-[8px_8px_0_#E5E5DC]">
        <div class="mb-4 h-48 w-full bg-gray-200"></div>
        <div class="space-y-3">
          <div class="h-6 w-3/4 bg-gray-200"></div>
          <div class="h-4 w-1/2 bg-gray-200"></div>
          <div class="mt-4 flex items-center justify-between">
            <div class="h-8 w-24 bg-gray-200"></div>
            <div class="h-8 w-8 bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0" class="mb-12 flex flex-col items-center justify-center border-4 border-black bg-white px-4 py-20 text-center shadow-[8px_8px_0_#E5E5DC]">
      <div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-black bg-[#E5E5DC]">
        <Search :size="48" :stroke-width="2" class="text-black/50" />
      </div>
      <h2 class="mb-2 text-3xl font-black italic uppercase tracking-tighter sm:text-4xl">No Products Found</h2>
      <p class="max-w-md text-sm font-bold uppercase tracking-wide text-gray-500">
        We couldn't find any matches for your search. Try adjusting your filters or search terms.
      </p>
      <button 
        @click="resetSearch"
        class="mt-8 border-2 border-black bg-black px-8 py-3 text-xs font-black uppercase tracking-wider text-[#39FF14] transition hover:-translate-y-1 hover:shadow-[4px_4px_0_#39FF14]"
      >
        Clear Search
      </button>
    </div>

    <!-- Product Grid View -->
    <div v-else-if="viewMode === 'grid'" class="mb-8 grid gap-4 sm:mb-12 sm:grid-cols-2 sm:gap-6">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="relative border-4 border-black bg-white shadow-[6px_6px_0_#000]"
      >
        <!-- Product Image Section -->
        <div class="relative aspect-[4/3] border-b-4 border-black bg-[#E5E5DC] p-4 sm:p-6">
          <!-- Deal Badge -->
          <div 
            v-if="product.is_promo"
            class="absolute right-3 top-3 rounded-full border-2 border-black bg-[#39FF14] px-2 py-0.5 text-[9px] font-black uppercase text-black shadow-[2px_2px_0_#000] sm:right-4 sm:top-4 sm:px-3 sm:py-1 sm:text-[10px]"
          >
            SPY DEAL
          </div>

          <!-- Product Image -->
          <div class="flex h-full items-center justify-center">
            <img 
              v-if="getImageDisplay(product.image_url, product.name).type === 'url'"
              :src="getImageDisplay(product.image_url, product.name).value"
              :alt="product.name"
              loading="lazy"
              class="h-full w-full object-contain"
              @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
            />
            <span 
              v-else
              class="text-5xl sm:text-7xl"
            >
              {{ getImageDisplay(product.image_url, product.name).value }}
            </span>
          </div>
        </div>

        <!-- Product Details -->
        <div class="p-3 sm:p-4">
          <h3 class="mb-1 text-lg font-black italic uppercase leading-tight text-black sm:text-xl">
            {{ product.name }}
          </h3>
          <p class="mb-3 text-[10px] font-semibold uppercase tracking-wide text-black/60 sm:mb-4 sm:text-[11px]">
            {{ product.brand || 'No Brand' }} • {{ product.unit || 'N/A' }}
          </p>

          <!-- Store & Price -->
          <div class="mb-3 sm:mb-4">
            <div class="mb-2 flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-black"></span>
              <span class="text-[10px] font-black uppercase tracking-wide text-black/70 sm:text-xs">
                {{ product.store.name }}
              </span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-black text-black sm:text-3xl">
                ${{ formatPrice(product.price) }}
              </span>
              <span v-if="product.price_un" class="text-[10px] font-bold uppercase tracking-wide text-black/40">
                {{ formatUnitPrice(product.price_un, product.price_unit) }}
              </span>
            </div>
          </div>

          <!-- Add Button -->
          <button 
            @click="shoppingListStore.addItem(product)"
            class="w-full border-2 border-black bg-black py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#39FF14] hover:text-black sm:py-3"
          >
            Buy List Add
          </button>
        </div>
      </div>
    </div>

    <!-- Product List View -->
    <div v-else class="mb-8 space-y-4 sm:mb-12">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="relative flex border-4 border-black bg-white shadow-[6px_6px_0_#000]"
      >
        <!-- Product Image Section -->
        <div class="relative w-32 shrink-0 border-r-4 border-black bg-[#E5E5DC] p-3 sm:w-40 sm:p-4">
          <!-- Deal Badge -->
          <div 
            v-if="product.is_promo"
            class="absolute right-2 top-2 rounded-full border-2 border-black bg-[#39FF14] px-2 py-0.5 text-[8px] font-black uppercase text-black shadow-[2px_2px_0_#000]"
          >
            DEAL
          </div>
          
          <!-- Product Image -->
          <div class="flex h-full items-center justify-center">
            <img 
              v-if="getImageDisplay(product.image_url, product.name).type === 'url'"
              :src="getImageDisplay(product.image_url, product.name).value"
              :alt="product.name"
              loading="lazy"
              class="h-full w-full object-contain"
              @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
            />
            <span v-else class="text-4xl sm:text-5xl">
              {{ getImageDisplay(product.image_url, product.name).value }}
            </span>
          </div>
        </div>

        <!-- Product Info -->
        <div class="flex flex-1 flex-col p-3 sm:p-4">
          <div class="mb-3 flex-1">
            <!-- Product Title -->
            <h3 class="mb-1 text-base font-black italic uppercase leading-tight text-black sm:text-lg">
              {{ product.name }}
            </h3>
            <p class="mb-3 text-[10px] font-semibold uppercase tracking-wide text-black/60">
              {{ product.brand || 'No Brand' }} • {{ product.unit || 'N/A' }}
            </p>

            <!-- Store & Price -->
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-black"></span>
                <span class="text-[10px] font-black uppercase tracking-wide text-black/70">
                  {{ product.store.name }}
                </span>
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-xl font-black text-black sm:text-2xl">
                  ${{ formatPrice(product.price) }}
                </span>
                <span v-if="product.price_un" class="text-[9px] font-bold uppercase tracking-wide text-black/40">
                  {{ formatUnitPrice(product.price_un, product.price_unit) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Add Button -->
          <button 
            @click="shoppingListStore.addItem(product)"
            class="mt-auto w-full border-2 border-black bg-black py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#39FF14] hover:text-black sm:w-auto sm:px-6"
          >
            Buy List Add
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!isLoading && products.length > 0" class="flex items-center justify-center gap-1 sm:gap-2">
      <button 
        @click="searchStore.prevPage()"
        :disabled="searchStore.page === 1"
        class="flex h-8 w-8 items-center justify-center border-2 border-black bg-white text-sm font-black text-black transition hover:bg-gray-100 disabled:opacity-50 sm:h-10 sm:w-10"
      >
        ←
      </button>
      
      <template v-for="pageNum in Math.min(searchStore.totalPages, 5)" :key="pageNum">
        <button 
          @click="searchStore.goToPage(pageNum)"
          :class="searchStore.page === pageNum ? 'bg-[#39FF14]' : 'bg-white hover:bg-gray-100'"
          class="flex h-8 w-8 items-center justify-center border-2 border-black text-sm font-black text-black transition sm:h-10 sm:w-10"
        >
          {{ pageNum }}
        </button>
      </template>
      
      <button 
        @click="searchStore.nextPage()"
        :disabled="searchStore.page >= searchStore.totalPages"
        class="flex h-8 w-8 items-center justify-center border-2 border-black bg-white text-sm font-black text-black transition hover:bg-gray-100 disabled:opacity-50 sm:h-10 sm:w-10"
      >
        →
      </button>
    </div>
  </div>
</template>
