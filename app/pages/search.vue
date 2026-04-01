<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
import { useAuthStore } from '~/stores/auth'
import { useOnboardingStore } from '~/stores/onboarding'

const searchStore = useSearchStore()
const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://spygrocery.com').replace(/\/$/, '')

const showResumeOnboarding = computed(() => {
  return Boolean(authStore.user) && onboardingStore.getCanResume
})

definePageMeta({
  layout: 'bottom-nav',
  middleware: 'onboarding'
})

useServerSeoMeta({
  title: 'Recherche de produits - SpyGrocery',
  description: 'Recherchez des produits et comparez les prix en epicerie dans les magasins du Quebec.',
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
    <div v-if="showResumeOnboarding" class="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <section class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Onboarding paused</p>
          <p class="mt-2 text-sm text-white/80 sm:text-base">Resume your AI guided first list whenever you are ready.</p>
        </div>

        <button
          type="button"
          class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white px-5 text-[10px] uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          @click="onboardingStore.setResumeOnboarding"
        >
          Resume onboarding
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
