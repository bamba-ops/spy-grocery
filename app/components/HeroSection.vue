<script setup lang="ts">
import { ArrowRight, Sparkles } from 'lucide-vue-next'
import { ONBOARDING_MAX_INTENT_LENGTH } from '#shared/utils/onboarding'
import { useOnboardingStorage } from '~/composables/local/useOnboardingStorage'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const onboardingStorage = useOnboardingStorage()

const heroPrompt = ref('')

const quickPrompts = [
  'Weekly groceries for 2 under $80',
  'Family cart under $150 in Quebec',
  'Cheap high-protein week of meals',
  'Lowest-cost gluten-free essentials'
]

const getCanSubmitPrompt = computed(() => {
  return heroPrompt.value.trim().length > 0
})

const setUseQuickPrompt = (value: string) => {
  heroPrompt.value = value
}

const setSubmitPrompt = async () => {
  const prompt = heroPrompt.value.trim()

  if (!prompt) {
    return
  }

  onboardingStorage.setOnboardingHeroPrompt(prompt)

  if (!authStore.isReady) {
    await authStore.initAuth()
  }

  if (authStore.user) {
    await navigateTo('/search')
    return
  }

  authStore.setClearStoredLoginNextPath()
  await navigateTo('/login')
}
</script>

<template>
  <section class="relative bg-black text-white">
    <div class="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-[120px]"></div>
    <div class="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-[120px]"></div>

    <div class="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
      <div class="max-w-3xl">
        <h1 class="font-display text-[clamp(2.6rem,6vw,4.8rem)] font-semibold italic leading-[0.95] tracking-tight text-white">
          Find the cheapest grocery cart.
          <br />
          Built for Quebec stores.
        </h1>
        <p class="mt-4 max-w-2xl text-sm font-medium text-white/80 sm:mt-6 sm:text-base">
          SpyGrocery compares real grocery prices across Quebec and uses AI to structure your list in seconds.
        </p>

        <form class="mt-8 max-w-4xl sm:mt-10" @submit.prevent="setSubmitPrompt">
          <div class="rounded-[28px] border border-white/15 bg-black/80 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:flex sm:items-center sm:gap-2 sm:rounded-full">
            <div class="flex items-center gap-2 sm:flex-1">
              <div class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70">
                <Sparkles class="h-4 w-4" />
              </div>

              <input
                v-model="heroPrompt"
                type="text"
                :maxlength="ONBOARDING_MAX_INTENT_LENGTH"
                placeholder="Describe your cart: 1 week for 2 adults, budget $120, Maxi + Super C..."
                class="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm text-white placeholder:text-white/40 focus:outline-none sm:h-12 sm:text-base"
              >
            </div>

            <button
              type="submit"
              class="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40 sm:mt-0 sm:h-12 sm:w-auto sm:px-6"
              :disabled="!getCanSubmitPrompt"
            >
              See the cheapest cart
              <ArrowRight class="h-4 w-4" />
            </button>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-2">
            <button
              v-for="prompt in quickPrompts"
              :key="prompt"
              type="button"
              class="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              @click="setUseQuickPrompt(prompt)"
            >
              {{ prompt }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
