<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { ArrowRight, ArrowUpRight, X, ZoomIn } from 'lucide-vue-next'
import { getRouteParam } from '#shared/utils/getRouteParam'
import { getAnalyticsProductProperties } from '#shared/utils/analytics'
import { getProductValidityLabel } from '#shared/utils/productAvailability'
import { ONBOARDING_MAX_STEP } from '#shared/utils/onboarding'
import { getProductRoutePath } from '#shared/utils/productRoute'
import { toPageError } from '#shared/utils/toPageError'
import type { SearchProduct } from '#shared/types'
import type { AffiliateOffer } from '#shared/types/affiliate'
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
const siteUrl = (runtimeConfig.public.siteUrl || 'https://www.spygrocery.com').replace(/\/$/, '')
const productDetails = useProductDetailsStore()
const lists = useListsStore()
const onboardingStore = useOnboardingStore()
const authStore = useAuthStore()
const analytics = useAnalytics()
const onboardingStepNumbers = [1, 2, 3]
const lastProductPageViewKey = ref('')
const viewedAffiliateOfferIds = new Set<string>()

const zoomedImageUrl = ref<string | null>(null)
const openImageZoom = (url: string | null | undefined) => {
  if (url) {
    zoomedImageUrl.value = url
  }
}

const loadingShimmerBaseClass = "relative overflow-hidden border border-white/10 bg-white/5 before:absolute before:inset-0 before:content-[''] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:bg-[length:200%_100%] before:animate-shimmer"
const loadingShimmerPanelClass = `${loadingShimmerBaseClass} rounded-2xl`
const loadingShimmerLineClass = `${loadingShimmerBaseClass} rounded`
const loadingShimmerPillClass = `${loadingShimmerBaseClass} rounded-full`

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

const getSafeAffiliateUrl = (url: string) => {
  const trimmed = url.trim()
  if (!trimmed) return null
  if (!/^https?:\/\//i.test(trimmed)) return null
  return trimmed
}

// Delegations vers stores — logique metier centralisee
const setNotifySpecialFromProductCta = () => {
  if (productDetails.product) {
    analytics.capture('product_price_alert_clicked', getProductPageAnalyticsProperties(productDetails.product, 'product_page'))
  }
  return productDetails.setNotifySpecialFromProductCta(storeSlug.value || '')
}

const setAddCurrentProductToList = async () => {
  if (!productDetails.product) return

  const wasFirstProduct = lists.productList.length === 0

  await lists.setAddCurrentProductToList(productDetails.product, {
    isOnboardingContext: getIsOnboardingContext.value,
    analytics: setCaptureProductAddedToList
  })

  // Ouvre le panel si c'est le premier produit ajoute (hors onboarding qui redirige deja)
  if (wasFirstProduct && !getIsOnboardingContext.value) {
    lists.setShoppingListDrawerOpen()
  }
}

const setAddComparisonProductToList = (product: SearchProduct, isCurrent: boolean) => {
  return lists.setAddComparisonProductToList(product, isCurrent, {
    isOnboardingContext: getIsOnboardingContext.value,
    analytics: setCaptureProductAddedToList
  })
}

// Etat UI local (non partage)
const getShowGuestProductCta = computed(() => authStore.isReady && !authStore.user)
const getCurrentProductWasJustAdded = computed(() =>
  Boolean(productDetails.product && lists.lastAddedProductId === productDetails.product.id)
)
type ProductComparisonDisplayRow = {
  type: 'product'
  key: string
  product: SearchProduct
  rankIndex: number
  rankTotal: number
  isCurrent: boolean
}

const sortedComparisonProducts = computed(() => {
  return productDetails.getSortedComparisonProducts
})

const getRemainingComparisonProductsCount = computed(() => {
  return productDetails.getRemainingComparisonProductsCount
})

const getHasMoreComparisonProducts = computed(() => {
  return productDetails.getHasMoreComparisonProducts
})

const getLoadMoreBatchCount = computed(() => {
  return productDetails.getLoadMoreBatchCount
})

const setShowMoreComparisonProducts = () => {
  productDetails.setShowMoreComparisonProducts()
}

const getComparisonProductImageDisplay = (product: SearchProduct) => {
  return productDetails.getComparisonProductImageDisplay(product)
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
    return 'border-white/35 bg-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_28px_rgba(255,255,255,0.08)]'
  }

  if (tier === 'bottom') {
    return 'border-white/15 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]'
  }

  return 'border-white/24 bg-white/[0.05] shadow-[0_0_0_1px_rgba(255,255,255,0.1)]'
}

const getCurrentProductAccentClasses = (rankIndex: number, rankTotal: number) => {
  const tier = getCurrentProductRankTier(rankIndex, rankTotal)

  if (tier === 'top') {
    return 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]'
  }

  if (tier === 'bottom') {
    return 'bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]'
  }

  return 'bg-white/70 shadow-[0_0_10px_rgba(255,255,255,0.35)]'
}

const comparisonRows = computed<ProductComparisonDisplayRow[]>(() => {
  return productDetails.getComparisonRows(false).filter(
    (row): row is ProductComparisonDisplayRow => row.type === 'product'
  )
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

// Delegation vers store — logique domaine centralisee dans useProductDetailsStore
const marketAveragePrice = computed(() => productDetails.getMarketAveragePrice)
const currentProductRankLabel = computed(() => productDetails.getCurrentProductRankLabel)
const getIsCurrentProductBestPrice = computed(() => productDetails.getIsCurrentProductBestPrice)
const getHeroSavingsLabel = computed(() => productDetails.getHeroSavingsLabel)


const getProductPageAnalyticsProperties = (product: SearchProduct, source: string) => {
  const comparisonProducts = productDetails.getSortedComparisonProducts

  return {
    ...getAnalyticsProductProperties(product),
    is_authenticated: Boolean(authStore.user),
    price_text: product.price_text,
    valid_from: product.valid_from,
    valid_to: product.valid_to,
    has_image: Boolean(product.image_url),
    has_description: Boolean(product.description?.trim()),
    comparison_count: comparisonProducts.length,
    active_comparison_count: comparisonProducts.filter((entry) => entry.is_active).length,
    market_average_price: productDetails.getMarketAveragePrice,
    current_rank_label: productDetails.getCurrentProductRankLabel,
    source
  }
}

const getAffiliateOfferAnalyticsProperties = (offer: AffiliateOffer, source: string) => {
  const product = productDetails.product

  return {
    ...(product ? getProductPageAnalyticsProperties(product, source) : { source }),
    provider: offer.provider,
    provider_label: offer.providerLabel,
    offer_source: offer.offerSource,
    product_signature: offer.productSignature,
    affiliate_offer_id: offer.id,
    placement: 'product_affiliate_card'
  }
}

const setCaptureAffiliateOfferViewed = (offer: AffiliateOffer, source = 'product_affiliate_card') => {
  if (viewedAffiliateOfferIds.has(offer.id)) {
    return
  }

  viewedAffiliateOfferIds.add(offer.id)
  analytics.capture('affiliate_offer_viewed', getAffiliateOfferAnalyticsProperties(offer, source))
}

const setCaptureAffiliateOfferClicked = (offer: AffiliateOffer, source = 'product_affiliate_card') => {
  analytics.capture('affiliate_offer_clicked', getAffiliateOfferAnalyticsProperties(offer, source))

  console.log('[affiliate][amazon] offer clicked:', {
    offerId: offer.id,
    provider: offer.provider,
    offerSource: offer.offerSource
  })
}

const setCaptureProductCompareAnchorClicked = (source = 'product_page') => {
  const product = productDetails.product
  if (!product) return

  analytics.capture('product_compare_anchor_clicked', getProductPageAnalyticsProperties(product, source))
}

const setCaptureProductPageViewed = (source = 'product_page') => {
  const product = productDetails.product

  if (!product) {
    return
  }

  const viewKey = `${product.id}:${route.fullPath}`
  if (lastProductPageViewKey.value === viewKey) {
    return
  }

  lastProductPageViewKey.value = viewKey
  analytics.capture('product_page_viewed', getProductPageAnalyticsProperties(product, source))
}

const setCaptureProductStoreOutboundClicked = (
  product: SearchProduct,
  destinationUrl: string,
  source = 'product_page'
) => {
  analytics.capture('product_store_outbound_clicked', {
    ...getProductPageAnalyticsProperties(product, source),
    destination_url: destinationUrl
  })
}

const setCaptureProductAddedToList = (product: SearchProduct, source = 'product_page') => {
  analytics.capture('product_added_to_list', getProductPageAnalyticsProperties(product, source))
}

const productHeroMetaChips = computed(() => {
  const product = productDetails.product
  if (!product) {
    return []
  }

  const chips = [] as string[]

  if (product.brand) {
    chips.push(product.brand)
  }

  if (product.uom) {
    chips.push(product.uom)
  }

  return chips
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

const classementRef = ref<HTMLElement | null>(null)
let hasScrolledToComparison = false

onMounted(() => {
  setCaptureProductPageViewed()

  if (import.meta.client) {
    useIntersectionObserver(classementRef, (entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting && !hasScrolledToComparison && productDetails.product) {
        hasScrolledToComparison = true
        analytics.capture('product_page_scrolled_to_comparison', getProductPageAnalyticsProperties(productDetails.product, 'product_page'))
      }
    })
  }

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

// Helpers UI locaux (formatage presentationnel)
const getCadPriceLabel = (price: number | null) => {
  const formattedPrice = productDetails.getFormattedPrice(price)
  if (formattedPrice === 'N/A') return formattedPrice
  return `${formattedPrice} $ CA`
}

const getProductValidityText = (product: SearchProduct | null | undefined) => {
  if (!product) return null
  return getProductValidityLabel(product.valid_from, product.valid_to)
}

const getDisplayProductPrice = (product: SearchProduct | null | undefined) => {
  if (!product || !product.is_active) return null
  return product.price_num
}

const getComparisonStatusLabel = (product: SearchProduct, rankIndex: number) => {
  if (!product.is_active) return 'Terminee'
  if (rankIndex === 0) return 'Meilleur prix'
  return 'En cours'
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

  if (!product.is_active) {
    return `Consultez ${product.title} chez ${product.store}, les dates de validite de cette promo et les options encore en cours dans les autres magasins.`
  }

  const priceLabel = getCadPriceLabel(getDisplayProductPrice(product))
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
      price: typeof getDisplayProductPrice(product) === 'number' ? getDisplayProductPrice(product) : undefined,
      priceValidUntil: product.is_active && product.valid_to ? product.valid_to.slice(0, 10) : undefined,
      url: canonicalUrl.value,
      availability: product.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
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
  async ([nextStoreSlug, nextProductSlug], [prevStoreSlug, prevProductSlug]) => {
    if (nextStoreSlug === prevStoreSlug && nextProductSlug === prevProductSlug) {
      return
    }

    await loadProductPage(nextStoreSlug, nextProductSlug)
    setCaptureProductPageViewed('product_page_route_change')
  },
  { immediate: false }
)

watch(
  () => productDetails.getAffiliateOffers.map((offer) => offer.id).join('|'),
  () => {
    productDetails.getAffiliateOffers.forEach((offer) => {
      setCaptureAffiliateOfferViewed(offer)
    })
  },
  {
    immediate: true
  }
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

      <div v-if="productDetails.loading" class="mt-8 flex flex-col gap-8 sm:gap-10" aria-busy="true">
        <section class="overflow-hidden rounded-[30px] border border-white/10 bg-black/60">
          <div class="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:p-8">
            <div class="order-2 lg:order-1">
              <div class="flex flex-wrap gap-2">
                <div :class="[loadingShimmerPillClass, 'h-7 w-20']"></div>
                <div :class="[loadingShimmerPillClass, 'h-7 w-36']"></div>
                <div :class="[loadingShimmerPillClass, 'h-7 w-48']"></div>
              </div>

              <div class="mt-5 space-y-3">
                <div :class="[loadingShimmerLineClass, 'h-10 w-full max-w-[640px] sm:h-12']"></div>
                <div :class="[loadingShimmerLineClass, 'h-10 w-4/5 max-w-[540px] sm:h-12']"></div>
                <div :class="[loadingShimmerLineClass, 'h-4 w-full max-w-[520px]']"></div>
              </div>

              <div class="mt-6 flex flex-wrap gap-2">
                <div :class="[loadingShimmerPillClass, 'h-7 w-28']"></div>
                <div :class="[loadingShimmerPillClass, 'h-7 w-20']"></div>
              </div>

              <div class="mt-8">
                <div :class="[loadingShimmerLineClass, 'h-3 w-32']"></div>
                <div :class="[loadingShimmerLineClass, 'mt-3 h-12 w-48 sm:h-14']"></div>
                <div :class="[loadingShimmerLineClass, 'mt-3 h-3 w-full max-w-[420px]']"></div>
                <div :class="[loadingShimmerLineClass, 'mt-2 h-4 w-40']"></div>
              </div>

              <div class="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div :class="[loadingShimmerLineClass, 'h-3 w-56']"></div>
                <div :class="[loadingShimmerLineClass, 'mt-3 h-5 w-full max-w-[360px]']"></div>
                <div :class="[loadingShimmerLineClass, 'mt-2 h-4 w-40']"></div>
              </div>

              <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <div :class="[loadingShimmerPillClass, 'h-12 w-full sm:w-64']"></div>
                <div :class="[loadingShimmerPillClass, 'h-10 w-44']"></div>
                <div :class="[loadingShimmerPillClass, 'h-10 w-40']"></div>
              </div>
            </div>

            <div class="order-1 lg:order-2">
              <div :class="[loadingShimmerPanelClass, 'mx-auto aspect-square w-full max-w-[280px] rounded-[28px] sm:max-w-[340px] lg:max-w-none']"></div>
            </div>
          </div>
        </section>

        <section class="relative overflow-hidden rounded-[30px] border border-[#ff9900]/20 bg-[radial-gradient(circle_at_12%_0%,rgba(255,153,0,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-4 sm:p-6 lg:p-7">
          <div class="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[#ff9900]/10 blur-3xl"></div>
          <div class="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div class="lg:max-w-3xl">
              <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div :class="[loadingShimmerPanelClass, 'h-13 w-32 rounded-2xl bg-white/80 sm:h-14 sm:w-36']"></div>
                <div :class="[loadingShimmerPillClass, 'h-7 w-32']"></div>
                <div :class="[loadingShimmerPillClass, 'h-7 w-full max-w-64 border-[#ff9900]/25 bg-[#ff9900]/10']"></div>
              </div>

              <div class="mt-6 space-y-3">
                <div :class="[loadingShimmerLineClass, 'h-9 w-full max-w-[720px] sm:h-11']"></div>
                <div :class="[loadingShimmerLineClass, 'h-9 w-3/4 max-w-[560px] sm:h-11']"></div>
                <div :class="[loadingShimmerLineClass, 'h-4 w-full max-w-[620px]']"></div>
                <div :class="[loadingShimmerLineClass, 'h-4 w-4/5 max-w-[520px]']"></div>
              </div>
            </div>

            <div :class="[loadingShimmerPillClass, 'h-12 w-full shrink-0 bg-[#ff9900]/30 sm:w-56 lg:mb-1']"></div>
          </div>
        </section>

        <section class="rounded-[30px] border border-white/10 bg-black/60 p-4 sm:p-5 lg:p-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div :class="[loadingShimmerLineClass, 'h-3 w-40']"></div>
              <div :class="[loadingShimmerLineClass, 'mt-3 h-8 w-full max-w-[420px]']"></div>
              <div :class="[loadingShimmerLineClass, 'mt-3 h-4 w-full max-w-[480px]']"></div>
            </div>
            <div :class="[loadingShimmerLineClass, 'h-3 w-28']"></div>
          </div>

          <div class="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-3">
            <div v-for="summaryIndex in 3" :key="`comparison-summary-skeleton-${summaryIndex}`">
              <div :class="[loadingShimmerLineClass, 'h-3 w-28']"></div>
              <div :class="[loadingShimmerLineClass, 'mt-3 h-7 w-24']"></div>
              <div :class="[loadingShimmerLineClass, 'mt-2 h-3 w-32']"></div>
            </div>
          </div>

          <div class="mt-4 space-y-3 sm:space-y-4">
            <article
              v-for="skeletonIndex in 3"
              :key="`comparison-skeleton-${skeletonIndex}`"
              class="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 lg:grid lg:grid-cols-[112px_minmax(0,1.45fr)_minmax(0,0.95fr)_auto] lg:items-center lg:gap-6 lg:px-6 lg:py-6"
            >
              <div :class="[loadingShimmerPanelClass, 'h-20 w-20 rounded-xl sm:h-24 sm:w-24 lg:h-28 lg:w-28']"></div>

              <div class="mt-4 min-w-0 lg:mt-0">
                <div :class="[loadingShimmerLineClass, 'h-3 w-24']"></div>
                <div :class="[loadingShimmerLineClass, 'mt-3 h-7 w-full max-w-[260px]']"></div>
                <div :class="[loadingShimmerLineClass, 'mt-2 h-7 w-3/4 max-w-[220px]']"></div>
                <div class="mt-3 flex gap-2">
                  <div :class="[loadingShimmerPillClass, 'h-7 w-24']"></div>
                  <div :class="[loadingShimmerPillClass, 'h-7 w-32']"></div>
                </div>
              </div>

              <div class="mt-4 border-t border-white/10 pt-4 lg:mt-0 lg:border-t-0 lg:pt-0">
                <div :class="[loadingShimmerLineClass, 'h-3 w-28']"></div>
                <div :class="[loadingShimmerLineClass, 'mt-3 h-10 w-36']"></div>
                <div :class="[loadingShimmerLineClass, 'mt-2 h-4 w-40']"></div>
              </div>

              <div class="mt-4 flex flex-col gap-2 sm:flex-row lg:mt-0 lg:flex-col lg:items-end">
                <div :class="[loadingShimmerPillClass, 'h-11 w-full sm:w-36 lg:w-40']"></div>
                <div :class="[loadingShimmerPillClass, 'h-11 w-full sm:w-36 lg:w-40']"></div>
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

        <section class="overflow-hidden rounded-[30px] border border-white/10 bg-black/60">
          <div class="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:p-8">
            <div class="order-2 lg:order-1">
              <div class="flex flex-wrap items-center gap-2">
                <NuxtLink
                  v-if="storePath"
                  :to="storePath"
                  class="inline-flex rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  {{ productDetails.product.store }}
                </NuxtLink>
                <p v-else class="inline-flex rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-white/75">
                  {{ productDetails.product.store }}
                </p>

                <span class="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-white/85">
                  {{ productDetails.product.is_active ? 'Promo en cours' : 'Promotion terminee' }}
                </span>

                <span
                  v-if="currentProductRankLabel && sortedComparisonProducts.length > 1"
                  class="inline-flex rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-white/65"
                >
                  {{ productDetails.product.store }} est {{ currentProductRankLabel }} pour ce produit
                </span>
              </div>

              <h1 class="mt-4 font-display text-4xl font-semibold italic tracking-tight text-white sm:text-5xl lg:max-w-4xl">
                {{ productDetails.product.title }}
              </h1>

              <p
                v-if="productDetails.product.description"
                class="mt-4 max-w-3xl text-sm leading-relaxed text-white/75 sm:text-base"
              >
                {{ productDetails.product.description }}
              </p>

              <div v-if="productHeroMetaChips.length > 0" class="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.28em] text-white/60">
                <span
                  v-for="chip in productHeroMetaChips"
                  :key="`product-hero-chip-${chip}`"
                  class="rounded-full border border-white/15 px-3 py-1"
                >
                  {{ chip }}
                </span>
              </div>

              <div class="mt-8 flex flex-col gap-5">
                <!-- Prix + validité -->
                <div class="min-w-0">
                  <p class="text-[10px] uppercase tracking-[0.35em] text-white/55">
                    {{ productDetails.product.is_active ? 'Prix observe' : 'Disponibilite' }}
                  </p>
                  <p class="mt-2 font-display text-4xl font-semibold italic tracking-tight text-white sm:text-5xl">
                    {{ productDetails.product.is_active ? getCadPriceLabel(getDisplayProductPrice(productDetails.product)) : 'Promotion terminee' }}
                  </p>

                  <!-- Ligne meta : comparaison + validité -->
                  <p class="mt-3 text-[10px] uppercase tracking-[0.3em] text-white/50">
                    <template v-if="sortedComparisonProducts.length > 1">
                      Compare avec {{ sortedComparisonProducts.length }} magasins
                      <span v-if="getProductValidityText(productDetails.product)"> &bull; {{ getProductValidityText(productDetails.product) }}</span>
                    </template>
                    <template v-else-if="getProductValidityText(productDetails.product)">
                      {{ getProductValidityText(productDetails.product) }}
                    </template>
                  </p>

                  <p
                    v-if="productDetails.product.is_active && productDetails.product.price_text"
                    class="mt-2 text-sm text-white/70 sm:text-base"
                  >
                    {{ productDetails.product.price_text }}
                  </p>
                  <p
                    v-else-if="!productDetails.product.is_active"
                    class="mt-2 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base"
                  >
                    Le prix n'est plus affiche pour eviter de laisser croire que la promo est encore en cours.
                  </p>
                </div>

                <!-- Signal d'economie hero -->
                <div
                  v-if="productDetails.product.is_active && getHeroSavingsLabel"
                  class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <p class="text-[10px] uppercase tracking-[0.32em] text-white/55">
                    <template v-if="getIsCurrentProductBestPrice">Meilleur prix sur {{ getHeroSavingsLabel.totalStores }} magasins</template>
                    <template v-else>Tu peux payer moins cher ailleurs</template>
                  </p>
                  <p class="mt-1 font-display text-lg font-semibold italic tracking-tight text-white">
                    <template v-if="!getIsCurrentProductBestPrice">
                      Meilleur prix : {{ getHeroSavingsLabel.bestPrice }} chez {{ getHeroSavingsLabel.bestStore }}
                    </template>
                    <template v-else>
                      Meilleur offre observee parmi {{ getHeroSavingsLabel.totalStores }} enseignes
                    </template>
                  </p>
                  <p v-if="!getIsCurrentProductBestPrice" class="mt-0.5 text-sm text-white/65">
                    Economie possible : {{ getHeroSavingsLabel.savings }}
                  </p>
                </div>

                <!-- CTAs -->
                <div class="flex flex-col gap-2">
                  <!-- CTA principal -->
                  <button
                    v-if="productDetails.product.is_active"
                    type="button"
                    :class="[
                      'inline-flex h-12 w-full items-center justify-center rounded-full border border-white/20 bg-white px-6 text-[10px] uppercase tracking-[0.32em] text-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto',
                      getCurrentProductWasJustAdded
                        ? 'scale-[1.02] ring-2 ring-white/35 shadow-[0_0_24px_rgba(255,255,255,0.18)]'
                        : 'hover:bg-white/90'
                    ]"
                    @click="setAddCurrentProductToList"
                  >
                    {{ getCurrentProductWasJustAdded ? 'Ajoutee a la liste' : 'Ajouter a ma liste' }}
                  </button>

                  <a
                    v-else-if="sortedComparisonProducts.filter(p => p.is_active).length > 0"
                    href="#classement"
                    class="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/20 bg-white px-6 text-[10px] uppercase tracking-[0.32em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
                    @click="setCaptureProductCompareAnchorClicked('product_page_expired_cta')"
                  >
                    Voir les offres actives
                  </a>

                  <NuxtLink
                    v-else
                    :to="searchMoreProductsPath"
                    class="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/20 bg-white px-6 text-[10px] uppercase tracking-[0.32em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
                  >
                    Voir d'autres offres
                  </NuxtLink>

                  <!-- Micro-valeur compte -->
                  <p v-if="getShowGuestProductCta" class="text-[10px] text-white/45">
                    Gratuit, garde tes aubaines et reçois un rappel avant expiration.
                  </p>

                  <!-- CTAs secondaires -->
                  <div class="mt-1 flex flex-wrap gap-2">
                    <!-- Anchor scroll vers classement -->
                    <a
                      v-if="sortedComparisonProducts.length > 1"
                      href="#classement"
                      class="inline-flex h-10 items-center justify-center rounded-full border border-white/15 px-4 text-[10px] uppercase tracking-[0.28em] text-white/65 transition hover:border-white/25 hover:text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      @click="setCaptureProductCompareAnchorClicked('product_page')"
                    >
                      Voir le classement
                    </a>

                    <a
                      v-if="getSafeProductUrl(productDetails.product.url)"
                      :href="getSafeProductUrl(productDetails.product.url)!"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex h-10 items-center justify-center rounded-full border border-white/15 px-4 text-[10px] uppercase tracking-[0.28em] text-white/65 transition hover:border-white/25 hover:text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      @click="setCaptureProductStoreOutboundClicked(productDetails.product, getSafeProductUrl(productDetails.product.url)!, 'product_page')"
                    >
                      Voir en magasin
                    </a>

                    <button
                      v-if="getShowGuestProductCta"
                      type="button"
                      class="inline-flex h-10 items-center justify-center rounded-full border border-white/15 px-4 text-[10px] uppercase tracking-[0.28em] text-white/65 transition hover:border-white/25 hover:text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      @click="setNotifySpecialFromProductCta"
                    >
                      Creer une alerte prix
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="order-1 lg:order-2">
              <button
                type="button"
                :class="[
                  'group relative mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center overflow-hidden rounded-[28px] border bg-black p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:max-w-[340px] lg:max-w-none',
                  productDetails.product.is_active ? 'border-white/10 hover:border-white/30' : 'border-white/20 hover:border-white/40',
                  productDetails.getComparisonProductImageDisplay(productDetails.product).type === 'url' ? 'cursor-zoom-in' : ''
                ]"
                @click="openImageZoom(productDetails.getComparisonProductImageDisplay(productDetails.product).type === 'url' ? productDetails.getComparisonProductImageDisplay(productDetails.product).value : null)"
                aria-label="Agrandir l'image du produit"
              >
                <template v-if="productDetails.getComparisonProductImageDisplay(productDetails.product).type === 'url'">
                  <img
                    :src="productDetails.getComparisonProductImageDisplay(productDetails.product).value"
                    :alt="productDetails.product.title"
                    :class="[
                      'h-full w-full object-contain brightness-95 contrast-110 transition duration-300 group-hover:scale-105',
                      productDetails.product.is_active ? '' : 'grayscale opacity-65'
                    ]"
                    loading="lazy"
                  >
                  <div class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <ZoomIn class="h-8 w-8 text-white/90 drop-shadow-md" />
                  </div>
                </template>

                <template v-else>
                  <span :class="['text-7xl sm:text-8xl', productDetails.product.is_active ? 'text-white/70' : 'text-white/40']">
                    {{ productDetails.getComparisonProductImageDisplay(productDetails.product).value }}
                  </span>
                </template>

                <div class="pointer-events-none absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:bg-black/10"></div>
              </button>
            </div>
          </div>
        </section>

        <section
          v-if="productDetails.getHasAffiliateOffers"
          class="relative overflow-hidden rounded-[30px] border border-[#ff9900]/30 bg-[radial-gradient(circle_at_12%_0%,rgba(255,153,0,0.26),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.025))] p-4 shadow-[0_28px_90px_rgba(255,153,0,0.08)] sm:p-6 lg:p-7"
        >
          <div class="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[#ff9900]/20 blur-3xl"></div>
          <div class="pointer-events-none absolute bottom-0 left-8 h-px w-40 bg-gradient-to-r from-[#ff9900]/70 to-transparent"></div>

          <article
            v-for="offer in productDetails.getAffiliateOffers"
            :key="`affiliate-card-${offer.id}`"
            class="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
          >
            <div class="min-w-0 lg:max-w-3xl">
              <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div class="flex h-13 w-32 shrink-0 items-center justify-center rounded-2xl bg-white px-4 shadow-[0_18px_45px_rgba(0,0,0,0.25)] sm:h-14 sm:w-36">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Amazon_Prime_Logo.svg"
                    alt="Amazon Prime"
                    class="max-h-9 w-full object-contain"
                    loading="lazy"
                  >
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <span class="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[8px] uppercase tracking-[0.24em] text-white sm:text-[9px] sm:tracking-[0.26em]">
                    {{ offer.badgeLabel }}
                  </span>
                  <span class="inline-flex rounded-full border border-[#ff9900]/35 bg-[#ff9900]/10 px-3 py-1 text-[8px] uppercase tracking-[0.24em] text-[#ffd28a] sm:text-[9px] sm:tracking-[0.26em]">
                    Livraison possible dès demain avec Prime
                  </span>
                </div>
              </div>

              <h2 class="mt-5 font-display text-2xl font-semibold italic leading-tight tracking-tight text-white sm:text-4xl">
                Recevez {{ productDetails.product.title }} dès demain avec Prime.
              </h2>
              <p class="mt-3 max-w-2xl text-sm leading-relaxed text-white/72 sm:text-base">
                Pourquoi attendre ? Vérifiez si ce produit est disponible en livraison gratuite et ultra-rapide avant de finir votre liste.
              </p>
              <p class="mt-3 max-w-2xl text-xs leading-relaxed text-white/45">
                En tant que Partenaire Amazon, SpyGrocery peut realiser un benefice sur les achats admissibles.
              </p>
            </div>

            <a
              v-if="getSafeAffiliateUrl(offer.affiliateUrl)"
              :href="getSafeAffiliateUrl(offer.affiliateUrl)!"
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              class="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full border border-[#ffb84d] bg-[#ff9900] px-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-black shadow-[0_14px_35px_rgba(255,153,0,0.24)] transition hover:bg-[#ffad33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9900] focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto sm:min-w-[220px] lg:mb-1"
              @click="setCaptureAffiliateOfferClicked(offer)"
            >
              Voir sur Amazon
            </a>
          </article>
        </section>

        <section
          v-if="sortedComparisonProducts.length > 0"
          id="classement"
          ref="classementRef"
          class="rounded-[30px] border border-white/10 bg-black/60 p-4 sm:p-5 lg:p-6"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Comparaison de prix</p>
              <h2 class="mt-2 font-display text-2xl font-semibold italic tracking-tight text-white sm:text-3xl lg:text-4xl">
                Classement du moins cher au plus cher
              </h2>
              <p class="mt-2 text-sm text-white/65">
                Les promotions en cours apparaissent toujours avant celles qui ne sont plus valides.
              </p>
            </div>

            <span class="text-[10px] uppercase tracking-[0.35em] text-white/60">
              {{ sortedComparisonProducts.length }} magasins
            </span>
          </div>

          <!-- Resumé economie avant la liste -->
          <div
            v-if="getHeroSavingsLabel && !getIsCurrentProductBestPrice && productDetails.product?.is_active"
            class="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-3"
          >
            <div>
              <p class="text-[10px] uppercase tracking-[0.3em] text-white/50">Meilleur prix</p>
              <p class="mt-1 font-display text-xl font-semibold italic tracking-tight text-white">
                {{ getHeroSavingsLabel.bestPrice }}
              </p>
              <p class="mt-0.5 text-xs text-white/55">chez {{ getHeroSavingsLabel.bestStore }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-[0.3em] text-white/50">Prix actuel</p>
              <p class="mt-1 font-display text-xl font-semibold italic tracking-tight text-white/75">
                {{ getCadPriceLabel(getDisplayProductPrice(productDetails.product)) }}
              </p>
              <p class="mt-0.5 text-xs text-white/55">chez {{ productDetails.product?.store }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-[0.3em] text-white/50">Economie possible</p>
              <p class="mt-1 font-display text-xl font-semibold italic tracking-tight text-white">
                {{ getHeroSavingsLabel.savings }}
              </p>
              <p class="mt-0.5 text-xs text-white/55">en choisissant {{ getHeroSavingsLabel.bestStore }}</p>
            </div>
          </div>

          <div class="mt-6 hidden grid-cols-[112px_minmax(0,1.45fr)_minmax(0,0.95fr)_auto] gap-6 px-2 text-[10px] uppercase tracking-[0.28em] text-white/55 lg:grid">
            <p>Visuel</p>
            <p>Magasin et produit</p>
            <p>Prix et validite</p>
            <p class="text-right">Action</p>
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
                'rounded-2xl border p-4 transition sm:p-5 lg:grid lg:grid-cols-[112px_minmax(0,1.45fr)_minmax(0,0.95fr)_auto] lg:items-center lg:gap-6 lg:px-6 lg:py-6',
                row.isCurrent
                  ? getCurrentProductGlowClasses(row.rankIndex, row.rankTotal)
                  : (row.product.is_active
                      ? 'border-white/10 bg-white/5 hover:bg-white/[0.07]'
                      : 'border-white/15 bg-white/[0.03]')
              ]"
            >
              <button
                type="button"
                :class="[
                  'group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-black transition hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-24 sm:w-24 lg:h-28 lg:w-28',
                  getComparisonProductImageDisplay(row.product).type === 'url' ? 'cursor-zoom-in' : ''
                ]"
                :aria-label="`Agrandir l'image de ${row.product.title}`"
                @click="openImageZoom(getComparisonProductImageDisplay(row.product).type === 'url' ? getComparisonProductImageDisplay(row.product).value : null)"
              >
                <template v-if="getComparisonProductImageDisplay(row.product).type === 'url'">
                  <img
                    :src="getComparisonProductImageDisplay(row.product).value"
                    :alt="row.product.title"
                    :class="[
                      'h-full w-full object-contain brightness-90 contrast-110 transition duration-300 group-hover:scale-105',
                      row.product.is_active ? '' : 'grayscale opacity-65'
                    ]"
                    loading="lazy"
                  >
                  <div class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <ZoomIn class="h-6 w-6 text-white/90 drop-shadow-md" />
                  </div>
                </template>

                <template v-else>
                  <span :class="['text-3xl sm:text-4xl', row.product.is_active ? 'text-white/70' : 'text-white/40']">
                    {{ getComparisonProductImageDisplay(row.product).value }}
                  </span>
                </template>

                <span
                  v-if="row.isCurrent"
                  :class="[
                    'absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full',
                    getCurrentProductAccentClasses(row.rankIndex, row.rankTotal)
                  ]"
                />
              </button>

              <div class="mt-4 min-w-0 lg:mt-0">
                <div class="flex flex-wrap items-center gap-2">
                  <NuxtLink
                    v-if="row.product.store_slug"
                    :to="`/magasins/${encodeURIComponent(row.product.store_slug)}`"
                    class="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-xs lg:text-sm"
                  >
                    {{ row.product.store }}
                  </NuxtLink>
                  <p v-else class="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80 sm:text-xs lg:text-sm">
                    {{ row.product.store }}
                  </p>

                  <span
                    v-if="row.isCurrent"
                    class="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.26em] text-white"
                  >
                    Produit consulte
                  </span>

                  <span
                    v-else-if="row.rankIndex === 0 && row.product.is_active"
                    class="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.26em] text-white"
                  >
                    Meilleur prix
                  </span>
                </div>

                <div class="mt-3 flex items-start justify-between gap-3">
                  <NuxtLink
                    :to="getProductRoutePath(row.product)"
                    class="block min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    <h3
                      :title="row.product.title"
                      class="overflow-hidden font-display text-lg font-semibold italic leading-tight text-white transition hover:text-white/90 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] sm:text-xl lg:max-w-[22ch] lg:text-[1.65rem] lg:[-webkit-line-clamp:5]"
                    >
                      {{ row.product.title }}
                    </h3>
                  </NuxtLink>

                  <NuxtLink
                    :to="getProductRoutePath(row.product)"
                    class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    :aria-label="`Ouvrir ${row.product.title}`"
                  >
                    <ArrowUpRight class="h-4 w-4" />
                  </NuxtLink>
                </div>

                <div class="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.28em] text-white/55">
                  <span v-if="row.product.uom" class="rounded-full border border-white/15 px-3 py-1">{{ row.product.uom }}</span>
                  <span v-if="getProductValidityText(row.product)" class="rounded-full border border-white/15 px-3 py-1">{{ getProductValidityText(row.product) }}</span>
                </div>
              </div>

              <div class="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 lg:mt-0 lg:border-t-0 lg:pt-0">
                <div>
                  <p class="text-[10px] uppercase tracking-[0.32em] text-white/55">
                    {{ row.product.is_active ? 'Prix observe' : 'Disponibilite' }}
                  </p>
                  <p :class="['mt-2 font-display text-3xl font-semibold italic tracking-tight sm:text-4xl', row.product.is_active ? 'text-white' : 'text-white/65']">
                    {{ row.product.is_active ? getCadPriceLabel(getDisplayProductPrice(row.product)) : 'Promotion terminee' }}
                  </p>
                  <p :class="['mt-2 text-sm leading-relaxed', row.product.is_active ? 'text-white/70' : 'text-white/55']">
                    {{ row.product.is_active ? (row.product.price_text || 'Prix observe en magasin') : 'Prix masque pour eviter un signal trompeur.' }}
                  </p>
                </div>

                <div>
                  <span
                    :class="[
                      'inline-flex rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.26em] md:text-[10px]',
                      row.product.is_active
                        ? 'border border-white/20 bg-white/10 text-white'
                        : 'border border-white/15 text-white/70'
                    ]"
                  >
                    {{ getComparisonStatusLabel(row.product, row.rankIndex) }}
                  </span>
                </div>
              </div>

              <div class="mt-4 flex flex-col gap-2 sm:flex-row lg:mt-0 lg:flex-col lg:items-end">
                <a
                  v-if="getSafeProductUrl(row.product.url)"
                  :href="getSafeProductUrl(row.product.url)!"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/20 px-4 text-[10px] uppercase tracking-[0.3em] text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto lg:min-w-[156px]"
                  @click="setCaptureProductStoreOutboundClicked(row.product, getSafeProductUrl(row.product.url)!, 'product_comparison')"
                >
                  Voir en magasin
                </a>

                <button
                  type="button"
                  class="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/20 bg-white px-4 text-[10px] uppercase tracking-[0.3em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto lg:min-w-[156px]"
                  @click="setAddComparisonProductToList(row.product, row.isCurrent)"
                >
                  {{ row.isCurrent ? 'Ajouter ce produit' : 'Ajouter au panier' }}
                </button>
              </div>
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

        <!-- Bloc conversion final pour visiteurs non connectes -->
        <section
          v-if="getShowGuestProductCta && productDetails.product.is_active"
          class="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 sm:p-8"
        >
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/55">Compte gratuit</p>
          <h2 class="mt-3 font-display text-2xl font-semibold italic tracking-tight text-white sm:text-3xl">
            Garde cette aubaine, cree ta liste.
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-white/65 sm:text-base">
            Avec un compte gratuit : retrouve tes aubaines, construis ta liste d'epicerie et recois un rappel avant la fin de la promo.
          </p>

          <div class="mt-4 flex flex-wrap items-center gap-4">
            <ul class="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.28em] text-white/55">
              <li>✓ Sauvegarde tes aubaines</li>
              <li>✓ Cree ta liste d'epicerie</li>
              <li>✓ Rappel avant expiration de la promo</li>
            </ul>
          </div>

          <button
            type="button"
            class="mt-6 inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white px-8 text-[10px] uppercase tracking-[0.32em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click="setAddCurrentProductToList"
          >
            Ajouter a ma liste gratuitement
          </button>
        </section>
      </section>
    </main>

    <!-- Lightbox Zoom Image -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="zoomedImageUrl"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
          @click="zoomedImageUrl = null"
        >
          <div class="relative flex max-h-full max-w-5xl flex-col items-center" @click.stop>
            <button
              type="button"
              class="absolute -right-2 -top-12 sm:-right-12 sm:-top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/70 transition hover:bg-black/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              @click="zoomedImageUrl = null"
              aria-label="Fermer"
            >
              <X class="h-5 w-5" />
            </button>
            <img
              :src="zoomedImageUrl"
              class="max-h-[85vh] w-auto rounded-xl object-contain shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
              alt="Image du produit"
            >
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
