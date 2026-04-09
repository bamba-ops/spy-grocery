<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
import { useAuthStore } from '~/stores/auth'
import { useChatStore } from '~/stores/chat'
import { useOnboardingStore } from '~/stores/onboarding'

const searchStore = useSearchStore()
const authStore = useAuthStore()
const chatStore = useChatStore()
const onboardingStore = useOnboardingStore()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://spygrocery.com').replace(/\/$/, '')

const showOnboardingStepTwo = computed(() => {
  return Boolean(authStore.user)
    && onboardingStore.status === 'in_progress'
    && onboardingStore.currentStep === 2
})

const showOnboardingPreparing = computed(() => {
  return showOnboardingStepTwo.value && !onboardingStore.hasPreview
})

const showOnboardingReady = computed(() => {
  return showOnboardingStepTwo.value && onboardingStore.hasPreview
})

const showResumeOnboarding = computed(() => {
  return Boolean(authStore.user) && onboardingStore.getCanResume
})

const setContinueSearchFromBanner = async () => {
  await onboardingStore.setContinueToSearch()
}

const setOpenSpyAiForOnboarding = async () => {
  const chatSessionId = typeof onboardingStore.firstChatSessionId === 'string'
    ? onboardingStore.firstChatSessionId.trim()
    : ''

  if (!chatSessionId) {
    chatStore.setChatPanelOpen(true)
    return
  }

  const isOpened = await chatStore.setOpenChatPanelWithSession(chatSessionId)

  if (!isOpened) {
    chatStore.setChatPanelOpen(true)
  }
}

definePageMeta({
  layout: 'bottom-nav',
  middleware: 'onboarding'
})

useServerSeoMeta({
  title: 'Recherche de produits - SpyGrocery',
  description: 'Recherchez et comparez les produits en special dans les epiceries du Quebec.',
  robots: 'noindex,follow'
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: `${siteUrl}/search`
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

onMounted(() => {
  searchStore.setSearchPageInitialized()

  void (async () => {
    if (!authStore.isReady) {
      await authStore.initAuth()
    }

    if (!authStore.user) {
      return
    }

    await onboardingStore.setLoadOnboardingState()
  })()
})
</script>

<template>
  <div class="min-h-screen bg-black font-sans text-white">
    <div v-if="showOnboardingPreparing" class="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <section class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Parcours de demarrage</p>
          <p class="mt-2 text-sm text-white/80 sm:text-base">Spy AI prepare votre premiere liste.</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click="setContinueSearchFromBanner"
          >
            Continuer mes recherches
          </button>

          <button
            type="button"
            class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white px-5 text-[10px] uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click="setOpenSpyAiForOnboarding"
          >
            Ouvrir Spy AI
          </button>
        </div>
      </section>
    </div>

    <div v-else-if="showOnboardingReady" class="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <section class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Parcours de demarrage</p>
          <p class="mt-2 text-sm text-white/80 sm:text-base">Votre liste IA est prete.</p>
        </div>

        <button
          type="button"
          class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white px-5 text-[10px] uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          @click="setOpenSpyAiForOnboarding"
        >
          Ouvrir Spy AI
        </button>
      </section>
    </div>

    <div v-else-if="showResumeOnboarding" class="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <section class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Parcours en pause</p>
          <p class="mt-2 text-sm text-white/80 sm:text-base">Reprenez votre premiere liste guidee par l'IA quand vous voulez.</p>
        </div>

        <button
          type="button"
          class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white px-5 text-[10px] uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          @click="onboardingStore.setResumeOnboarding"
        >
          Reprendre le parcours
        </button>
      </section>
    </div>

    <main class="mx-auto grid max-w-7xl gap-6 px-4 pb-28 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section>
        <SearchResults />
      </section>

      <aside class="hidden lg:block">
        <SearchListPanel />
      </aside>
    </main>

  </div>
</template>
