<script setup lang="ts">
import { useListsStore } from '~/stores/lists'
import { ONBOARDING_MAX_STEP } from '#shared/utils/onboarding'
import { useAuthStore } from '~/stores/auth'
import { useOnboardingStore } from '~/stores/onboarding'

const listsStore = useListsStore()
const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://www.spygrocery.com').replace(/\/$/, '')

const onboardingStepNumbers = [1, 2, 3]

const showOnboardingSummary = computed(() => {
  if (onboardingStore.status === 'completed') {
    return false
  }

  if (route.query.source === 'onboarding') {
    return true
  }

  return Boolean(authStore.user)
    && onboardingStore.status === 'in_progress'
    && onboardingStore.currentStep >= ONBOARDING_MAX_STEP
})

const setCompleteOnboardingFromSummaryAction = async () => {
  if (!showOnboardingSummary.value || onboardingStore.status === 'completed') {
    return
  }

  // Debug log intentionally kept while onboarding completion actions are monitored.
  console.log('[onboarding] step 3 save action selected')
  await onboardingStore.setCompleteOnboarding()
}

const setSaveOnboardingList = async () => {
  await setCompleteOnboardingFromSummaryAction()
  listsStore.setShoppingListDrawerOpen()

  const saved = await listsStore.setSaveOrUpdateCurrentList()

  if (!saved) {
    return
  }

  console.log('[onboarding] list save action completed from step 3 summary')
}
definePageMeta({
  layout: 'bottom-nav',
  middleware: ['auth', 'onboarding']
})

useServerSeoMeta({
  robots: 'noindex,follow'
})

useHead({
  title: 'Mes listes - SpyGrocery',
  link: [
    {
      rel: 'canonical',
      href: `${siteUrl}/lists`
    },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;1,600&family=Manrope:wght@400;500;600&display=swap'
    }
  ]
})

onMounted(() => {
  void (async () => {
    await listsStore.setLoadListsPage()

    if (!authStore.isReady) {
      await authStore.initAuth()
    }

    if (!authStore.user) {
      return
    }

    await onboardingStore.setLoadOnboardingState()

    if (route.query.source === 'onboarding' && onboardingStore.status !== 'completed') {
      // Keep progression in sync when the user reaches the final onboarding screen.
      await onboardingStore.setAdvanceToStepThree()
    }
  })()
})

watch(
  () => listsStore.justSaved,
  (justSaved) => {
    if (!justSaved || !showOnboardingSummary.value) {
      return
    }

    console.log('[onboarding] new list saved from step 3 summary')
    void onboardingStore.setCompleteOnboarding()
  }
)

</script>

<template>
  <div class="min-h-screen bg-black font-sans text-white">
    <div class="pointer-events-none fixed inset-0   bg-[radial-gradient(1200px_650px_at_20%_10%,rgba(255,255,255,0.12),transparent_58%),radial-gradient(900px_600px_at_85%_35%,rgba(255,255,255,0.08),transparent_60%),radial-gradient(700px_520px_at_40%_85%,rgba(255,255,255,0.06),transparent_60%)]"></div>

    <main class="relative mx-auto max-w-7xl px-4 pb-28 pt-16 sm:px-6">
      <div class="flex flex-col gap-10">
        <section
          v-if="showOnboardingSummary"
          class="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
        >
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Etape 3 sur {{ ONBOARDING_MAX_STEP }}</p>
              <h2 class="mt-2 font-display text-3xl font-semibold italic tracking-tight text-white sm:text-4xl">
                Votre liste est prete.
              </h2>
              <p class="mt-2 text-sm text-white/75 sm:text-base">
                Enregistrez-la maintenant pour terminer votre parcours.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <button
                type="button"
                class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white px-5 text-[10px] uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="listsStore.getIsCurrentListEmpty"
                @click="setSaveOnboardingList"
              >
                Enregistrer ma liste
              </button>
            </div>
          </div>

          <div class="mt-4 flex items-center gap-2">
            <span
              v-for="step in onboardingStepNumbers"
              :key="`lists-onboarding-step-${step}`"
              :class="[
                'h-[2px] w-12 rounded-full transition',
                step <= ONBOARDING_MAX_STEP ? 'bg-white' : 'bg-white/20'
              ]"
            />
          </div>
        </section>

        <div class="flex items-end justify-between gap-6">
          <h1 class="font-display text-6xl font-semibold italic tracking-tight sm:text-7xl">Mes listes</h1>
        </div>

        <ListsToolbar :model-value="listsStore.listsControls" @update:modelValue="listsStore.setListsControls" />

        <div v-if="listsStore.error" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          {{ listsStore.error }}
        </div>

        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <SavedListCard
            v-for="list in listsStore.filteredLists"
            :key="list.name"
            :list="list"
            @open="listsStore.setCurrentListFromStorageByName"
            @delete="listsStore.deleteListsStorageByName"
          />
          <CreateListCard to="/search" />
        </div>
      </div>
    </main>
  </div>
</template>
