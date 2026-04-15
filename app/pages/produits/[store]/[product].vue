<script setup lang="ts">
import { ArrowRight, ArrowUpRight } from 'lucide-vue-next'
import { getRouteParam } from '#shared/utils/getRouteParam'
import { ONBOARDING_MAX_STEP } from '#shared/utils/onboarding'
import { getProductRoutePath } from '#shared/utils/productRoute'
import { toSlug } from '#shared/utils/toSlug'
import { toPageError } from '#shared/utils/toPageError'
import { useProductDetailsStore } from '~/stores/productDetails'
import { useListsStore } from '~/stores/lists'
import { useOnboardingStore } from '~/stores/onboarding'

definePageMeta({
  layout: 'bottom-nav',
  middleware: 'onboarding'
})

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://spygrocery.com').replace(/\/$/, '')
const productDetails = useProductDetailsStore()
const lists = useListsStore()
const onboardingStore = useOnboardingStore()
const { getImageDisplay } = useProducts()
const onboardingStepNumbers = [1, 2, 3]

// Keep the product onboarding banner aligned with step 2 visual language.
const onboardingDisplayStep = computed(() => {
  const current = Number.isInteger(onboardingStore.currentStep)
    ? onboardingStore.currentStep
    : 2

  return Math.max(2, Math.min(current, ONBOARDING_MAX_STEP))
})

const getIsOnboardingContext = computed(() => {
  return route.query.onboarding === '1'
})

const storeSlug = computed(() => {
  return getRouteParam(route.params.store as string | string[] | undefined)
})

const productSlug = computed(() => {
  return getRouteParam(route.params.product as string | string[] | undefined)
})

const getSafeProductUrl = (url: string | null) => {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (!/^https?:\/\//i.test(trimmed)) return null
  return trimmed
}

const setAddCurrentProductToList = async () => {
  if (!productDetails.product) {
    return
  }

  lists.setProductInCurrentList(productDetails.product)

  if (!getIsOnboardingContext.value) {
    return
  }

  const nextStoreSlug = productDetails.product.store_slug
    || toSlug(productDetails.product.store || '')

  if (!nextStoreSlug) {
    return
  }

  console.log('[onboarding] first product added, redirecting to store page:', {
    productId: productDetails.product.id,
    storeSlug: nextStoreSlug
  })

  await onboardingStore.setMoveToStoreStep(nextStoreSlug)
  await navigateTo(`/magasins/${encodeURIComponent(nextStoreSlug)}?onboarding=1`)
}

const currentProductImageDisplay = computed(() => {
  const product = productDetails.product
  return getImageDisplay(product?.image_url || null, product?.title || '')
})

const setAddOtherProductToList = (product: NonNullable<typeof productDetails.product>) => {
  lists.setProductInCurrentList(product)
}

const getPriceSortValue = (price: number | null) => {
  return typeof price === 'number' ? price : Number.POSITIVE_INFINITY
}

const sortedOtherStoreProducts = computed(() => {
  return [...productDetails.otherStoreProducts].sort((a, b) => {
    const priceDiff = getPriceSortValue(a.price_num) - getPriceSortValue(b.price_num)

    if (priceDiff !== 0) {
      return priceDiff
    }

    return a.store.localeCompare(b.store)
  })
})

const searchMoreProductsPath = computed(() => {
  const productTitle = productDetails.product?.title?.trim() || ''

  if (!productTitle) {
    return '/search'
  }

  const params = new URLSearchParams({
    q: productTitle
  })

  return `/search?${params.toString()}`
})

const marketAveragePrice = computed(() => {
  const prices = [
    productDetails.product?.price_num,
    ...sortedOtherStoreProducts.value.map((product) => product.price_num)
  ].filter((price): price is number => typeof price === 'number')

  if (prices.length === 0) {
    return null
  }

  const sum = prices.reduce((acc, price) => acc + price, 0)
  return sum / prices.length
})

const loadProductPage = async (
  nextStoreSlug: string,
  nextProductSlug: string,
  options: {
    throwOnError?: boolean
    serverRedirect?: boolean
  } = {}
) => {
  const response = await productDetails.getProductDetailsByRoute(
    nextStoreSlug,
    nextProductSlug,
    { throwOnError: options.throwOnError }
  )

  if (productDetails.shouldRedirect && productDetails.canonicalPath) {
    if (options.serverRedirect && import.meta.server) {
      await navigateTo(productDetails.canonicalPath, { redirectCode: 301 })
      return response || null
    }

    await navigateTo(productDetails.canonicalPath, { replace: true })
  }

  return response || null
}

const storePath = computed(() => {
  const product = productDetails.product

  if (!product) {
    return null
  }

  const resolvedStoreSlug = (product.store_slug || storeSlug.value || '').trim()

  if (!resolvedStoreSlug) {
    return null
  }

  return `/magasins/${encodeURIComponent(resolvedStoreSlug)}`
})

if (!storeSlug.value || !productSlug.value) {
  throw createError({
    statusCode: 400,
    message: 'Parametres de route produit invalides'
  })
}

try {
  await loadProductPage(storeSlug.value, productSlug.value, {
    throwOnError: true,
    serverRedirect: true
  })
} catch (error: unknown) {
  throw toPageError(error, 'Impossible de charger les details du produit.')
}

if (!productDetails.product) {
  throw createError({
    statusCode: 404,
    message: 'Produit introuvable'
  })
}

onMounted(() => {
  if (!getIsOnboardingContext.value || !productDetails.product) {
    return
  }

  // Debug log intentionally kept while onboarding guidance visibility is monitored.
  console.log('[onboarding] product page guidance shown:', {
    productId: productDetails.product.id,
    storeSlug: productDetails.product.store_slug || storeSlug.value,
    currentStep: onboardingStore.currentStep
  })
})

const canonicalPath = computed(() => {
  if (productDetails.canonicalPath) {
    return productDetails.canonicalPath
  }

  if (!productDetails.product) {
    return route.path
  }

  return getProductRoutePath(productDetails.product)
})

const canonicalUrl = computed(() => {
  const path = canonicalPath.value.startsWith('/') ? canonicalPath.value : `/${canonicalPath.value}`
  return `${siteUrl}${path}`
})

const getCadPriceLabel = (price: number | null) => {
  const formattedPrice = productDetails.getFormattedPrice(price)

  if (formattedPrice === 'N/A') {
    return formattedPrice
  }

  return `${formattedPrice} $ CA`
}

const getTimestamp = (value: string | null | undefined) => {
  if (!value) {
    return 0
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const getFormattedDate = (value: string | null) => {
  if (!value) {
    return 'N/A'
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A'
  }

  return parsedDate.toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const trustUpdatedAt = computed(() => {
  const allRows = [
    productDetails.product,
    ...productDetails.otherStoreProducts
  ].filter((row): row is NonNullable<typeof productDetails.product> => Boolean(row))

  if (allRows.length === 0) {
    return null
  }

  const latestRow = allRows.reduce((latest, current) => {
    return getTimestamp(current.scraped_at) > getTimestamp(latest.scraped_at)
      ? current
      : latest
  })

  return latestRow.scraped_at || null
})

const seoTitle = computed(() => {
  const product = productDetails.product

  if (!product) {
    return 'Details du produit - SpyGrocery'
  }

  return `${product.title} chez ${product.store} | Comparez les prix en epicerie | SpyGrocery`
})

const seoDescription = computed(() => {
  const product = productDetails.product

  if (!product) {
    return 'Consultez les details du produit et comparez les prix en epicerie au Quebec.'
  }

  const priceLabel = getCadPriceLabel(product.price_num)
  return `Consultez ${product.title} chez ${product.store}, prix actuel ${priceLabel}, et comparez les options dans les autres magasins.`
})

const seoJsonLd = computed(() => {
  const product = productDetails.product

  if (!product) {
    return []
  }

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.image_url ? [product.image_url] : undefined,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    description: product.description || undefined,
    sku: product.external_id || undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'CAD',
      price: typeof product.price_num === 'number' ? product.price_num : undefined,
      url: canonicalUrl.value,
      availability: product.on_sale === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'
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
        name: product.store,
        item: `${siteUrl}${storePath.value || ''}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: canonicalUrl.value
      }
    ]
  }

  return [productSchema, breadcrumbSchema]
})

watch(
  [storeSlug, productSlug],
  ([nextStoreSlug, nextProductSlug], [prevStoreSlug, prevProductSlug]) => {
    if (nextStoreSlug === prevStoreSlug && nextProductSlug === prevProductSlug) {
      return
    }

    void loadProductPage(nextStoreSlug, nextProductSlug)
  },
  { immediate: false }
)

useHead(() => {
  const productImage = productDetails.product?.image_url || null

  return {
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
        content: 'product'
      },
      {
        property: 'og:url',
        content: canonicalUrl.value
      },
      ...(productImage
        ? [
            {
              property: 'og:image',
              content: productImage
            }
          ]
        : []),
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
      },
      ...(productImage
        ? [
            {
              name: 'twitter:image',
              content: productImage
            }
          ]
        : [])
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
        Retour a la recherche
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

      <section v-else-if="productDetails.product" class="mt-8 space-y-8 sm:space-y-10">
        <section
          v-if="getIsOnboardingContext"
          class="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
        >
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Etape {{ onboardingDisplayStep }} sur {{ ONBOARDING_MAX_STEP }}</p>
          <h2 class="mt-2 font-display text-3xl font-semibold italic tracking-tight text-white sm:text-4xl">
            Continuez votre liste chez {{ productDetails.product.store }}
          </h2>
          <p class="mt-2 text-sm text-white/75 sm:text-base">
            Ajoutez ce produit ou voir d'autre magasin dans la page de recherche.
          </p>

          <div class="mt-4 flex items-center gap-2">
            <span
              v-for="step in onboardingStepNumbers"
              :key="`product-onboarding-step-${step}`"
              :class="[
                'h-[2px] w-12 rounded-full transition',
                step <= onboardingDisplayStep ? 'bg-white' : 'bg-white/20'
              ]"
            />
          </div>
        </section>

        <header class="rounded-[36px] border border-white/10 bg-white/5 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:p-6">
          <div class="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <div class="relative block aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-black sm:aspect-square">
              <template v-if="currentProductImageDisplay.type === 'url'">
                <img
                  :src="currentProductImageDisplay.value"
                  :alt="productDetails.product.title"
                  class="h-full w-full object-contain brightness-90 contrast-110"
                  loading="lazy"
                >
              </template>

              <template v-else>
                <div class="flex h-full w-full items-center justify-center text-5xl text-white/60">
                  {{ currentProductImageDisplay.value }}
                </div>
              </template>

              <div class="pointer-events-none absolute inset-0 bg-black/40"></div>
            </div>

            <div class="flex flex-col">
              <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Details du produit</p>
              <h1 class="mt-2 font-display text-4xl font-semibold italic tracking-tight text-white sm:text-5xl lg:text-6xl">
                {{ productDetails.product.title }}
              </h1>

              <p
                v-if="productDetails.product.brand"
                class="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/60"
              >
                {{ productDetails.product.brand }}
              </p>

              <NuxtLink
                v-if="storePath"
                :to="storePath"
                class="mt-5 inline-flex h-10 w-fit items-center rounded-full border border-white/20 px-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/90 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {{ productDetails.product.store }}
              </NuxtLink>

              <p v-else class="mt-5 text-base font-semibold text-white/90 sm:text-lg">
                {{ productDetails.product.store }}
              </p>

              <div class="mt-6 flex flex-wrap items-end gap-4">
                <div>
                  <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Prix actuel</p>
                  <p class="mt-2 font-display text-4xl font-semibold italic tracking-tight text-white sm:text-5xl">
                    {{ getCadPriceLabel(productDetails.product.price_num) }}
                  </p>
                </div>

                <p
                  v-if="productDetails.product.price_text"
                  class="pb-1 text-[10px] uppercase tracking-[0.32em] text-white/60"
                >
                  {{ productDetails.product.price_text }}
                </p>
              </div>

              <p
                v-if="productDetails.product.description"
                class="mt-5 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-base"
              >
                {{ productDetails.product.description }}
              </p>

              <div class="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white px-6 text-[10px] uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  @click="setAddCurrentProductToList"
                >
                  Ajouter a ma liste
                </button>

                <a
                  v-if="getSafeProductUrl(productDetails.product.url)"
                  :href="getSafeProductUrl(productDetails.product.url)!"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-6 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Voir en magasin
                </a>
              </div>
            </div>
          </div>

          <!--
          <article class="rounded-2xl border border-white/10 bg-black/60 p-5 sm:p-6">
            <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Confiance</p>
            <h2 class="mt-2 font-display text-3xl font-semibold italic tracking-tight text-white sm:text-4xl">
              Comment nous evaluons ce produit
            </h2>

            <div class="mt-4 grid gap-3 text-sm text-white/80 sm:grid-cols-2">
              <div class="rounded-xl border border-white/10 bg-white/5 p-3">
                <p class="text-[10px] uppercase tracking-[0.28em] text-white/55">Auteur</p>
                <p class="mt-2">Equipe SpyGrocery</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/5 p-3">
                <p class="text-[10px] uppercase tracking-[0.28em] text-white/55">Derniere mise a jour</p>
                <p class="mt-2">{{ getFormattedDate(trustUpdatedAt) }}</p>
              </div>
            </div>

            <div class="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
              <p class="text-[10px] uppercase tracking-[0.28em] text-white/55">Couverture</p>
              <p class="mt-2 leading-relaxed">
                Produit compare sur notre snapshot actif, avec mise a jour continue selon les collectes en epicerie.
              </p>
            </div>

            <div class="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
              <p class="text-[10px] uppercase tracking-[0.28em] text-white/55">Sources</p>
              <p class="mt-2 leading-relaxed">
                Prix publics observes sur les sites officiels des enseignes et verifies lors de l ingestion.
              </p>
            </div>
          </article>
          -->
        </header>

        <section
          v-if="sortedOtherStoreProducts.length > 0"
          class="rounded-[30px] border border-white/10 bg-black/60 p-4 sm:p-6"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Autres promos</p>
              <h2 class="mt-2 font-display text-3xl font-semibold italic tracking-tight text-white sm:text-4xl">
                Classement du moins cher au plus cher
              </h2>
            </div>

            <span class="text-[10px] uppercase tracking-[0.35em] text-white/60">
              {{ sortedOtherStoreProducts.length }} magasins
            </span>
          </div>

          <div class="mt-6 hidden grid-cols-12 gap-4 px-4 text-[10px] uppercase tracking-[0.28em] text-white/55 md:grid">
            <p class="col-span-4">Magasin</p>
            <p class="col-span-2">Prix</p>
            <p class="col-span-2 text-center">Prix unite</p>
            <p class="col-span-2 text-center">Status</p>
            <p class="col-span-2 text-right">Action</p>
          </div>

          <div class="mt-4 space-y-4">
            <article
              v-for="(otherProduct, index) in sortedOtherStoreProducts"
              :key="otherProduct.id"
              class="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/[0.07] md:grid-cols-12 md:items-center md:gap-3 md:px-5 md:py-5"
            >
              <div class="md:col-span-4">
                <div class="flex items-center gap-3">
                  <NuxtLink
                    v-if="otherProduct.store_slug"
                    :to="`/magasins/${encodeURIComponent(otherProduct.store_slug)}`"
                    class="text-sm font-semibold uppercase tracking-[0.18em] text-white/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-base"
                  >
                    {{ otherProduct.store }}
                  </NuxtLink>
                  <p v-else class="text-sm font-semibold uppercase tracking-[0.18em] text-white/85 sm:text-base">
                    {{ otherProduct.store }}
                  </p>

                  <NuxtLink
                    :to="getProductRoutePath(otherProduct)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    :aria-label="`Ouvrir ${otherProduct.title}`"
                  >
                    <ArrowUpRight class="h-4 w-4" />
                  </NuxtLink>
                </div>

                <p class="mt-2 text-xs text-white/65">{{ otherProduct.title }}</p>
              </div>

              <p class="font-display text-3xl font-semibold italic tracking-tight text-white md:col-span-2">
                {{ getCadPriceLabel(otherProduct.price_num) }}
              </p>

              <p class="text-sm text-white/70 md:col-span-2 md:text-center">
                {{ otherProduct.price_text || 'N/A' }}
              </p>

              <div class="md:col-span-2 md:flex md:justify-center">
                <span
                  v-if="index === 0"
                  class="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.26em] text-white"
                >
                  Meilleur prix
                </span>
                <span
                  v-else
                  class="inline-flex rounded-full border border-white/15 px-3 py-1 text-[9px] uppercase tracking-[0.26em] text-white/70"
                >
                  Alternative
                </span>
              </div>

              <div class="flex flex-wrap gap-2 md:col-span-2 md:justify-end">
                <a
                  v-if="getSafeProductUrl(otherProduct.url)"
                  :href="getSafeProductUrl(otherProduct.url)!"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-10 items-center justify-center rounded-full border border-white/20 px-4 text-[10px] uppercase tracking-[0.32em] text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Magasin
                </a>

                <button
                  type="button"
                  class="inline-flex h-10 items-center justify-center rounded-full border border-white/20 bg-white px-4 text-[10px] uppercase tracking-[0.32em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  @click="setAddOtherProductToList(otherProduct)"
                >
                  Ajouter
                </button>
              </div>
            </article>
          </div>

          <footer class="mt-10 flex flex-col gap-6 border-t border-white/10 pt-6 sm:flex-row sm:items-end sm:justify-between">
            <div class="max-w-2xl">
              <p class="text-[10px] uppercase tracking-[0.32em] text-white/55">Editorial insight</p>
              <p class="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
                Prix indexes quotidiennement. Ce classement met en avant les meilleures options observees pour ce produit dans les enseignes suivies.
              </p>
            </div>

            <div class="flex items-center gap-8">
              <div>
                <p class="text-[10px] uppercase tracking-[0.3em] text-white/55">Prix moyen</p>
                <p class="mt-2 font-display text-3xl font-semibold italic text-white">
                  {{ getCadPriceLabel(marketAveragePrice) }}
                </p>
              </div>
            </div>
          </footer>
        </section>

        <section v-else class="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Autres promos</p>
          <p class="mt-2 text-sm text-white/80 sm:text-base">
            Aucune autre promo observee pour ce produit pour le moment.
          </p>

          <NuxtLink
            :to="searchMoreProductsPath"
            class="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-[10px] uppercase tracking-[0.32em] text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Chercher d'autres produits
            <ArrowRight class="h-4 w-4" />
          </NuxtLink>
        </section>
      </section>
    </main>
  </div>
</template>
