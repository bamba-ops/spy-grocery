<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, type ComponentPublicInstance } from 'vue'

const features = [
  {
    title: 'Comparez un meme panier entre magasins',
    description: 'Ajoutez vos produits une fois et voyez instantanement le total par magasin.',
    mediaSrc: 'https://pub-2720bf762ca74cc39c0ad1d4c3819cf4.r2.dev/landing/feature1.mp4',
    mediaAlt: 'Liste de comparaison SpyGrocery montrant le meme panier dans les magasins du Quebec.'
  },
  {
    title: 'Vrais produits et prix du Quebec',
    description: 'Chaque resultat provient de vrais produits d\'epicerie disponibles au Quebec.',
    mediaSrc: 'https://pub-2720bf762ca74cc39c0ad1d4c3819cf4.r2.dev/landing/feature2.mp4',
    mediaAlt: 'Resultats de recherche SpyGrocery avec produits et prix reels de magasins locaux.'
  },
  {
    title: 'Commencez avec l\'IA, terminez avec une vraie liste',
    description: 'Decrivez vos besoins, obtenez une liste structuree, puis ajoutez-la au panier compare.',
    mediaSrc: 'https://pub-2720bf762ca74cc39c0ad1d4c3819cf4.r2.dev/landing/feature3.mp4',
    mediaAlt: 'Parcours de demarrage SpyGrocery qui genere et ajoute une liste d\'epicerie structuree.'
  }
]

const videoElements = ref<Array<HTMLVideoElement | null>>([])
let visibilityObserver: IntersectionObserver | null = null

const setVideoElement = (
  element: Element | ComponentPublicInstance | null,
  index: number
) => {
  videoElements.value[index] = element instanceof HTMLVideoElement ? element : null
}

const playVideo = async (video: HTMLVideoElement) => {
  video.muted = true

  try {
    await video.play()
  } catch {
  }
}

onMounted(() => {
  if (!process.client || typeof IntersectionObserver === 'undefined') {
    videoElements.value.forEach((video) => {
      if (!video)
        return

      void playVideo(video)
    })

    return
  }

  visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target as HTMLVideoElement

      if (entry.isIntersecting) {
        void playVideo(video)
        return
      }

      video.pause()
    })
  }, {
    threshold: 0.35
  })

  videoElements.value.forEach((video) => {
    if (!video)
      return

    visibilityObserver?.observe(video)
  })
})

onBeforeUnmount(() => {
  visibilityObserver?.disconnect()
  visibilityObserver = null
})
</script>

<template>
  <section id="features" class="bg-black text-white">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div class="grid gap-6 md:grid-cols-2">
        <div
          v-for="(feature, index) in features"
          :key="feature.title"
          class="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:bg-white/10"
        >
          <div class="overflow-hidden rounded-2xl border border-white/10 bg-black/60">
            <video
              :ref="(el) => setVideoElement(el, index)"
              width="960"
              height="624"
              class="h-52 w-full object-cover sm:h-56"
              :aria-label="feature.mediaAlt"
              loop
              muted
              playsinline
              preload="none"
            >
              <source :src="feature.mediaSrc" type="video/mp4">
            </video>
          </div>
          <h3 class="mt-3 text-lg font-semibold italic">{{ feature.title }}</h3>
          <p class="mt-3 text-sm text-white/80">{{ feature.description }}</p>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white p-8 text-black">
          <h3 class="text-lg font-semibold italic">Pret a comparer votre premier panier ?</h3>
          <p class="mt-3 text-sm text-black/70">
            Voyez ou votre panier complet coute moins cher et economisez des votre prochaine epicerie.
          </p>
          <NuxtLink
            to="/search"
            class="mt-8 inline-flex w-full justify-center rounded-full border border-black/20 bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-black transition hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto"
          >
            Comparer mon panier maintenant
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
