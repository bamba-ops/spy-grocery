<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => {
  const code = Number(props.error?.statusCode || 500)
  if (!Number.isFinite(code) || code <= 0) {
    return 500
  }

  return Math.floor(code)
})

const isNotFound = computed(() => statusCode.value === 404)

const pageTitle = computed(() => {
  if (isNotFound.value) {
    return '404 - Rayon introuvable | SpyGrocery'
  }

  return `${statusCode.value} - Incident temporaire | SpyGrocery`
})

const headline = computed(() => {
  if (isNotFound.value) {
    return 'Rayon introuvable.'
  }

  return 'Incident temporaire.'
})

const description = computed(() => {
  if (isNotFound.value) {
    return "La page que vous cherchez est introuvable ou a ete deplacee. Continuez votre parcours depuis la recherche de produits."
  }

  return "Une erreur inattendue s'est produite. Vous pouvez revenir a l'accueil ou reprendre via la recherche de produits."
})

const errorHint = computed(() => {
  const message = String(props.error?.message || '').trim()
  if (!message || message === 'Page not found') {
    return null
  }

  return message
})

const setGoToSearch = async () => {
  await clearError({ redirect: '/search' })
}

const setGoToHome = async () => {
  await clearError({ redirect: '/' })
}

useHead(() => ({
  title: pageTitle.value,
  meta: [
    {
      name: 'robots',
      content: 'noindex,nofollow'
    }
  ],
  link: [
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
}))
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-black font-sans text-white">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_520px_at_50%_36%,rgba(255,255,255,0.20),rgba(0,0,0,0)_62%),radial-gradient(900px_600px_at_50%_90%,rgba(255,255,255,0.08),rgba(0,0,0,0)_72%)]" />
    <div class="pointer-events-none absolute inset-0 opacity-45 [background:linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.06)_50%,transparent_100%)]" />
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_22%,rgba(0,0,0,0.82)_76%)]" />

    <main class="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6">

      <p class="mt-5 font-display text-[120px] font-semibold leading-none tracking-tight text-white sm:text-[180px]">
        {{ statusCode }}
      </p>

      <h1 class="mt-2 max-w-3xl font-display text-4xl italic tracking-tight text-white sm:text-6xl">
        {{ headline }}
      </h1>

      <p class="mt-6 max-w-2xl text-base text-white/70 sm:text-2xl sm:leading-relaxed">
        {{ description }}
      </p>

      <p v-if="errorHint" class="mt-4 max-w-2xl text-sm text-white/55">
        {{ errorHint }}
      </p>

      <div class="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
        <button
          type="button"
          class="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white px-7 text-[11px] font-semibold uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          @click="setGoToSearch"
        >
          Voir tous les produits
        </button>

        <button
          type="button"
          class="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-7 text-[11px] uppercase tracking-[0.35em] text-white/85 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          @click="setGoToHome"
        >
          Retour a l'accueil
        </button>
      </div>
    </main>
  </div>
</template>
