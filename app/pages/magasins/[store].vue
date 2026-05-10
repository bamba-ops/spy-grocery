<script setup lang="ts">
import { ArrowUpRight, Plus } from 'lucide-vue-next'
import { getRouteParam } from '#shared/utils/getRouteParam'
import { getAnalyticsProductProperties } from '#shared/utils/analytics'
import { ONBOARDING_MAX_STEP } from '#shared/utils/onboarding'
import { getProductValidityLabel } from '#shared/utils/productAvailability'
import { getProductRoutePath } from '#shared/utils/productRoute'
import { toPageError } from '#shared/utils/toPageError'
import { useAuthStore } from '~/stores/auth'
import { useListsStore } from '~/stores/lists'
import { useOnboardingStore } from '~/stores/onboarding'
import { useStoreOverviewStore } from '~/stores/storeOverview'

definePageMeta({
  layout: 'bottom-nav',
  middleware: 'onboarding'
})

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://www.spygrocery.com').replace(/\/$/, '')
const storeOverview = useStoreOverviewStore()
const onboardingStore = useOnboardingStore()
const authStore = useAuthStore()
const listsStore = useListsStore()
const analytics = useAnalytics()

const onboardingStepNumbers = [1, 2, 3]
const lastStorePageViewKey = ref('')

const storeSlug = computed(() => {
  return getRouteParam(route.params.store as string | string[] | undefined)
})

const storeSearchInputModel = computed({
  get: () => storeOverview.storeSearchInput,
  set: (value: string) => {
    storeOverview.setStoreSearchInput(value)
  }
})

const getIsOnboardingContext = computed(() => route.query.onboarding === '1')

const showOnboardingProgress = computed(() => {
  if (!authStore.user) {
    return false
  }

  if (getIsOnboardingContext.value) {
    return true
  }

  return onboardingStore.status === 'in_progress' && onboardingStore.currentStep >= 2
})

const onboardingDisplayStep = computed(() => {
  const current = Number.isInteger(onboardingStore.currentStep)
    ? onboardingStore.currentStep
    : 2

  return Math.max(2, Math.min(current, ONBOARDING_MAX_STEP))
})

const getSafeProductUrl = (url: string | null) => {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (!/^https?:\/\//i.test(trimmed)) return null
  return trimmed
}

const getProductValidityText = (validFrom: string | null, validTo: string | null) => {
  return getProductValidityLabel(validFrom, validTo)
}

watch(
  storeSlug,
  async (nextStoreSlug, previousStoreSlug) => {
    if (nextStoreSlug === previousStoreSlug) {
      return
    }

    storeOverview.setResetStoreSearch()

    await storeOverview.loadStoreOverview(nextStoreSlug)
    setCaptureStorePageViewed('store_page_route_change')
  },
  { immediate: false }
)

if (!storeSlug.value) {
  throw createError({
    statusCode: 400,
    message: 'Slug de magasin invalide'
  })
}

const setGoToOnboardingLists = async () => {
  // Step 3 starts from the user's own CTA decision, no forced counters.
  await onboardingStore.setAdvanceToStepThree()

  console.log('[onboarding] store page CTA -> lists')
  await navigateTo('/lists?source=onboarding')
}

const getStorePageAnalyticsProperties = (source: string) => {
  return {
    store_slug: storeOverview.storeSlug || storeSlug.value,
    store_name: storeOverview.storeName || null,
    product_count: storeOverview.productCount,
    active_specials_count: storeOverview.activeSpecialsCount,
    latest_promos_count: storeOverview.latestPromos.length,
    best_products_count: storeOverview.bestProducts.length,
    last_updated_at: storeOverview.lastUpdatedAt,
    source
  }
}

const setCaptureStorePageViewed = (source = 'store_page') => {
  const resolvedStoreSlug = storeOverview.storeSlug || storeSlug.value

  if (!resolvedStoreSlug) {
    return
  }

  const viewKey = `${resolvedStoreSlug}:${route.fullPath}`
  if (lastStorePageViewKey.value === viewKey) {
    return
  }

  lastStorePageViewKey.value = viewKey
  analytics.capture('store_page_viewed', getStorePageAnalyticsProperties(source))
}

const setCaptureStoreProductClicked = (
  product: Parameters<typeof listsStore.setProductInCurrentList>[0],
  source: string
) => {
  analytics.capture('store_product_clicked', {
    ...getStorePageAnalyticsProperties(source),
    ...getAnalyticsProductProperties(product)
  })
}

const setAddStoreProductToList = (
  product: Parameters<typeof listsStore.setProductInCurrentList>[0],
  source = 'store_page'
) => {
  listsStore.setProductInCurrentList(product, { source })
  analytics.capture('store_product_added_to_list', {
    ...getStorePageAnalyticsProperties(source),
    ...getAnalyticsProductProperties(product)
  })

  console.log('[onboarding] product added from store page:', {
    productId: product.id,
    store: product.store
  })
}

const setOpenStoreSearchProduct = async (product: Parameters<typeof listsStore.setProductInCurrentList>[0]) => {
  setCaptureStoreProductClicked(product, 'store_local_search')

  console.log('[store-search] open product from dropdown:', {
    productId: product.id,
    productSlug: product.slug,
    store: product.store
  })

  await navigateTo(getProductRoutePath(product))
}

onMounted(async () => {
  setCaptureStorePageViewed()

  if (!authStore.isReady) {
    await authStore.initAuth()
  }

  if (!authStore.user) {
    return
  }

  await onboardingStore.setLoadOnboardingState()

  if (getIsOnboardingContext.value && onboardingStore.currentStep < 2) {
    await onboardingStore.setMoveToStoreStep(storeSlug.value)
  }
})

try {
  await storeOverview.loadStoreOverview(storeSlug.value, { throwOnError: true })
} catch (error: unknown) {
  throw toPageError(error, 'Impossible de charger la page du magasin.')
}

if (!storeOverview.storeName) {
  throw createError({
    statusCode: 404,
    message: 'Magasin introuvable'
  })
}

const canonicalPath = computed(() => {
  const slug = storeOverview.storeSlug || storeSlug.value
  return `/magasins/${encodeURIComponent(slug)}`
})

const canonicalUrl = computed(() => `${siteUrl}${canonicalPath.value}`)

const seoTitle = computed(() => {
  const storeName = storeOverview.storeName || storeSlug.value
  return `${storeName} - aubaines et meilleurs produits en epicerie | SpyGrocery`
})

const storeAnswerSummary = computed(() => {
  const storeName = storeOverview.storeName || storeSlug.value
  const updateText = storeOverview.formattedLastUpdated
    ? ` Mis a jour ${storeOverview.formattedLastUpdated}.`
    : ''

  return `SpyGrocery suit ${storeOverview.productCount} produits chez ${storeName}, dont ${storeOverview.activeSpecialsCount} aubaines actives, pour comparer les prix avec les autres epiceries suivies au Quebec.${updateText}`
})

const storeTopDealsSummary = computed(() => {
  const products = storeOverview.bestProducts.slice(0, 3)

  if (products.length === 0) {
    return ''
  }

  const deals = products
    .map((product) => `${product.title} a ${storeOverview.getFormattedPrice(product.price_num)} $ CA`)
    .join(', ')

  return `Exemples de produits suivis: ${deals}.`
})

const seoDescription = computed(() => {
  return `${storeAnswerSummary.value} ${storeTopDealsSummary.value}`.trim()
})

const seoJsonLd = computed(() => {
  const itemListElement = storeOverview.bestProducts.slice(0, 10).map((product, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${siteUrl}${getProductRoutePath(product)}`,
    item: {
      '@type': 'Product',
      name: product.title,
      url: `${siteUrl}${getProductRoutePath(product)}`,
      image: product.image_url || undefined,
      brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'CAD',
        price: typeof product.price_num === 'number' ? product.price_num : undefined,
        priceValidUntil: product.valid_to ? product.valid_to.slice(0, 10) : undefined,
        availability: product.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: product.store || storeOverview.storeName
        }
      }
    }
  }))

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: seoTitle.value,
    description: seoDescription.value,
    url: canonicalUrl.value,
    numberOfItems: storeOverview.productCount,
    about: storeAnswerSummary.value,
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
        name: storeOverview.storeName,
        item: canonicalUrl.value
      }
    ]
  }

  return [collectionPageSchema, breadcrumbSchema]
})

useHead(() => ({
  title: seoTitle.value,
  meta: [
    {
      name: 'description',
      content: seoDescription.value
    },
    {
      name: 'robots',
      content: 'index,follow'
    },
    {
      property: 'og:title',
      content: seoTitle.value
    },
    {
      property: 'og:description',
      content: seoDescription.value
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:url',
      content: canonicalUrl.value
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image'
    },
    {
      name: 'twitter:title',
      content: seoTitle.value
    },
    {
      name: 'twitter:description',
      content: seoDescription.value
    }
  ],
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl.value
    },
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
  ],
  script: seoJsonLd.value.map((data) => ({
    type: 'application/ld+json',
    children: JSON.stringify(data)
  }))
}))
</script>

<template>
  <div class="min-h-screen bg-black font-sans text-white">
    <main class="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pt-10">
      <NuxtLink
        to="/search"
        class="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        Retour a la recherche
      </NuxtLink>

       <header class="mt-6 border-b border-white/10 pb-6">
        <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Page magasin</p>
        <h1 class="mt-2 font-display text-4xl font-semibold italic tracking-tight text-white sm:text-5xl">
          {{ storeOverview.storeName || storeSlug }}
        </h1>

        <div class="mt-4 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.3em] text-white/65">
          <span class="rounded-full border border-white/15 px-3 py-2">
            {{ storeOverview.activeSpecialsCount }} aubaines actives
          </span>
          <span class="rounded-full border border-white/15 px-3 py-2">
            {{ storeOverview.productCount }} produits au total
          </span>
          <span v-if="storeOverview.formattedLastUpdated" class="rounded-full border border-white/15 px-3 py-2">
            Mis a jour {{ storeOverview.formattedLastUpdated }}
          </span>
        </div>
      </header>

      <section class="mt-6 border-b border-white/10 pb-6">
        <p class="text-sm leading-relaxed text-white/70">
          {{ storeAnswerSummary }}
          <template v-if="storeTopDealsSummary">
            {{ storeTopDealsSummary }}
          </template>
        </p>
      </section>

      <section
        v-if="showOnboardingProgress"
        class="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
      >
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Etape {{ onboardingDisplayStep }} sur {{ ONBOARDING_MAX_STEP }}</p>
            <h2 class="mt-2 font-display text-3xl font-semibold italic tracking-tight text-white sm:text-4xl">
              Continuez votre liste chez {{ storeOverview.storeName || storeSlug }}
            </h2>
            <p class="mt-2 text-sm text-white/75 sm:text-base">
              Ajoutez les produits que vous voulez, puis choisissez simplement la suite.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white px-5 text-[10px] uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              @click="setGoToOnboardingLists"
            >
              Enregistrer ma liste
            </button>

          </div>
        </div>

        <div class="mt-4 flex items-center gap-2">
          <span
            v-for="step in onboardingStepNumbers"
            :key="`store-onboarding-step-${step}`"
            :class="[
              'h-[2px] w-12 rounded-full transition',
              step <= onboardingDisplayStep ? 'bg-white' : 'bg-white/20'
            ]"
          />
        </div>
      </section>

      <div v-if="storeOverview.error" class="mt-6 rounded-2xl border border-white/20 bg-white/5 p-4 text-sm text-white/80">
        {{ storeOverview.error }}
      </div>

      <div v-else-if="storeOverview.loading" class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="h-52 animate-pulse rounded-2xl border border-white/10 bg-white/5"></div>
      </div>

      <section v-else class="mt-6 space-y-8">
        <section class="rounded-2xl border border-white/10 bg-black/70 p-5 sm:p-6">
          <div class="flex flex-col gap-2">
            <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Recherche locale</p>
            <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white sm:text-4xl">
              Chercher un produit chez {{ storeOverview.storeName || storeSlug }}
            </h2>
            <p class="text-sm text-white/70 sm:text-base">
              Ouvrez rapidement une fiche produit, ou ajoutez directement un resultat a votre liste.
            </p>
          </div>

          <ProductSearchDropdown
            v-model="storeSearchInputModel"
            :products="storeOverview.storeSearchResults"
            :loading="storeOverview.storeSearchLoading"
            :error="storeOverview.storeSearchError"
            :get-formatted-price="storeOverview.getFormattedPrice"
            placeholder="Ex: lait, oeufs, pain, yogourt..."
            submit-label="Rechercher"
            action-label="Voir"
            empty-state-text="Aucun produit ne correspond a cette recherche dans ce magasin."
            log-prefix="store-search"
            :enable-quick-add="true"
            @submit="storeOverview.setSearchProductsInStore"
            @select-product="setOpenStoreSearchProduct"
            @quick-add-product="(product) => setAddStoreProductToList(product, 'store_local_search')"
          />
        </section>

        <section class="rounded-2xl border border-white/10 bg-black/60 p-5 sm:p-6">
          <div class="flex items-center justify-between gap-4">
            <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white sm:text-4xl">
              Dernieres aubaines
            </h2>
            <span class="text-[10px] uppercase tracking-[0.35em] text-white/60">
              {{ storeOverview.latestPromos.length }} articles
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
                @click="setCaptureStoreProductClicked(product, 'store_latest_promos')"
              >
                <div class="relative aspect-square">
                  <img
                    v-if="product.image_url"
                    :src="product.image_url"
                    :alt="product.title"
                    class="h-full w-full object-contain"
                    loading="lazy"
                  >
                  <div v-else class="flex h-full w-full items-center justify-center text-sm uppercase tracking-[0.3em] text-white/60">Aucune image</div>
                  <div class="pointer-events-none absolute inset-0 bg-black/30"></div>
                </div>
              </NuxtLink>

              <NuxtLink
                :to="getProductRoutePath(product)"
                class="mt-3"
                @click="setCaptureStoreProductClicked(product, 'store_latest_promos')"
              >
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
              <p v-if="getProductValidityText(product.valid_from, product.valid_to)" class="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/50">
                {{ getProductValidityText(product.valid_from, product.valid_to) }}
              </p>

              <div class="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/72 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  aria-label="Ajouter a la liste"
                  @click="setAddStoreProductToList(product, 'store_latest_promos')"
                >
                  <Plus class="h-5 w-5" />
                </button>

                <a
                  v-if="getSafeProductUrl(product.url)"
                  :href="getSafeProductUrl(product.url)!"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Voir en magasin
                </a>
              </div>
            </article>
          </div>

          <p v-else class="mt-4 text-sm text-white/70">Aucune aubaine recente disponible pour le moment.</p>
        </section>

        <section class="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <div class="flex items-center justify-between gap-4">
            <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white sm:text-4xl">
              Meilleurs produits
            </h2>
            <span class="text-[10px] uppercase tracking-[0.35em] text-white/60">
              {{ storeOverview.bestProducts.length }} choix
            </span>
          </div>

          <div v-if="storeOverview.hasBestProducts" class="mt-5 space-y-3">
            <NuxtLink
              v-for="product in storeOverview.bestProducts"
              :key="product.id"
              :to="getProductRoutePath(product)"
              class="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/40 px-4 py-3 transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              @click="setCaptureStoreProductClicked(product, 'store_best_products')"
            >
              <div>
                <p class="text-sm font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-base">{{ product.store }}</p>
                <p class="mt-1 text-sm text-white/90 sm:text-base">{{ product.title }}</p>
                <p v-if="getProductValidityText(product.valid_from, product.valid_to)" class="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/50">
                  {{ getProductValidityText(product.valid_from, product.valid_to) }}
                </p>
              </div>

              <div class="flex items-center gap-3">
                <p class="font-display text-2xl font-semibold italic text-white">
                  ${{ storeOverview.getFormattedPrice(product.price_num) }}
                </p>
                <ArrowUpRight class="h-4 w-4 text-white/70" />
              </div>
            </NuxtLink>
          </div>

          <p v-else class="mt-4 text-sm text-white/70">Aucun lien produit disponible pour le moment.</p>
        </section>
      </section>
    </main>
  </div>
</template>
