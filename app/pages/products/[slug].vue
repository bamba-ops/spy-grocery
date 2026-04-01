<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { getProductRoutePath } from '#shared/utils/productRoute'
import { useProductDetailsStore } from '~/stores/productDetails'

definePageMeta({
  layout: 'bottom-nav',
  middleware: 'onboarding'
})

const route = useRoute()
const productDetails = useProductDetailsStore()

const slug = computed(() => {
  const value = route.params.slug

  if (Array.isArray(value)) {
    return value[0] || ''
  }

  return typeof value === 'string' ? value : ''
})

watch(
  slug,
  async (nextSlug) => {
    await productDetails.getProductDetailsBySlug(nextSlug)

    if (!productDetails.product) {
      return
    }

    const canonicalPath = getProductRoutePath(productDetails.product)

    if (canonicalPath && canonicalPath !== route.path) {
      await navigateTo(canonicalPath, { replace: true })
    }
  },
  { immediate: true }
)

useHead({
  title: 'Redirecting product — SpyGrocery'
})
</script>

<template>
  <div class="min-h-screen bg-black font-sans text-white">
    <main class="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
      <section class="w-full rounded-[32px] border border-white/10 bg-white/5 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:p-10">
        <p class="text-[10px] uppercase tracking-[0.35em] text-white/55">Product route</p>
        <h1 class="mt-3 font-display text-4xl font-semibold italic tracking-tight text-white sm:text-5xl">
          Redirecting to canonical page.
        </h1>

        <div class="mt-8 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/5">
          <Loader2 class="h-6 w-6 animate-spin text-white/70" />
        </div>

        <p class="mt-5 text-sm text-white/80 sm:text-base">
          Please wait while we load the latest product route.
        </p>

        <p v-if="productDetails.error" class="mt-5 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80">
          {{ productDetails.error }}
        </p>
      </section>
    </main>
  </div>
</template>
