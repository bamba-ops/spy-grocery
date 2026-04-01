<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { getProductRoutePath } from '#shared/utils/productRoute'
import { getRouteParam } from '#shared/utils/getRouteParam'
import { toPageError } from '#shared/utils/toPageError'

definePageMeta({
  layout: 'bottom-nav',
  middleware: 'onboarding'
})

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://spygrocery.com').replace(/\/$/, '')

const slug = getRouteParam(route.params.slug as string | string[] | undefined).trim()

if (!slug) {
  throw createError({
    statusCode: 400,
    message: 'Slug produit invalide'
  })
}

const { getBySlug } = useProducts()
let canonicalPath = route.path

try {
  const response = await getBySlug(slug)
  canonicalPath = getProductRoutePath(response.product)
} catch (error: unknown) {
  throw toPageError(error, 'Produit introuvable')
}

if (canonicalPath !== route.path) {
  if (import.meta.server) {
    await navigateTo(canonicalPath, { redirectCode: 301 })
  } else {
    await navigateTo(canonicalPath, { replace: true })
  }
}

const canonicalUrl = `${siteUrl}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`

useServerSeoMeta({
  title: 'Redirection produit - SpyGrocery',
  robots: 'noindex,follow'
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl
    }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-black font-sans text-white">
    <main class="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
      <section class="w-full rounded-[32px] border border-white/10 bg-white/5 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:p-10">
        <p class="text-[10px] uppercase tracking-[0.35em] text-white/55">Route produit</p>
        <h1 class="mt-3 font-display text-4xl font-semibold italic tracking-tight text-white sm:text-5xl">
          Redirection vers la page canonique.
        </h1>

        <div class="mt-8 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/5">
          <Loader2 class="h-6 w-6 animate-spin text-white/70" />
        </div>

        <p class="mt-5 text-sm text-white/80 sm:text-base">
          Veuillez patienter pendant le chargement de la route produit la plus recente.
        </p>
      </section>
    </main>
  </div>
</template>
