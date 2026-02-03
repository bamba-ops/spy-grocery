<script setup lang="ts">
const sortBy = ref('price-low')
const organicOnly = ref(false)
const storeBrands = ref(false)
const promotions = ref(false)

const walmart = ref(true)
const target = ref(true)
const kroger = ref(true)
const wholeFoods = ref(true)

const priceMin = ref(1.00)
const priceMax = ref(12.00)
</script>

<template>
  <div class="w-full space-y-6 bg-white p-6">
    <!-- Sort Results -->
    <div>
      <h3 class="mb-3 text-xs font-black uppercase tracking-wider text-black">Sort Results</h3>
      <select 
        v-model="sortBy"
        class="w-full border-2 border-black bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-black focus:outline-none"
      >
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="name">Name: A-Z</option>
      </select>
    </div>

    <!-- Quick Filters -->
    <div>
      <h3 class="mb-3 text-xs font-black uppercase tracking-wider text-black">Quick Filters</h3>
      <div class="space-y-2">
        <label class="flex cursor-pointer items-center gap-2">
          <input 
            v-model="organicOnly"
            type="checkbox" 
            class="h-4 w-4 border-2 border-black accent-[#39FF14]"
          />
          <span class="text-xs font-bold uppercase tracking-wide text-black">Organic Only</span>
        </label>
        <label class="flex cursor-pointer items-center gap-2">
          <input 
            v-model="storeBrands"
            type="checkbox" 
            class="h-4 w-4 border-2 border-black accent-[#39FF14]"
          />
          <span class="text-xs font-bold uppercase tracking-wide text-black">Store Brands</span>
        </label>
        <label class="flex cursor-pointer items-center gap-2">
          <input 
            v-model="promotions"
            type="checkbox" 
            class="h-4 w-4 border-2 border-black accent-[#39FF14]"
          />
          <span class="text-xs font-bold uppercase tracking-wide text-black">Promotions</span>
        </label>
      </div>
    </div>

    <!-- Stores -->
    <div>
      <h3 class="mb-3 text-xs font-black uppercase tracking-wider text-black">Stores</h3>
      <div class="space-y-2">
        <label class="flex cursor-pointer items-center gap-2">
          <input 
            v-model="walmart"
            type="checkbox" 
            class="h-4 w-4 border-2 border-black accent-[#39FF14]"
          />
          <span class="text-xs font-bold uppercase tracking-wide text-black">Walmart</span>
        </label>
        <label class="flex cursor-pointer items-center gap-2">
          <input 
            v-model="target"
            type="checkbox" 
            class="h-4 w-4 border-2 border-black accent-[#39FF14]"
          />
          <span class="text-xs font-bold uppercase tracking-wide text-black">Target</span>
        </label>
        <label class="flex cursor-pointer items-center gap-2">
          <input 
            v-model="kroger"
            type="checkbox" 
            class="h-4 w-4 border-2 border-black accent-[#39FF14]"
          />
          <span class="text-xs font-bold uppercase tracking-wide text-black">Kroger</span>
        </label>
        <label class="flex cursor-pointer items-center gap-2">
          <input 
            v-model="wholeFoods"
            type="checkbox" 
            class="h-4 w-4 border-2 border-black accent-[#39FF14]"
          />
          <span class="text-xs font-bold uppercase tracking-wide text-black">Whole Foods</span>
        </label>
      </div>
    </div>

    <!-- Price Range -->
    <div>
      <h3 class="mb-3 text-xs font-black uppercase tracking-wider text-black">Price Range</h3>
      <div class="space-y-2">
        <input 
          type="range" 
          min="1" 
          max="12" 
          step="0.01"
          v-model.number="priceMax"
          class="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-300 accent-[#39FF14]"
        />
        <div class="flex justify-between text-xs font-bold text-black">
          <span>${{ priceMin.toFixed(2) }}</span>
          <span>${{ priceMax.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- Spy Report Button -->
    <button 
      class="w-full border-2 border-black bg-[#39FF14] px-4 py-4 text-center shadow-[4px_4px_0_#000] transition hover:shadow-[6px_6px_0_#000]"
    >
      <div class="text-xs font-black uppercase tracking-wider text-black">SPY REPORT</div>
      <div class="mt-1 text-[10px] font-medium uppercase tracking-wide text-black">
        Track when any of us drop our target price range
      </div>
    </button>
  </div>
</template>
