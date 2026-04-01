<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { getRouteParam } from '#shared/utils/getRouteParam'
import { getProductRoutePath } from '#shared/utils/productRoute'
import { toPageError } from '#shared/utils/toPageError'
import { useProductDetailsStore } from '~/stores/productDetails'
import { useListsStore } from '~/stores/lists'

definePageMeta({
  layout: 'bottom-nav',
  middleware: 'onboarding'
})

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://spygrocery.com').replace(/\/$/, '')
const productDetails = useProductDetailsStore()
const lists = useListsStore()

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

const setAddCurrentProductToList = () => {
  if (!productDetails.product) {
    return
  }

  lists.setProductInCurrentList(productDetails.product)
}

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

  const priceValue = productDetails.getFormattedPrice(product.price_num)
  return `Consultez ${product.title} chez ${product.store}, prix actuel ${priceValue}$, et comparez les options dans les autres magasins.`
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
              <div v-else class="flex h-full w-full items-center justify-center text-sm uppercase tracking-[0.3em] text-white/60">Aucune image</div>
              <div class="pointer-events-none absolute inset-0 bg-black/35"></div>
            </div>
          </div>

          <div class="flex flex-col">
            <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Details du produit</p>
            <h1 class="mt-2 font-display text-4xl font-semibold italic tracking-tight text-white sm:text-5xl">
              {{ productDetails.product.title }}
            </h1>

            <NuxtLink
              v-if="storePath"
              :to="storePath"
              class="mt-4 inline-flex h-9 items-center rounded-full border border-white/20 px-4 text-[10px] uppercase tracking-[0.3em] text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {{ productDetails.product.store }}
            </NuxtLink>

            <p v-else class="mt-4 text-sm text-white/80 sm:text-base">
              {{ productDetails.product.store }}
            </p>

            <p
              v-if="productDetails.product.brand"
              class="mt-2 text-[10px] uppercase tracking-[0.35em] text-white/60"
            >
              {{ productDetails.product.brand }}
            </p>

            <div class="mt-6">
              <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Prix actuel</p>
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
              <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Profil du produit</p>
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
                Ajouter a la liste
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
        </article>

        <section
          v-if="productDetails.getHasOtherStoreProducts"
          class="rounded-2xl border border-white/10 bg-black/60 p-4 sm:p-6"
        >
          <div class="flex items-center justify-between gap-4">
            <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white sm:text-4xl">
              Disponible dans d'autres magasins
            </h2>
            <span class="text-[10px] uppercase tracking-[0.35em] text-white/60">
              {{ productDetails.otherStoreProducts.length }} magasins
            </span>
          </div>

          <div class="mt-4 grid gap-4 sm:mt-6 sm:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="otherProduct in productDetails.otherStoreProducts"
              :key="otherProduct.id"
              class="relative rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <NuxtLink
                :to="getProductRoutePath(otherProduct)"
                class="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                :aria-label="`Ouvrir ${otherProduct.title}`"
              >
                <ArrowUpRight class="h-4 w-4" />
              </NuxtLink>

              <NuxtLink
                v-if="otherProduct.store_slug"
                :to="`/magasins/${encodeURIComponent(otherProduct.store_slug)}`"
                class="text-[10px] uppercase tracking-[0.35em] text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {{ otherProduct.store }}
              </NuxtLink>
              <p v-else class="text-[10px] uppercase tracking-[0.35em] text-white/60">
                {{ otherProduct.store }}
              </p>
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
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Autres magasins</p>
          <p class="mt-2 text-sm text-white/80 sm:text-base">
            Ce produit n'est pas disponible dans d'autres magasins pour le moment.
          </p>
        </section>
      </section>
    </main>
  </div>
</template>
