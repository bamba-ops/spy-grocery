<script setup lang="ts">
import { ArrowRight, ArrowUpRight } from 'lucide-vue-next'
import { getRouteParam } from '#shared/utils/getRouteParam'
import { ONBOARDING_MAX_STEP } from '#shared/utils/onboarding'
import { getProductRoutePath } from '#shared/utils/productRoute'
import { toSlug } from '#shared/utils/toSlug'
import { toPageError } from '#shared/utils/toPageError'
import type { SearchProduct } from '#shared/types'
import { useProductDetailsStore } from '~/stores/productDetails'
import { useListsStore } from '~/stores/lists'
import { useOnboardingStore } from '~/stores/onboarding'
import { useAuthStore } from '~/stores/auth'

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
const authStore = useAuthStore()
const { getImageDisplay } = useProducts()
const onboardingStepNumbers = [1, 2, 3]

type ProductComparisonRow = {
  type: 'product'
  key: string
  product: SearchProduct
  rankIndex: number
  rankTotal: number
  isCurrent: boolean
}

type CtaComparisonRow = {
  type: 'cta'
  key: string
}

type ComparisonRow = ProductComparisonRow | CtaComparisonRow

const loadingShimmerBaseClass = "relative overflow-hidden border border-white/10 bg-white/5 before:absolute before:inset-0 before:content-[''] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:bg-[length:200%_100%] before:animate-shimmer"
const loadingShimmerPanelClass = `${loadingShimmerBaseClass} rounded-2xl`
const loadingShimmerLineClass = `${loadingShimmerBaseClass} rounded`
const loadingShimmerPillClass = `${loadingShimmerBaseClass} rounded-full`
const INITIAL_VISIBLE_PRODUCT_COUNT = 5
const LOAD_MORE_PRODUCT_COUNT = 5
const visibleComparisonProductsCount = ref(INITIAL_VISIBLE_PRODUCT_COUNT)

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

const getNotifySpecialNextPath = () => {
  const params = new URLSearchParams()
  params.set('intent', 'notify-special')

  const productTitle = (productDetails.product?.title || '').trim()

  if (productTitle) {
    params.set('q', productTitle)
  }

  const storeParam = productDetails.product?.store_id
    || productDetails.product?.store_slug
    || storeSlug.value

  if (storeParam) {
    params.set('store', storeParam)
  }

  return `/search?${params.toString()}`
}

const setNotifySpecialFromProductCta = async () => {
  const nextPath = getNotifySpecialNextPath()

  // Debug log intentionally kept while notify-special CTA routing is monitored.
  console.log('[notify-special] product CTA clicked, redirecting to login:', {
    productId: productDetails.product?.id || null,
    nextPath
  })

  await navigateTo(`/login?next=${encodeURIComponent(nextPath)}`)
}

const getShowGuestProductCta = computed(() => {
  return authStore.isReady && !authStore.user
})

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

const setAddComparisonProductToList = (product: SearchProduct, isCurrent: boolean) => {
  if (isCurrent) {
    void setAddCurrentProductToList()
    return
  }

  lists.setProductInCurrentList(product)
}

const getPriceSortValue = (price: number | null) => {
  return typeof price === 'number' ? price : Number.POSITIVE_INFINITY
}

const sortedComparisonProducts = computed(() => {
  const mergedProducts = [
    ...(productDetails.product ? [productDetails.product] : []),
    ...productDetails.otherStoreProducts
  ]
  const deduplicatedProducts = new Map<string, SearchProduct>()

  for (const product of mergedProducts) {
    if (!deduplicatedProducts.has(product.id)) {
      deduplicatedProducts.set(product.id, product)
    }
  }

  return [...deduplicatedProducts.values()].sort((a, b) => {
    const priceDiff = getPriceSortValue(a.price_num) - getPriceSortValue(b.price_num)

    if (priceDiff !== 0) {
      return priceDiff
    }

    return a.store.localeCompare(b.store)
  })
})

const visibleComparisonProducts = computed(() => {
  return sortedComparisonProducts.value.slice(0, visibleComparisonProductsCount.value)
})

const getRemainingComparisonProductsCount = computed(() => {
  return Math.max(sortedComparisonProducts.value.length - visibleComparisonProductsCount.value, 0)
})

const getHasMoreComparisonProducts = computed(() => {
  return getRemainingComparisonProductsCount.value > 0
})

const getLoadMoreBatchCount = computed(() => {
  return Math.min(LOAD_MORE_PRODUCT_COUNT, getRemainingComparisonProductsCount.value)
})

const setShowMoreComparisonProducts = () => {
  const currentCount = visibleComparisonProductsCount.value
  const nextCount = Math.min(
    sortedComparisonProducts.value.length,
    currentCount + LOAD_MORE_PRODUCT_COUNT
  )

  // Debug log intentionally kept while progressive ranking disclosure is monitored.
  console.log('[comparison] load more clicked:', {
    previousVisibleCount: currentCount,
    nextVisibleCount: nextCount,
    totalCount: sortedComparisonProducts.value.length
  })

  visibleComparisonProductsCount.value = nextCount
}

const getComparisonProductImageDisplay = (product: SearchProduct) => {
  return getImageDisplay(product.image_url || null, product.title)
}

const getCurrentProductRankTier = (rankIndex: number, rankTotal: number) => {
  if (rankTotal <= 1) {
    return 'top'
  }

  const rankRatio = rankIndex / (rankTotal - 1)

  if (rankRatio <= 0.33) {
    return 'top'
  }

  if (rankRatio >= 0.67) {
    return 'bottom'
  }

  return 'middle'
}

const getCurrentProductGlowClasses = (rankIndex: number, rankTotal: number) => {
  const tier = getCurrentProductRankTier(rankIndex, rankTotal)

  if (tier === 'top') {
    return 'border-emerald-300/60 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(110,231,183,0.35),0_0_30px_rgba(16,185,129,0.35)]'
  }

  if (tier === 'bottom') {
    return 'border-rose-300/60 bg-rose-500/10 shadow-[0_0_0_1px_rgba(251,113,133,0.35),0_0_30px_rgba(244,63,94,0.35)]'
  }

  return 'border-amber-300/60 bg-amber-500/10 shadow-[0_0_0_1px_rgba(252,211,77,0.35),0_0_30px_rgba(245,158,11,0.35)]'
}

const getCurrentProductAccentClasses = (rankIndex: number, rankTotal: number) => {
  const tier = getCurrentProductRankTier(rankIndex, rankTotal)

  if (tier === 'top') {
    return 'bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
  }

  if (tier === 'bottom') {
    return 'bg-rose-300 shadow-[0_0_12px_rgba(251,113,133,0.8)]'
  }

  return 'bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
}

const comparisonRows = computed<ComparisonRow[]>(() => {
  const rankedProducts = sortedComparisonProducts.value
  const visibleProducts = visibleComparisonProducts.value

  if (visibleProducts.length === 0) {
    return []
  }

  const rows: ComparisonRow[] = []
  const currentProductId = productDetails.product?.id || null
  const ctaInsertIndex = getShowGuestProductCta.value ? Math.ceil(visibleProducts.length / 2) : -1

  visibleProducts.forEach((product, visibleIndex) => {
    if (visibleIndex === ctaInsertIndex) {
      rows.push({
        type: 'cta',
        key: `cta-${visibleIndex}`
      })
    }

    const rankIndex = rankedProducts.findIndex((entry) => entry.id === product.id)

    rows.push({
      type: 'product',
      key: product.id,
      product,
      rankIndex,
      rankTotal: rankedProducts.length,
      isCurrent: product.id === currentProductId
    })
  })

  if (getShowGuestProductCta.value && ctaInsertIndex >= visibleProducts.length) {
    rows.push({
      type: 'cta',
      key: 'cta-end'
    })
  }

  return rows
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
  const prices = sortedComparisonProducts.value
    .map((product) => product.price_num)
    .filter((price): price is number => typeof price === 'number')

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

watch(
  () => productDetails.product?.id,
  () => {
    visibleComparisonProductsCount.value = INITIAL_VISIBLE_PRODUCT_COUNT
  },
  { immediate: true }
)

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

      <div v-if="productDetails.loading" class="mt-8">
        <section class="rounded-[30px] border border-white/10 bg-black/60 p-3 sm:p-5 lg:p-6">
          <div class="space-y-3">
            <div :class="[loadingShimmerLineClass, 'h-3 w-32']"></div>
            <div :class="[loadingShimmerLineClass, 'h-8 w-full max-w-[380px]']"></div>
            <div :class="[loadingShimmerLineClass, 'h-3 w-24']"></div>
          </div>

          <div class="mt-4 space-y-3 sm:space-y-4">
            <article
              v-for="skeletonIndex in 4"
              :key="`comparison-skeleton-${skeletonIndex}`"
              class="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3 gap-y-2 rounded-xl border border-white/10 p-3 sm:rounded-2xl md:grid-cols-12 md:items-center md:gap-3 md:px-5 md:py-5"
            >
              <div :class="[loadingShimmerPanelClass, 'row-span-2 h-16 w-16 sm:h-16 sm:w-16 md:col-span-2 md:row-span-1 md:h-20 md:w-20']"></div>

              <div class="min-w-0 md:col-span-3">
                <div :class="[loadingShimmerLineClass, 'h-3 w-24']"></div>
                <div :class="[loadingShimmerLineClass, 'mt-2 h-3 w-full max-w-[180px]']"></div>
              </div>

              <div :class="[loadingShimmerLineClass, 'h-8 w-24 justify-self-end md:col-span-2 md:justify-self-start']"></div>
              <div :class="[loadingShimmerLineClass, 'col-span-2 h-3 w-16 md:col-span-2 md:justify-self-center']"></div>
              <div :class="[loadingShimmerPillClass, 'col-start-3 row-start-2 h-6 w-16 justify-self-end md:col-span-1 md:row-auto md:justify-self-center']"></div>

              <div class="col-span-3 mt-1 flex gap-2 md:col-span-2 md:mt-0 md:justify-end">
                <div :class="[loadingShimmerPillClass, 'h-9 w-20 sm:h-10 sm:w-24']"></div>
                <div :class="[loadingShimmerPillClass, 'h-9 w-20 sm:h-10 sm:w-24']"></div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div
        v-else-if="productDetails.error"
        class="mt-6 rounded-2xl border border-white/20 bg-white/5 p-4 text-sm text-white/80"
      >
        {{ productDetails.error }}
      </div>

      <section v-else-if="productDetails.product" class="mt-8 flex flex-col gap-8 sm:gap-10">
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

        <section
          v-if="sortedComparisonProducts.length > 0"
          class="rounded-[30px] border border-white/10 bg-black/60 p-3 sm:p-5 lg:p-6"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Autres promos</p>
              <h2 class="mt-2 font-display text-2xl font-semibold italic tracking-tight text-white sm:text-3xl lg:text-4xl">
                Classement du moins cher au plus cher
              </h2>
            </div>

            <span class="text-[10px] uppercase tracking-[0.35em] text-white/60">
              {{ sortedComparisonProducts.length }} magasins
            </span>
          </div>

          <div class="mt-6 hidden grid-cols-12 gap-4 px-4 text-[10px] uppercase tracking-[0.28em] text-white/55 md:grid">
            <p class="col-span-2">Produit</p>
            <p class="col-span-3">Magasin</p>
            <p class="col-span-2">Prix</p>
            <p class="col-span-2 text-center">Prix unite</p>
            <p class="col-span-1 text-center">Status</p>
            <p class="col-span-2 text-right">Action</p>
          </div>

          <TransitionGroup
            tag="div"
            class="mt-4 space-y-3 sm:space-y-4"
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="translate-y-2 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
          >
            <article
              v-for="row in comparisonRows"
              :key="row.key"
              :class="[
                'grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3 gap-y-2 rounded-xl border p-3 transition sm:rounded-2xl md:grid-cols-12 md:items-center md:gap-3 md:px-5 md:py-5',
                row.type === 'product'
                  ? (row.isCurrent
                      ? getCurrentProductGlowClasses(row.rankIndex, row.rankTotal)
                      : 'border-white/10 bg-white/5 hover:bg-white/[0.07]')
                  : 'border-white/20 bg-black/70'
              ]"
            >
              <template v-if="row.type === 'product'">
                <div class="row-span-2 md:col-span-2 md:row-span-1">
                  <NuxtLink
                    :to="getProductRoutePath(row.product)"
                    class="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-black transition hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-16 sm:w-16 md:h-20 md:w-20"
                    :aria-label="`Ouvrir ${row.product.title}`"
                  >
                    <template v-if="getComparisonProductImageDisplay(row.product).type === 'url'">
                      <img
                        :src="getComparisonProductImageDisplay(row.product).value"
                        :alt="row.product.title"
                        class="h-full w-full object-contain brightness-90 contrast-110"
                        loading="lazy"
                      >
                    </template>

                    <template v-else>
                      <span class="text-2xl text-white/70">{{ getComparisonProductImageDisplay(row.product).value }}</span>
                    </template>

                    <span
                      v-if="row.isCurrent"
                      :class="[
                        'absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full',
                        getCurrentProductAccentClasses(row.rankIndex, row.rankTotal)
                      ]"
                    />
                  </NuxtLink>
                </div>

                <div class="min-w-0 md:col-span-3">
                  <div class="flex items-center gap-3">
                    <NuxtLink
                      v-if="row.product.store_slug"
                      :to="`/magasins/${encodeURIComponent(row.product.store_slug)}`"
                      class="text-xs font-semibold uppercase tracking-[0.18em] text-white/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-sm md:text-base"
                    >
                      {{ row.product.store }}
                    </NuxtLink>
                    <p v-else class="text-xs font-semibold uppercase tracking-[0.18em] text-white/85 sm:text-sm md:text-base">
                      {{ row.product.store }}
                    </p>

                    <NuxtLink
                      :to="getProductRoutePath(row.product)"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      :aria-label="`Ouvrir ${row.product.title}`"
                    >
                      <ArrowUpRight class="h-4 w-4" />
                    </NuxtLink>
                  </div>

                  <p class="mt-1 text-[11px] leading-tight text-white/65 md:mt-2 md:text-xs">{{ row.product.title }}</p>
                </div>

                <p class="self-start text-right font-display text-2xl font-semibold italic tracking-tight text-white sm:text-3xl md:col-span-2 md:text-left">
                  {{ getCadPriceLabel(row.product.price_num) }}
                </p>

                <p class="col-span-2 text-[11px] text-white/70 sm:text-sm md:col-span-2 md:text-center">
                  {{ row.product.price_text || 'N/A' }}
                </p>

                <div class="col-start-3 row-start-2 flex justify-end md:col-span-1 md:flex md:justify-center">
                  <span
                    v-if="row.rankIndex === 0"
                    class="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.26em] text-white"
                  >
                    Meilleur
                  </span>
                  <span
                    v-else
                    class="inline-flex rounded-full border border-white/15 px-3 py-1 text-[9px] uppercase tracking-[0.26em] text-white/70"
                  >
                    Alt
                  </span>
                </div>

                <div class="col-span-3 mt-1 flex flex-wrap gap-2 md:col-span-2 md:mt-0 md:justify-end">
                  <a
                    v-if="getSafeProductUrl(row.product.url)"
                    :href="getSafeProductUrl(row.product.url)!"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex h-9 items-center justify-center rounded-full border border-white/20 px-3 text-[9px] uppercase tracking-[0.3em] text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-10 sm:px-4 sm:text-[10px]"
                  >
                    Magasin
                  </a>

                  <button
                    type="button"
                    class="inline-flex h-9 items-center justify-center rounded-full border border-white/20 bg-white px-3 text-[9px] uppercase tracking-[0.3em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-10 sm:px-4 sm:text-[10px]"
                    @click="setAddComparisonProductToList(row.product, row.isCurrent)"
                  >
                    Ajouter
                  </button>
                </div>
              </template>

              <template v-else>
                <div class="col-span-3 md:col-span-8">
                  <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Alerte specials</p>
                  <p class="mt-2 text-sm leading-relaxed text-white/80 sm:text-base">
                    Gardez ce produit en tete et recevez un rappel quand il revient en special.
                  </p>
                </div>

                <div class="col-span-3 flex flex-wrap gap-2 md:col-span-4 md:justify-end">
                  <button
                    type="button"
                    class="inline-flex h-9 items-center justify-center rounded-full border border-white/20 bg-white px-3 text-[9px] uppercase tracking-[0.3em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-10 sm:px-4 sm:text-[10px]"
                    @click="setAddCurrentProductToList"
                  >
                    Ajouter a ma liste
                  </button>

                  <button
                    type="button"
                    class="inline-flex h-9 items-center justify-center rounded-full border border-white/20 px-3 text-[9px] uppercase tracking-[0.3em] text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-10 sm:px-4 sm:text-[10px]"
                    @click="setNotifySpecialFromProductCta"
                  >
                    Notifie-moi
                  </button>
                </div>
              </template>
            </article>
          </TransitionGroup>

          <div v-if="getHasMoreComparisonProducts" class="mt-4">
            <div class="pointer-events-none h-8 rounded-b-2xl bg-gradient-to-b from-transparent to-black/70"></div>
            <div class="mt-3 flex justify-center">
              <button
                type="button"
                class="inline-flex h-10 items-center justify-center rounded-full border border-white/20 px-5 text-[10px] uppercase tracking-[0.32em] text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                @click="setShowMoreComparisonProducts"
              >
                Voir {{ getLoadMoreBatchCount }} produits de plus
              </button>
            </div>
            <p class="mt-2 text-center text-[10px] uppercase tracking-[0.3em] text-white/50">
              {{ getRemainingComparisonProductsCount }} restants
            </p>
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
