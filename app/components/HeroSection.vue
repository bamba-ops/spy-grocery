<script setup lang="ts">
import type { SearchProduct } from '#shared/types'
import { ONBOARDING_MAX_INTENT_LENGTH } from '#shared/utils/onboarding'
import { getProductRoutePath } from '#shared/utils/productRoute'
import { useOnboardingStorage } from '~/composables/local/useOnboardingStorage'
import { useOnboardingStore } from '~/stores/onboarding'
import { useSearchStore } from '~/stores/search'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()
const onboardingStorage = useOnboardingStorage()
const searchStore = useSearchStore()

const popularSearches = [
  'lait 2%',
  'oeufs',
  'pain complet',
  'fromage cheddar',
  'yogourt grec'
]

const heroSearchInput = computed({
  get: () => searchStore.heroSearchInput,
  set: (value: string) => {
    searchStore.setHeroSearchInput(value)
  }
})

const setSubmitHeroSearch = async () => {
  const normalizedQuery = heroSearchInput.value.trim().slice(0, ONBOARDING_MAX_INTENT_LENGTH)

  if (!normalizedQuery) {
    return
  }

  // Keep the query in session so onboarding can preload the same intent after login.
  onboardingStorage.setOnboardingHeroPrompt(normalizedQuery)

  searchStore.heroSearchInput = normalizedQuery
  await searchStore.getHeroSearchResultsByQuery()

  // Debug log intentionally kept while landing-to-login conversion is monitored.
  console.log('[landing] hero search submitted:', {
    query: normalizedQuery,
    resultsCount: searchStore.getHeroSearchResults.length
  })
}

const setUsePopularSearch = async (value: string) => {
  searchStore.heroSearchInput = value
  await searchStore.getHeroSearchResultsByQuery()

  // Debug log intentionally kept while top search intents are measured.
  console.log('[landing] popular search selected:', {
    query: value
  })
}

const setSelectSearchResult = async (product: SearchProduct) => {
  if (!authStore.isReady) {
    await authStore.initAuth()
  }

  if (authStore.user && !onboardingStore.isReady) {
    await onboardingStore.setLoadOnboardingState()
  }

  const normalizedQuery = heroSearchInput.value.trim().slice(0, ONBOARDING_MAX_INTENT_LENGTH)

  const hasCompletedOnboarding = authStore.user && onboardingStore.status === 'completed'
  const nextPath = hasCompletedOnboarding
    ? getProductRoutePath(product)
    : `${getProductRoutePath(product)}?onboarding=1`

  if (normalizedQuery && !hasCompletedOnboarding) {
    onboardingStorage.setOnboardingHeroPrompt(normalizedQuery)
  }

  // Debug log intentionally kept while landing-to-product authentication flow is monitored.
  console.log('[landing] product selected from hero dropdown:', {
    productId: product.id,
    store: product.store,
    hasCompletedOnboarding,
    isAuthenticated: Boolean(authStore.user),
    nextPath
  })

  // Authenticated users skip /login; completed onboarding users already have the normal product path.
  if (authStore.user) {
    await navigateTo(nextPath)
    return
  }

  // Keep login redirection only for guests.
  authStore.setClearStoredLoginNextPath()
  await navigateTo(`/login?next=${encodeURIComponent(nextPath)}`)
}

onMounted(() => {
  // Clear previous hero state so landing always starts from a clean search interaction.
  searchStore.setHeroSearchCleared()

  // Debug log intentionally kept while landing search usage is monitored.
  console.log('[landing] hero search initialized')
})

onBeforeUnmount(() => {
  searchStore.setHeroSearchCleared()
})
</script>

<template>
  <section class="relative bg-black text-white">
    <div class="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-[120px]"></div>
    <div class="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-[120px]"></div>

    <div class="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
      <div class="max-w-4xl">
        <h1 class="mt-4 font-display text-[clamp(2.6rem,6vw,4.8rem)] font-semibold italic leading-[0.95] tracking-tight text-white">
          Comparez les prix d'epicerie au Quebec.
          <br />
          Trouvez vos specials en quelques secondes.
        </h1>
        <p class="mt-4 max-w-3xl text-sm font-medium text-white/80 sm:mt-6 sm:text-base">
          SpyGrocery vous aide a reperer les meilleurs prix par magasin, produit par produit, pour payer moins cher votre panier au Quebec.
        </p>

        <ProductSearchDropdown
          v-model="heroSearchInput"
          :max-length="ONBOARDING_MAX_INTENT_LENGTH"
          :products="searchStore.getHeroSearchResults"
          :loading="searchStore.heroSearchLoading"
          :error="searchStore.heroSearchError"
          :get-formatted-price="(price) => searchStore.getFormattedPrice(price)"
          placeholder="Ex: lait 2%, oeufs, pain complet..."
          submit-label="Rechercher"
          action-label="Continuer"
          empty-state-text="Aucun produit trouve pour cette recherche. Essayez un autre mot-cle."
          log-prefix="landing"
          @submit="setSubmitHeroSearch"
          @select-product="setSelectSearchResult"
        />

        <div class="mt-4 flex flex-wrap items-center gap-2">
          <button
            v-for="query in popularSearches"
            :key="query"
            type="button"
            class="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click="setUsePopularSearch(query)"
          >
            {{ query }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
