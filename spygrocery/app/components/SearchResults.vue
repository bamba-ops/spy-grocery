<script setup lang="ts">
const viewMode = ref('grid')

const products = ref([
  {
    id: 1,
    name: 'Organic Whole Milk',
    brand: 'Horizon Organic',
    size: '1 Gallon',
    tags: ['ORGANIC', 'SPECIALTY'],
    hasDeal: true,
    prices: [
      { store: 'WALMART', price: 4.89, isBest: true },
      { store: 'TARGET', price: 5.24 },
      { store: 'WHOLE FOODS', price: 5.99 }
    ]
  },
  {
    id: 2,
    name: '2% Reduced Fat Milk',
    brand: 'Great Value',
    size: '1 Gallon',
    tags: ['STORE BRAND', 'POPULAR'],
    hasDeal: false,
    prices: [
      { store: 'WALMART', price: 3.42, isBest: true },
      { store: 'TARGET', price: 3.65 },
      { store: 'KROGER', price: null, outOfStock: true }
    ]
  },
  {
    id: 3,
    name: 'Lactose Free Whole Milk',
    brand: 'Fairlife',
    size: '52 FL OZ',
    tags: ['SPECIALTY', 'PREMIUM'],
    hasDeal: false,
    prices: [
      { store: 'TARGET', price: 4.50, isBest: true },
      { store: 'WALMART', price: 4.98 },
      { store: 'PUBLIX', price: 5.25 }
    ]
  },
  {
    id: 4,
    name: 'Unsweetened Oat Milk',
    brand: 'Oatly',
    size: '64 FL OZ',
    tags: ['PLANT-BASED', 'PREMIUM'],
    hasDeal: true,
    prices: [
      { store: 'WHOLE FOODS', price: 5.49, isBest: true },
      { store: 'TARGET', price: 5.88 },
      { store: 'WALMART', price: 5.78 }
    ]
  }
])
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="mb-2 text-6xl font-black italic uppercase leading-none tracking-tighter md:text-7xl">
        <span class="text-black">MILK </span>
        <span class="bg-[#39FF14] px-2 text-black">FINDER</span>
      </h1>
      <p class="text-[11px] font-bold uppercase tracking-wider text-black/60">
        Scanning 42 results across your local retailers
      </p>
    </div>

    <!-- View Toggle -->
    <div class="mb-6 flex justify-end">
      <div class="inline-flex border-2 border-black">
        <button 
          :class="viewMode === 'grid' ? 'bg-[#39FF14]' : 'bg-white'"
          class="px-6 py-2 text-xs font-black uppercase tracking-wider text-black transition"
          @click="viewMode = 'grid'"
        >
          Grid
        </button>
        <button 
          :class="viewMode === 'list' ? 'bg-[#39FF14]' : 'bg-white'"
          class="border-l-2 border-black px-6 py-2 text-xs font-black uppercase tracking-wider text-black transition"
          @click="viewMode = 'list'"
        >
          List
        </button>
      </div>
    </div>

    <!-- Product Grid -->
    <div class="mb-12 grid gap-6 sm:grid-cols-2">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="relative border-4 border-black bg-white shadow-[6px_6px_0_#000]"
      >
        <!-- Product Image Section -->
        <div class="relative aspect-[4/3] border-b-4 border-black bg-[#E5E5DC] p-6">
          <!-- Tags -->
          <div class="absolute left-4 top-4 flex flex-wrap gap-2">
            <span 
              v-for="tag in product.tags" 
              :key="tag"
              :class="tag === 'ORGANIC' || tag === 'PREMIUM' ? 'bg-[#39FF14]' : tag === 'SPECIALTY' ? 'bg-white' : 'bg-[#FF6B35]'"
              class="border-2 border-black px-2 py-1 text-[9px] font-black uppercase text-black"
            >
              {{ tag }}
            </span>
          </div>

          <!-- Deal Badge -->
          <div 
            v-if="product.hasDeal"
            class="absolute right-4 top-4 rounded-full border-2 border-black bg-[#39FF14] px-3 py-1 text-[10px] font-black uppercase text-black shadow-[2px_2px_0_#000]"
          >
            SPY DEAL
          </div>

          <!-- Product Image Placeholder -->
          <div class="flex h-full items-center justify-center">
            <span class="text-7xl">🥛</span>
          </div>
        </div>

        <!-- Product Details -->
        <div class="p-4">
          <h3 class="mb-1 text-xl font-black italic uppercase leading-tight text-black">
            {{ product.name }}
          </h3>
          <p class="mb-4 text-[11px] font-semibold uppercase tracking-wide text-black/60">
            {{ product.brand }} • {{ product.size }}
          </p>

          <!-- Store Prices -->
          <div class="mb-4 space-y-2">
            <div 
              v-for="(priceInfo, idx) in product.prices" 
              :key="idx"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-black"></span>
                <span class="text-[10px] font-black uppercase tracking-wide text-black/70">
                  {{ priceInfo.store }}
                </span>
              </div>
              <div 
                v-if="priceInfo.outOfStock"
                class="text-[10px] font-black uppercase tracking-wide text-red-600"
              >
                Out of Stock
              </div>
              <div 
                v-else
                :class="priceInfo.isBest ? 'bg-[#39FF14]' : 'bg-gray-100'"
                class="border-2 border-black px-3 py-1 text-sm font-black text-black"
              >
                ${{ priceInfo.price.toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Add Button -->
          <button 
            class="w-full border-2 border-black bg-black py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#39FF14] hover:text-black"
          >
            Buy List Add
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-center gap-2">
      <button class="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-sm font-black text-black transition hover:bg-gray-100">
        ←
      </button>
      <button class="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#39FF14] text-sm font-black text-black">
        1
      </button>
      <button class="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-sm font-black text-black transition hover:bg-gray-100">
        2
      </button>
      <button class="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-sm font-black text-black transition hover:bg-gray-100">
        3
      </button>
      <span class="px-2 text-sm font-bold text-black">...</span>
      <button class="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-sm font-black text-black transition hover:bg-gray-100">
        12
      </button>
      <button class="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-sm font-black text-black transition hover:bg-gray-100">
        →
      </button>
    </div>
  </div>
</template>
