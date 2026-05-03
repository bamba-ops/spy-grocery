<script setup lang="ts">
import type { SearchProduct } from '#shared/types'
import {
  getAnalyticsProductProperties,
  getAnalyticsQueryProperties
} from '#shared/utils/analytics'
import { ONBOARDING_MAX_INTENT_LENGTH, ONBOARDING_MAX_STEP } from '#shared/utils/onboarding'
import { getProductRoutePath } from '#shared/utils/productRoute'
import { toSlug } from '#shared/utils/toSlug'
import { useOnboardingStore } from '~/stores/onboarding'
import { useSearchStore } from '~/stores/search'

const onboardingStore = useOnboardingStore()
const searchStore = useSearchStore()
const analytics = useAnalytics()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://www.spygrocery.com').replace(/\/$/, '')

const searchInput = ref('')
const stepNumbers = [1, 2, 3]
const hasCapturedOnboardingStarted = ref(false)

definePageMeta({
  middleware: 'auth'
})

useServerSeoMeta({
  robots: 'noindex,follow'
})

const displayStep = computed(() => {
  return Math.max(1, Math.min(onboardingStore.currentStep, ONBOARDING_MAX_STEP))
})

const onboardingSearchInput = computed({
  get: () => searchInput.value,
  set: (value: string) => {
    searchInput.value = value
    onboardingStore.setIntent(value)
    searchStore.setHeroSearchInput(value)
  }
})

const getOnboardingAnalyticsProperties = (query: string, source: string) => {
  const resultsCount = searchStore.getHeroSearchResults.length

  return {
    ...getAnalyticsQueryProperties(query),
    current_step: onboardingStore.currentStep,
    status: onboardingStore.status,
    results_count: resultsCount,
    zero_results: resultsCount === 0,
    source
  }
}

const setCaptureOnboardingStarted = (source = 'onboarding_page') => {
  if (hasCapturedOnboardingStarted.value) {
    return
  }

  hasCapturedOnboardingStarted.value = true
  analytics.capture('onboarding_started', getOnboardingAnalyticsProperties(searchInput.value, source))
}

const setSubmitSearch = async () => {
  const normalizedIntent = searchInput.value.trim().slice(0, ONBOARDING_MAX_INTENT_LENGTH)

  if (!normalizedIntent) {
    return
  }

  // Keep onboarding progression explicit in DB from the first action.
  await onboardingStore.setStartOnboardingStep(normalizedIntent)

  // Debug log intentionally kept while onboarding v2 is being observed.
  console.log('[onboarding] submitted step 1 search:', normalizedIntent)

  searchStore.heroSearchInput = normalizedIntent
  await searchStore.getHeroSearchResultsByQuery()

  analytics.capture('onboarding_search_submitted', getOnboardingAnalyticsProperties(normalizedIntent, 'onboarding_search'))
}

const setUseQuickPrompt = async (prompt: string) => {
  onboardingSearchInput.value = prompt
  await searchStore.getHeroSearchResultsByQuery()

  analytics.capture('onboarding_quick_prompt_clicked', getOnboardingAnalyticsProperties(prompt, 'onboarding_quick_prompt'))

  // Debug log intentionally kept while onboarding prompt interactions are monitored.
  console.log('[onboarding] quick prompt selected:', {
    prompt,
    resultsCount: searchStore.getHeroSearchResults.length
  })
}

const setSelectProduct = async (product: SearchProduct) => {
  const resolvedStoreSlug = product.store_slug || toSlug(product.store || '')

  if (!resolvedStoreSlug) {
    onboardingStore.error = 'Impossible de poursuivre: magasin introuvable pour ce produit.'
    return
  }

  const productPath = getProductRoutePath(product)

  await onboardingStore.setMoveToStoreStep(resolvedStoreSlug, product.title)

  analytics.capture('onboarding_product_selected', {
    ...getOnboardingAnalyticsProperties(searchInput.value, 'onboarding_search_results'),
    ...getAnalyticsProductProperties(product),
    store_slug: resolvedStoreSlug,
    next_path: productPath
  })

  console.log('[onboarding] product selected from step 1:', {
    productId: product.id,
    storeSlug: resolvedStoreSlug,
    path: productPath
  })

  await navigateTo({
    path: productPath,
    query: {
      onboarding: '1'
    }
  })
}

onMounted(async () => {
  await onboardingStore.setLoadOnboardingState({ force: true })

  if (onboardingStore.status === 'completed') {
    await navigateTo('/search')
    return
  }

  if (
    onboardingStore.status === 'in_progress'
    && onboardingStore.currentStep === 2
    && onboardingStore.selectedStoreSlug
  ) {
    await navigateTo(`/magasins/${encodeURIComponent(onboardingStore.selectedStoreSlug)}?onboarding=1`)
    return
  }

  if (onboardingStore.status === 'in_progress' && onboardingStore.currentStep >= 3) {
    await navigateTo('/lists?source=onboarding')
    return
  }

  onboardingStore.setConsumeHeroPrompt()
  const initialIntent = onboardingStore.firstIntent.trim()

  setCaptureOnboardingStarted(initialIntent ? 'hero_prompt' : 'onboarding_page')

  if (initialIntent) {
    onboardingSearchInput.value = initialIntent
    await searchStore.getHeroSearchResultsByQuery()
  }
})

onBeforeUnmount(() => {
  searchStore.setHeroSearchCleared()
})

useHead({
  title: 'Parcours de demarrage - SpyGrocery',
  link: [
    {
      rel: 'canonical',
      href: `${siteUrl}/onboarding`
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
  ]
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-black font-sans text-white">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_0%,rgba(255,255,255,0.12),transparent_55%),radial-gradient(900px_600px_at_15%_70%,rgba(255,255,255,0.06),transparent_60%),radial-gradient(700px_500px_at_90%_60%,rgba(255,255,255,0.07),transparent_62%)]" />

    <header class="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-4 px-4 pt-6 sm:justify-between sm:px-6">
      <span class="w-full text-center font-display text-4xl font-semibold italic tracking-tight text-white sm:w-auto sm:text-left sm:text-5xl">SpyGrocery</span>

      <div class="hidden items-center gap-3 sm:flex">
        <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Etape {{ displayStep }} sur {{ ONBOARDING_MAX_STEP }}</p>
        <div class="flex items-center gap-2">
          <span
            v-for="stepNumber in stepNumbers"
            :key="`onboarding-step-${stepNumber}`"
            :class="[
              'h-[2px] w-12 rounded-full transition',
              stepNumber <= displayStep ? 'bg-white' : 'bg-white/20'
            ]"
          />
        </div>
      </div>

      <button
        type="button"
        class="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-[10px] uppercase tracking-[0.3em] text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="onboardingStore.isSaving"
        @click="onboardingStore.setSkipForNow"
      >
        Passer pour l'instant
      </button>
    </header>

    <main class="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl items-start px-4 pb-12 pt-10 sm:px-6 sm:pt-14">
      <section class="mx-auto w-full max-w-4xl text-center">
        <p class="text-[10px] uppercase tracking-[0.35em] text-white/60 sm:hidden">Etape {{ displayStep }} sur {{ ONBOARDING_MAX_STEP }}</p>
        <h1 class="mt-3 font-display text-[clamp(2.35rem,10vw,5.25rem)] font-semibold italic leading-[0.95] tracking-tight text-white sm:mt-0">
          Trouve ton premier produit.
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-base text-white/65 sm:text-xl">
          Cherche un produit reel, choisis-le, puis continue dans son magasin.
        </p>

        <ProductSearchDropdown
          class="mx-auto w-full"
          v-model="onboardingSearchInput"
          :max-length="ONBOARDING_MAX_INTENT_LENGTH"
          :products="searchStore.getHeroSearchResults"
          :loading="searchStore.heroSearchLoading"
          :error="searchStore.heroSearchError"
          :get-formatted-price="(price) => searchStore.getFormattedPrice(price)"
          placeholder="Ex: lait 2%, pain complet, yogourt grec..."
          submit-label="Rechercher"
          action-label="Choisir"
          empty-state-text="Aucun produit trouve pour cette recherche. Essaie un autre mot-cle."
          log-prefix="onboarding"
          @submit="setSubmitSearch"
          @select-product="setSelectProduct"
        />

        <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            v-for="prompt in onboardingStore.quickPrompts"
            :key="prompt"
            type="button"
            class="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click="setUseQuickPrompt(prompt)"
          >
            {{ prompt }}
          </button>
        </div>

        <p v-if="onboardingStore.error" class="mt-5 text-sm text-white/75">{{ onboardingStore.error }}</p>
      </section>
    </main>
  </div>
</template>
