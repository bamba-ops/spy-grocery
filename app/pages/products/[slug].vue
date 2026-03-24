<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { useProductDetailsStore } from '~/stores/productDetails'
import { useListsStore } from '~/stores/lists'

definePageMeta({
  layout: 'bottom-nav'
})

const route = useRoute()
const productDetails = useProductDetailsStore()
const lists = useListsStore()

const slug = computed(() => {
  const value = route.params.slug

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

const setAddCurrentProductToList = () => {
  if (!productDetails.product) {
    return
  }

  lists.setProductInCurrentList(productDetails.product)
}

watch(
  slug,
  (nextSlug) => {
    void productDetails.getProductDetailsBySlug(nextSlug)
  },
  { immediate: true }
)

useHead(() => {
  return {
    title: productDetails.product
      ? `${productDetails.product.title} - SpyGrocery`
      : 'Product Details - SpyGrocery',
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
  }
})
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

      <div v-if="productDetails.loading" class="mt-6 grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div class="aspect-square animate-pulse rounded-2xl border border-white/10 bg-white/5"></div>
        <div class="space-y-3">
          <div class="h-5 w-40 animate-pulse rounded bg-white/10"></div>
          <div class="h-12 w-full animate-pulse rounded bg-white/10"></div>
          <div class="h-10 w-32 animate-pulse rounded bg-white/10"></div>
          <div class="h-11 w-44 animate-pulse rounded-full bg-white/10"></div>
        </div>
      </div>

      <div
        v-else-if="productDetails.error"
        class="mt-6 rounded-2xl border border-white/20 bg-white/5 p-4 text-sm text-white/80"
      >
        {{ productDetails.error }}
      </div>

      <section v-else-if="productDetails.product" class="mt-6 space-y-8">
        <article
          class="grid gap-4 rounded-[36px] border border-white/10 bg-white/5 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:gap-6 sm:p-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]"
        >
          <div class="overflow-hidden rounded-2xl border border-white/10 bg-black/60">
            <div class="relative aspect-square">
              <img
                v-if="productDetails.product.image_url"
                :src="productDetails.product.image_url"
                :alt="productDetails.product.title"
                class="h-full w-full object-contain"
                loading="lazy"
              >
              <div v-else class="flex h-full w-full items-center justify-center text-sm uppercase tracking-[0.3em] text-white/60">No image</div>
              <div class="pointer-events-none absolute inset-0 bg-black/35"></div>
            </div>
          </div>

          <div class="flex flex-col">
            <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Product details</p>
            <h1 class="mt-2 font-display text-4xl font-semibold italic tracking-tight text-white sm:text-5xl">
              {{ productDetails.product.title }}
            </h1>

            <p class="mt-4 text-sm text-white/80 sm:text-base">
              {{ productDetails.product.store }}
            </p>

            <p
              v-if="productDetails.product.brand"
              class="mt-2 text-[10px] uppercase tracking-[0.35em] text-white/60"
            >
              {{ productDetails.product.brand }}
            </p>

            <div class="mt-6">
              <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Current price</p>
              <p class="mt-2 font-display text-4xl font-semibold italic tracking-tight text-white sm:text-5xl">
                ${{ productDetails.getFormattedPrice(productDetails.product.price_num) }}
              </p>
              <p
                v-if="productDetails.product.price_text"
                class="mt-2 text-[10px] uppercase tracking-[0.32em] text-white/60"
              >
                {{ productDetails.product.price_text }}
              </p>
            </div>

            <div
              v-if="productDetails.product.description"
              class="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4"
            >
              <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Product profile</p>
              <p class="mt-2 text-sm leading-relaxed text-white/80 sm:text-base">
                {{ productDetails.product.description }}
              </p>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white px-6 text-[10px] uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                @click="setAddCurrentProductToList"
              >
                Add to list
              </button>

              <a
                v-if="getSafeProductUrl(productDetails.product.url)"
                :href="getSafeProductUrl(productDetails.product.url)!"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-6 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                View on store
              </a>
            </div>
          </div>
        </article>

        <section
          v-if="productDetails.getHasOtherStoreProducts"
          class="rounded-2xl border border-white/10 bg-black/60 p-4 sm:p-6"
        >
          <div class="flex items-center justify-between gap-4">
            <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white sm:text-4xl">
              Available in other stores
            </h2>
            <span class="text-[10px] uppercase tracking-[0.35em] text-white/60">
              {{ productDetails.otherStoreProducts.length }} stores
            </span>
          </div>

          <div class="mt-4 grid gap-4 sm:mt-6 sm:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="otherProduct in productDetails.otherStoreProducts"
              :key="otherProduct.id"
              class="relative rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <NuxtLink
                :to="`/products/${otherProduct.slug}`"
                class="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                :aria-label="`Open ${otherProduct.title}`"
              >
                <ArrowUpRight class="h-4 w-4" />
              </NuxtLink>

              <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">{{ otherProduct.store }}</p>
              <p class="mt-4 font-display text-3xl font-semibold italic tracking-tight text-white">
                ${{ productDetails.getFormattedPrice(otherProduct.price_num) }}
              </p>
              <p
                v-if="otherProduct.price_text"
                class="mt-2 text-[10px] uppercase tracking-[0.32em] text-white/60"
              >
                {{ otherProduct.price_text }}
              </p>
            </article>
          </div>
        </section>

        <section v-else class="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Other stores</p>
          <p class="mt-2 text-sm text-white/80 sm:text-base">
            This product is not currently available in other stores.
          </p>
        </section>
      </section>
    </main>
  </div>
</template>
