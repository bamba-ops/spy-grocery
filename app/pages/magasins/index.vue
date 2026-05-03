<script setup lang="ts">
import { ArrowUpRight, Search } from 'lucide-vue-next'
import type { StoreFacet } from '#shared/types'
import { getAnalyticsQueryProperties } from '#shared/utils/analytics'
import { useStores } from '~/composables/api/useStores'

definePageMeta({
  layout: 'bottom-nav'
})

const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://www.spygrocery.com').replace(/\/$/, '')
const canonicalUrl = `${siteUrl}/magasins`

const { fetchStores } = useStores()
const analytics = useAnalytics()

const { data: stores, error } = await useAsyncData('stores-hub', async () => {
  return fetchStores()
})

const storeSearch = ref('')

const filteredStores = computed(() => {
  const query = storeSearch.value.trim().toLowerCase()
  const list = stores.value || []

  if (!query) {
    return list
  }

  return list.filter((store) => store.name.toLowerCase().includes(query))
})

const getStoresHubAnalyticsProperties = (source: string) => {
  const query = storeSearch.value.trim()

  return {
    ...getAnalyticsQueryProperties(query),
    stores_count: stores.value?.length || 0,
    filtered_stores_count: filteredStores.value.length,
    has_error: Boolean(error.value),
    source
  }
}

const setCaptureStoreClicked = (store: StoreFacet) => {
  analytics.capture('stores_hub_store_clicked', {
    ...getStoresHubAnalyticsProperties('stores_hub'),
    store_id: store.store_id || store.id,
    store_slug: store.slug,
    store_name: store.name,
    store_product_count: store.product_count,
    next_path: `/magasins/${encodeURIComponent(store.slug)}`
  })
}

onMounted(() => {
  analytics.capture('stores_hub_viewed', getStoresHubAnalyticsProperties('stores_hub'))
})

const seoTitle = 'Magasins - Toutes les epiceries suivies par SpyGrocery au Quebec'
const seoDescription = 'Decouvrez toutes les epiceries suivies par SpyGrocery. Comparez les aubaines et les prix par magasin pour economiser sur votre epicerie au Quebec.'

const seoJsonLd = computed(() => {
  const storeList = stores.value || []

  const itemListElement = storeList.map((store, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${siteUrl}/magasins/${encodeURIComponent(store.slug)}`,
    name: store.name
  }))

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: seoTitle,
    description: seoDescription,
    url: canonicalUrl,
    numberOfItems: storeList.length,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement
    }
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: `${siteUrl}/`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Magasins',
        item: canonicalUrl
      }
    ]
  }

  return [collectionPageSchema, breadcrumbSchema]
})

useHead({
  title: seoTitle,
  meta: [
    { name: 'description', content: seoDescription },
    { name: 'robots', content: 'index,follow' },
    { property: 'og:title', content: seoTitle },
    { property: 'og:description', content: seoDescription },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: canonicalUrl },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: seoTitle },
    { name: 'twitter:description', content: seoDescription }
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;1,600&family=Manrope:wght@400;500;600&display=swap'
    }
  ],
  script: seoJsonLd.value.map((data) => ({
    type: 'application/ld+json',
    children: JSON.stringify(data)
  }))
})
</script>

<template>
  <div class="min-h-screen bg-black font-sans text-white">
    <main class="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pt-10">
      <NuxtLink
        to="/"
        class="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        Retour a l'accueil
      </NuxtLink>

      <header class="mt-6 border-b border-white/10 pb-6">
        <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Magasins</p>
        <h1 class="mt-2 font-display text-4xl font-semibold italic tracking-tight text-white sm:text-5xl">
          Toutes les epiceries suivies
        </h1>
        <p class="mt-3 text-sm text-white/70 sm:text-base">
          Chaque magasin est mis a jour automatiquement avec les dernieres aubaines et les meilleurs prix disponibles.
        </p>
      </header>

      <section class="mt-6">
        <div class="relative max-w-sm">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search class="h-4 w-4 text-white/40" />
          </div>

          <input
            v-model="storeSearch"
            type="text"
            maxlength="200"
            placeholder="Filtrer un magasin..."
            class="h-12 w-full rounded-full border border-white/15 bg-black pl-11 pr-4 text-base text-white placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @keydown.esc.prevent="storeSearch = ''"
          >
        </div>
      </section>

      <div v-if="error" class="mt-6 rounded-2xl border border-white/20 bg-white/5 p-4 text-sm text-white/80">
        Impossible de charger la liste des magasins pour le moment.
      </div>

      <template v-else-if="stores && stores.length">
        <section class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="store in filteredStores"
            :key="store.id"
            :to="`/magasins/${encodeURIComponent(store.slug)}`"
            class="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click="setCaptureStoreClicked(store)"
          >
            <div class="min-w-0">
              <p class="font-display text-xl font-semibold italic tracking-tight text-white">
                {{ store.name }}
              </p>
              <p class="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/50">
                {{ store.product_count }} produits
              </p>
            </div>

            <ArrowUpRight class="h-5 w-5 shrink-0 text-white/50" />
          </NuxtLink>
        </section>

        <p v-if="storeSearch.trim() && filteredStores.length === 0" class="mt-6 text-center text-sm text-white/50">
          Aucun magasin ne correspond a &laquo;&nbsp;{{ storeSearch.trim() }}&nbsp;&raquo;.
        </p>
      </template>
    </main>
  </div>
</template>
