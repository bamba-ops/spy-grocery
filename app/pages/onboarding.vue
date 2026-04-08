<script setup lang="ts">
import { ChevronRight, Loader2, Sparkles } from 'lucide-vue-next'
import { ONBOARDING_MAX_STEP } from '#shared/utils/onboarding'
import { useOnboardingStore } from '~/stores/onboarding'

const onboardingStore = useOnboardingStore()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://spygrocery.com').replace(/\/$/, '')

definePageMeta({
  middleware: 'auth'
})

useServerSeoMeta({
  robots: 'noindex,follow'
})

const stepNumbers = [1, 2]

const isStepOne = computed(() => onboardingStore.currentStep === 1)
const isStepTwo = computed(() => onboardingStore.currentStep === 2)

const setSubmitIntent = async () => {
  await onboardingStore.setSubmitIntent()
}

const setContinueToSearch = async () => {
  await onboardingStore.setContinueToSearch()
}

onMounted(async () => {
  await onboardingStore.setLoadOnboardingState({ force: true })
  onboardingStore.setConsumeHeroPrompt()

  if (onboardingStore.status === 'completed') {
    await navigateTo('/search')
  }
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

    <header class="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 pt-6 sm:px-6">
      <span class="font-display text-4xl font-semibold italic tracking-tight text-white sm:text-5xl">SpyGrocery</span>

      <div class="hidden items-center gap-3 sm:flex">
        <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Etape {{ onboardingStore.currentStep }} sur {{ ONBOARDING_MAX_STEP }}</p>
        <div class="flex items-center gap-2">
          <span
            v-for="stepNumber in stepNumbers"
            :key="`onboarding-step-${stepNumber}`"
            :class="[
              'h-[2px] w-12 rounded-full transition',
              stepNumber <= onboardingStore.currentStep ? 'bg-white' : 'bg-white/20'
            ]"
          />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-[10px] uppercase tracking-[0.3em] text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="onboardingStore.isSaving || onboardingStore.isGenerating"
          @click="onboardingStore.setSkipForNow"
        >
          Passer pour l'instant
        </button>
      </div>
    </header>

    <main class="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-7xl items-center px-4 pb-12 pt-8 sm:px-6 sm:pt-12">
      <section v-if="isStepOne" class="mx-auto w-full max-w-5xl text-center">
        <p class="text-[10px] uppercase tracking-[0.35em] text-white/60 sm:hidden">Etape 1 sur 2</p>
        <h1 class="mt-3 font-display text-5xl font-semibold italic tracking-tight text-white sm:mt-0 sm:text-7xl">
          Qu'y a-t-il dans votre menu ?
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-base text-white/60 sm:text-xl">
          Decrivez votre semaine, votre alimentation ou une envie precise.
        </p>

        <form class="mx-auto mt-8 w-full max-w-5xl" @submit.prevent="setSubmitIntent">
          <div class="flex items-center gap-2 rounded-full border border-white/15 bg-black/80 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
            <div class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70">
              <Sparkles class="h-4 w-4" />
            </div>

            <input
              :value="onboardingStore.firstIntent"
              type="text"
              maxlength="2000"
              class="h-12 flex-1 bg-transparent px-2 text-sm text-white placeholder:text-white/40 focus:outline-none sm:text-lg"
              placeholder="Un souper sain pour deux, des collations sans gluten, des repas proteines..."
              @input="onboardingStore.setIntent(($event.target as HTMLInputElement).value)"
            >

            <button
              type="submit"
              class="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!onboardingStore.getCanSubmitIntent"
            >
              Aller
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </form>

        <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            v-for="prompt in onboardingStore.quickPrompts"
            :key="prompt"
            type="button"
            class="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click="onboardingStore.setUseQuickPrompt(prompt)"
          >
            {{ prompt }}
          </button>
        </div>

        <p v-if="onboardingStore.error" class="mt-5 text-sm text-white/75">{{ onboardingStore.error }}</p>

      </section>

      <section v-else-if="isStepTwo" class="mx-auto w-full max-w-3xl text-center">
        <div class="text-center">
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60 sm:hidden">Etape 2 sur 2</p>
          <h1 class="mt-3 font-display text-5xl font-semibold italic tracking-tight text-white sm:mt-0 sm:text-7xl">
            {{ onboardingStore.hasPreview && !onboardingStore.isGenerating
              ? 'Votre liste est prete dans Spy AI.'
              : 'Preparation de votre liste...' }}
          </h1>
          <p class="mx-auto mt-4 max-w-2xl text-base text-white/60 sm:text-xl">
            {{ onboardingStore.hasPreview && !onboardingStore.isGenerating
              ? 'Ouvrez Spy AI depuis le bouton en bas pour voir votre liste.'
              : 'Cela prend quelques secondes.' }}
          </p>
        </div>

        <!--<div
          v-if="!onboardingStore.hasPreview || onboardingStore.isGenerating"
          class="mx-auto mt-10 flex w-full max-w-md items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-6"
        >
          <Loader2 class="h-5 w-5 animate-spin text-white/80" />
          <p class="text-sm text-white/80">
            {{ onboardingStore.isGenerating ? 'Generation de votre premiere liste d\'epicerie...' : 'En attente de generation...' }}
          </p>
        </div>-->

        <div
          v-if="onboardingStore.hasPreview && !onboardingStore.isGenerating"
          class="mx-auto mt-10 w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 px-6 py-6 text-left"
        >
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Liste prete</p>
          <p class="mt-3 text-sm text-white/80 sm:text-base">
            Votre premiere liste IA est disponible dans la conversation Spy AI de ce parcours.
          </p>
        </div>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            class="inline-flex h-11 items-center rounded-full border border-white/20 bg-white px-5 text-[10px] uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click="setContinueToSearch"
          >
            {{ onboardingStore.hasPreview && !onboardingStore.isGenerating
              ? 'Aller a la recherche'
              : 'Continuer pendant que Spy AI prepare votre liste' }}
          </button>
        </div>

        <p v-if="onboardingStore.error" class="mt-5 text-center text-sm text-white/75">{{ onboardingStore.error }}</p>

        <div
          v-if="onboardingStore.error && !onboardingStore.isGenerating && !onboardingStore.hasPreview"
          class="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            type="button"
            class="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
            @click="onboardingStore.setBackToIntentStep"
          >
            Retour
          </button>

          <button
            type="button"
            class="inline-flex h-11 items-center rounded-full border border-white/20 bg-white px-5 text-[10px] uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
            @click="setSubmitIntent"
          >
            Reessayer
          </button>
        </div>
      </section>
    </main>
  </div>
</template>
