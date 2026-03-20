<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { useSearchStore } from '~/stores/search'

const searchPlaceholder = 'Search items (e.g., Eggs, Coffee...)'
const searchStore = useSearchStore()
</script>

<template>
  <section class="relative bg-black text-white">
    <div class="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-[120px]"></div>
    <div class="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-[120px]"></div>

    <div class="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
      <div class="max-w-3xl">
        <h1 class="font-display text-[clamp(2.6rem,6vw,4.8rem)] font-semibold italic leading-[0.95] tracking-tight text-white">
          Locate the lowest prices.
          <br />
          In real-time.
        </h1>
        <p class="mt-4 max-w-2xl text-sm font-medium text-white/80 sm:mt-6 sm:text-base">
          Search any grocery item and instantly compare live prices across local stores.
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-start">
          <div class="relative w-full sm:flex-1">
            <div class="flex h-11 w-full items-center gap-3 rounded-full border border-white/20 bg-white/5 px-4 focus-within:ring-2 focus-within:ring-white/60 focus-within:ring-offset-2 focus-within:ring-offset-black">
              <Search class="h-4 w-4 shrink-0 text-white/60" />
              <input
                type="text"
                :value="searchStore.heroSearchInput"
                :placeholder="searchPlaceholder"
                class="h-full w-full bg-transparent text-[10px] uppercase tracking-[0.2em] text-white placeholder:text-white/40 focus:outline-none sm:text-xs"
                @input="searchStore.setHeroSearchInput(($event.target as HTMLInputElement).value)"
              />
            </div>

            <div
              v-if="searchStore.heroSearchLoading || searchStore.getHeroHasResults"
              class="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-white/15 bg-black/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
            >
              <div v-if="searchStore.heroSearchLoading" class="px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white/60">
                Searching...
              </div>

              <div v-else class="max-h-72 overflow-y-auto">
                <button
                  v-for="product in searchStore.getHeroSearchResults"
                  :key="product.id"
                  type="button"
                  class="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium leading-tight text-white">{{ product.title }}</p>
                    <p class="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/60">{{ product.store }}</p>
                  </div>
                  <p class="shrink-0 font-display text-lg font-semibold italic text-white">
                    ${{ searchStore.getFormattedPrice(product.price_num) }}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
