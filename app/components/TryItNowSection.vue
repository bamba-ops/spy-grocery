<script setup lang="ts">
import { FEATURED_LABEL_BY_ID, FEATURED_PRODUCT_IDS } from '~/constants/featuredProducts'
import { useSearchStore } from '~/stores/search'

const searchStore = useSearchStore()

onMounted(() => {
  void searchStore.getFeaturedProductsByIds(FEATURED_PRODUCT_IDS)
})
</script>

<template>
  <section class="bg-black text-white">
    <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div class="mb-8 flex items-center justify-between">
        <h2 class="font-display text-2xl font-semibold italic">Try it now</h2>
        <span class="text-[10px] uppercase tracking-[0.35em] text-white/60">Selected essentials</span>
      </div>

      <div v-if="searchStore.featuredLoading" class="grid gap-6 md:grid-cols-3">
        <div
          v-for="i in 3"
          :key="i"
          class="h-[266px] animate-pulse rounded-2xl border border-white/10 bg-white/5"
        ></div>
      </div>

      <div v-else-if="searchStore.featuredError" class="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
        Could not load featured products.
      </div>

      <div v-else-if="searchStore.getFeaturedHasResults" class="grid gap-6 md:grid-cols-3">
        <div
          v-for="product in searchStore.getFeaturedProducts"
          :key="product.id"
          class="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
        >
          <div class="mb-6 flex h-40 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/15 via-white/5 to-white/10 sm:h-48">
            <template v-if="searchStore.getProductImageDisplay(product.image_url, product.name).type === 'url'">
              <img
                :src="searchStore.getProductImageDisplay(product.image_url, product.name).value"
                :alt="product.name"
                class="h-full w-full rounded-2xl object-contain p-4"
                loading="lazy"
              />
            </template>
            <template v-else>
              <div class="text-6xl">
                {{ searchStore.getProductImageDisplay(product.image_url, product.name).value }}
              </div>
            </template>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">{{ FEATURED_LABEL_BY_ID[product.id] || 'Essentials' }}</p>
              <h3 class="mt-2 text-lg font-semibold italic">{{ product.name }}</h3>
              <p class="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/55">{{ product.store.name }}</p>
            </div>
            <span class="font-display text-xl font-semibold italic text-white">
              ${{ searchStore.getFormattedPrice(product.price) }}
            </span>
          </div>
        </div>
      </div>

      <div v-else class="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
        No featured products available right now.
      </div>
    </div>
  </section>
</template>
