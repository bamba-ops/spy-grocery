<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { useSearchStore } from '~/stores/search'
import { useListsStore } from '~/stores/lists'

const searchStore = useSearchStore()
const lists = useListsStore()

// const optimizedChoice = computed(() => products.value[0])
</script>

<template>
  <div>
      <div class="border-b border-white/10 pb-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Currently comparing</p>
          <h1 class="font-display text-4xl font-semibold italic tracking-tight sm:text-5xl">
            {{ searchStore.getActiveQuery }}
          </h1>
        </div>
        <div class="text-[10px] uppercase tracking-[0.35em] text-white/60">
          {{ searchStore.total }} results
        </div>
      </div>

      <div class="mt-6">
        <SearchSidebar />
      </div>
    </div>

      <div v-if="searchStore.getHasError" class="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        {{ searchStore.error }}
      </div>

      <div v-else-if="searchStore.getIsLoading" class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/5"></div>
      </div>

    <div v-else class="mt-6">
      <!--
      <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Optimized choice</p>
        <div class="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p class="font-display text-2xl font-semibold italic">
              {{ optimizedChoice?.store.name || 'Market Street Fresh' }}
            </p>
            <p class="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/60">
              0.4 miles away • Open now
            </p>
          </div>
          <div class="text-right">
            <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Cheapest bundle</p>
            <p class="font-display text-4xl font-semibold italic">
              ${{ optimizedChoice?.price?.toFixed(2) || '1.85' }}
            </p>
            <p class="text-[10px] uppercase tracking-[0.3em] text-white/60">Avg. item price</p>
          </div>
        </div>
      </div>
 -->

      <div class="mt-6 grid gap-4 sm:mt-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="product in searchStore.getProducts"
          :key="product.id"
          class="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5"
        >
          <div class="relative">
            <div v-if="product.is_promo" class="absolute left-4 top-4 z-10 rounded-full border border-white/20 bg-black/80 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/80">
              Promo
            </div>
            <div class="relative aspect-[16/9] overflow-hidden rounded-t-2xl border-b border-white/10 bg-black sm:aspect-square">
              <template v-if="searchStore.getProductImageDisplay(product.image_url, product.name).type === 'url'">
                <img
                  :src="searchStore.getProductImageDisplay(product.image_url, product.name).value"
                  :alt="product.name"
                  class="h-full w-full object-contain brightness-90 contrast-110"
                  loading="lazy"
                />
              </template>
              <template v-else>
                <div class="flex h-full w-full items-center justify-center text-5xl text-white/60">
                  {{ searchStore.getProductImageDisplay(product.image_url, product.name).value }}
                </div>
              </template>
              <div class="pointer-events-none absolute inset-0 z-0 bg-black/40"></div>
            </div>
          </div>
          <div class="flex flex-1 flex-col p-3 sm:p-5">
            
            <p class="text-[9px] uppercase tracking-[0.28em] text-white/60 sm:text-[10px] sm:tracking-[0.35em]">{{ product.store.name }}</p>
            <h3 class="mt-1 font-display text-lg font-semibold italic leading-tight sm:mt-2 sm:text-2xl">
              {{ product.name }}
            </h3>

            <div class="mt-2 flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.24em] text-white/70 sm:mt-3 sm:text-[10px] sm:tracking-[0.3em]">
              <span class="rounded-full border border-white/15 px-2 py-1">Each</span>
              <span class="rounded-full border border-white/15 px-2 py-1">${{ searchStore.getFormattedPrice(product.price) }}/unit</span>
            </div>
            <div class="mt-4 flex items-center justify-between sm:mt-6">
              <span class="font-display text-xl font-semibold italic sm:text-3xl">
                ${{ searchStore.getFormattedPrice(product.price) }}
              </span>
              <button
                :class="[
                  'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                  lists.lastAddedProductId === product.id ? 'scale-110 ring-2 ring-white/40' : 'scale-100'
                ]"
                @click="lists.setProductInCurrentList(product)"
                aria-label="Add to list"
              >
                <Plus class="h-7 w-7" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="searchStore.totalPages > 1" class="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-[10px] uppercase tracking-[0.35em] text-white/60">
          Page {{ searchStore.page }} of {{ searchStore.totalPages }}
        </div>

        <div class="flex items-center justify-between gap-3 sm:justify-end">
          <button
            class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!searchStore.getCanPrev"
            @click="searchStore.setPrevPageWithScroll()"
          >
            Prev
          </button>
          <button
            class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!searchStore.getCanNext"
            @click="searchStore.setNextPageWithScroll()"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
