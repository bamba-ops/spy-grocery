<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { getProductRoutePath } from '#shared/utils/productRoute'
import { useStoreOverviewStore } from '~/stores/storeOverview'

definePageMeta({
  layout: 'bottom-nav',
  middleware: 'onboarding'
})

const route = useRoute()
const storeOverview = useStoreOverviewStore()

const storeSlug = computed(() => {
  const value = route.params.store

  if (Array.isArray(value)) {
    return value[0] || ''
  }

  return typeof value === 'string' ? value : ''
})

const getSafeProductUrl = (url: string | null) => {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (!/^https?:\/\//i.test(trimmed)) return null
  return trimmed
}

watch(
  storeSlug,
  (nextStoreSlug) => {
    void storeOverview.loadStoreOverview(nextStoreSlug)
  },
  { immediate: true }
)

useHead(() => ({
  title: storeOverview.storeName
    ? `${storeOverview.storeName} - Specials and top products | SpyGrocery`
    : 'Store overview - SpyGrocery',
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;1,600&family=Manrope:wght@400;500;600&display=swap'
    }
  ]
}))
</script>

<template>
  <div class="min-h-screen bg-black font-sans text-white">
    <main class="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pt-10">
      <NuxtLink
        to="/search"
        class="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        Back to search
      </NuxtLink>

      <header class="mt-6 border-b border-white/10 pb-6">
        <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Store page</p>
        <h1 class="mt-2 font-display text-4xl font-semibold italic tracking-tight text-white sm:text-5xl">
          {{ storeOverview.storeName || storeSlug }}
        </h1>

        <div class="mt-4 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.3em] text-white/65">
          <span class="rounded-full border border-white/15 px-3 py-2">
            {{ storeOverview.activeSpecialsCount }} active specials
          </span>
          <span class="rounded-full border border-white/15 px-3 py-2">
            {{ storeOverview.productCount }} total products
          </span>
          <span v-if="storeOverview.formattedLastUpdated" class="rounded-full border border-white/15 px-3 py-2">
            Updated {{ storeOverview.formattedLastUpdated }}
          </span>
        </div>
      </header>

      <div v-if="storeOverview.error" class="mt-6 rounded-2xl border border-white/20 bg-white/5 p-4 text-sm text-white/80">
        {{ storeOverview.error }}
      </div>

      <div v-else-if="storeOverview.loading" class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="h-52 animate-pulse rounded-2xl border border-white/10 bg-white/5"></div>
      </div>

      <section v-else class="mt-6 space-y-8">
        <section class="rounded-2xl border border-white/10 bg-black/60 p-5 sm:p-6">
          <div class="flex items-center justify-between gap-4">
            <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white sm:text-4xl">
              Latest specials
            </h2>
            <span class="text-[10px] uppercase tracking-[0.35em] text-white/60">
              {{ storeOverview.latestPromos.length }} items
            </span>
          </div>

          <div v-if="storeOverview.hasLatestPromos" class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="product in storeOverview.latestPromos"
              :key="product.id"
              class="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <NuxtLink
                :to="getProductRoutePath(product)"
                class="relative block overflow-hidden rounded-xl border border-white/10 bg-black"
              >
                <div class="relative aspect-square">
                  <img
                    v-if="product.image_url"
                    :src="product.image_url"
                    :alt="product.title"
                    class="h-full w-full object-contain"
                    loading="lazy"
                  >
                  <div v-else class="flex h-full w-full items-center justify-center text-sm uppercase tracking-[0.3em] text-white/60">No image</div>
                  <div class="pointer-events-none absolute inset-0 bg-black/30"></div>
                </div>
              </NuxtLink>

              <NuxtLink :to="getProductRoutePath(product)" class="mt-3">
                <h3
                  :title="product.title"
                  class="font-display text-xl font-semibold italic leading-tight text-white transition hover:text-white/90"
                >
                  {{ product.title }}
                </h3>
              </NuxtLink>

              <p class="mt-2 font-display text-3xl font-semibold italic text-white">
                ${{ storeOverview.getFormattedPrice(product.price_num) }}
              </p>

              <a
                v-if="getSafeProductUrl(product.url)"
                :href="getSafeProductUrl(product.url)!"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-3 inline-flex rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                View on store
              </a>
            </article>
          </div>

          <p v-else class="mt-4 text-sm text-white/70">No recent specials available right now.</p>
        </section>

        <section class="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <div class="flex items-center justify-between gap-4">
            <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white sm:text-4xl">
              Best product pages
            </h2>
            <span class="text-[10px] uppercase tracking-[0.35em] text-white/60">
              {{ storeOverview.bestProducts.length }} picks
            </span>
          </div>

          <div v-if="storeOverview.hasBestProducts" class="mt-5 space-y-3">
            <NuxtLink
              v-for="product in storeOverview.bestProducts"
              :key="product.id"
              :to="getProductRoutePath(product)"
              class="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/40 px-4 py-3 transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <div>
                <p class="text-[10px] uppercase tracking-[0.3em] text-white/60">{{ product.store }}</p>
                <p class="mt-1 text-sm text-white/90 sm:text-base">{{ product.title }}</p>
              </div>

              <div class="flex items-center gap-3">
                <p class="font-display text-2xl font-semibold italic text-white">
                  ${{ storeOverview.getFormattedPrice(product.price_num) }}
                </p>
                <ArrowUpRight class="h-4 w-4 text-white/70" />
              </div>
            </NuxtLink>
          </div>

          <p v-else class="mt-4 text-sm text-white/70">No product links available right now.</p>
        </section>
      </section>
    </main>
  </div>
</template>
