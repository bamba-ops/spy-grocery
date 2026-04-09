<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { ONBOARDING_MAX_INTENT_LENGTH } from '#shared/utils/onboarding'
import { useOnboardingStorage } from '~/composables/local/useOnboardingStorage'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const onboardingStorage = useOnboardingStorage()

const heroPrompt = ref('')
const isPromptFocused = ref(false)
const typewriterSuffixes = [
  'pour une semaine sous 120$',
  'pour une famille de 4 ce week-end',
  'avec les options proteinees les moins cheres',
  'avec seulement les essentiels sans gluten'
]
const typewriterPrefix = 'Decrivez votre panier : '
const typewriterText = ref('')

let typewriterTimer: ReturnType<typeof setTimeout> | null = null
let suffixIndex = 0
let charIndex = 0
let isDeleting = false

const quickPrompts = [
  'Epicerie de semaine pour 2 sous 80$',
  'Panier familial sous 150$ au Quebec',
  'Semaine de repas proteines a petit prix',
  'Essentiels sans gluten au plus bas prix'
]

const getCanSubmitPrompt = computed(() => {
  return heroPrompt.value.trim().length > 0
})

const showTypewriterPlaceholder = computed(() => {
  return heroPrompt.value.trim().length === 0 && !isPromptFocused.value
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

const setScheduleTypewriterStep = (delay: number) => {
  if (!import.meta.client) {
    return
  }

  if (typewriterTimer) {
    clearTimeout(typewriterTimer)
  }

  typewriterTimer = setTimeout(() => {
    setTypewriterStep()
  }, delay)
}

const setTypewriterStep = () => {
  const currentSuffix = typewriterSuffixes[suffixIndex] || ''

  if (!isDeleting) {
    charIndex = Math.min(charIndex + 1, currentSuffix.length)
    typewriterText.value = currentSuffix.slice(0, charIndex)

    if (charIndex >= currentSuffix.length) {
      isDeleting = true
      setScheduleTypewriterStep(900)
      return
    }

    setScheduleTypewriterStep(45)
    return
  }

  charIndex = Math.max(charIndex - 1, 0)
  typewriterText.value = currentSuffix.slice(0, charIndex)

  if (charIndex === 0) {
    isDeleting = false
    suffixIndex = (suffixIndex + 1) % typewriterSuffixes.length
    setScheduleTypewriterStep(260)
    return
  }

  setScheduleTypewriterStep(28)
}

onMounted(() => {
  setScheduleTypewriterStep(220)
})

onBeforeUnmount(() => {
  if (typewriterTimer) {
    clearTimeout(typewriterTimer)
    typewriterTimer = null
  }
})
</script>

<template>
  <section class="relative bg-black text-white">
    <div class="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-[120px]"></div>
    <div class="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-[120px]"></div>

    <div class="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
      <div class="max-w-3xl">
        <h1 class="font-display text-[clamp(2.6rem,6vw,4.8rem)] font-semibold italic leading-[0.95] tracking-tight text-white">
          Trouvez le panier d'epicerie le moins cher.
          <br />
          Concu pour les magasins du Quebec.
        </h1>
        <p class="mt-4 max-w-2xl text-sm font-medium text-white/80 sm:mt-6 sm:text-base">
          SpyGrocery compare les vrais prix en epicerie au Quebec et utilise l'IA pour structurer votre liste en quelques secondes.
        </p>

        <form class="mt-8 max-w-4xl sm:mt-10" @submit.prevent="setSubmitPrompt">
          <div class="rounded-[28px] border border-white/15 bg-black/80 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:flex sm:items-center sm:gap-2 sm:rounded-full">
            <div class="flex items-center gap-2 sm:flex-1">
              <div class="relative min-w-0 flex-1">
                <input
                  v-model="heroPrompt"
                  type="text"
                  :maxlength="ONBOARDING_MAX_INTENT_LENGTH"
                  placeholder=""
                  class="h-11 min-w-0 w-full bg-transparent px-2 text-sm text-white focus:outline-none sm:h-12 sm:text-base"
                  @focus="isPromptFocused = true"
                  @blur="isPromptFocused = false"
                >

                <div
                  v-if="showTypewriterPlaceholder"
                  class="pointer-events-none absolute inset-y-0 left-2 flex max-w-[calc(100%-0.5rem)] items-center text-sm text-white/40 sm:text-base"
                >
                  <span class="truncate">{{ typewriterPrefix }}{{ typewriterText }}</span>
                  <span class="ml-1 h-4 w-px shrink-0 bg-white/60 animate-pulse" aria-hidden="true"></span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              class="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40 sm:mt-0 sm:h-12 sm:w-auto sm:px-6"
              :disabled="!getCanSubmitPrompt"
            >
              Voir le panier le moins cher
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

     <!--<section class="mt-10 sm:mt-12">
        <div class="flex flex-col items-start gap-3 rounded-2xl border border-white/15 bg-black/70 p-4 sm:p-5">
          <p class="text-sm text-white/75 sm:text-base">
            Vous pouvez aussi aller directement sur la page de recherche.
          </p>

          <NuxtLink
            to="/search"
            class="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Aller a la recherche
            <ArrowRight class="h-4 w-4" />
          </NuxtLink>
        </div>
      </section>-->
    </div>
  </section>
</template>
