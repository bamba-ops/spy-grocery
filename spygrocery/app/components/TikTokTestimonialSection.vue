<script setup lang="ts">
const isVisible = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const videoUrl = 'https://www.tiktok.com/@bambalerequin/video/7463203868734672134'
const profileUrl = 'https://www.tiktok.com/@bambalerequin?refer=embed'
const musicUrl = 'https://www.tiktok.com/music/son-original-7463203882172599045?refer=embed'

const loadEmbed = () => {
  if (isVisible.value) return
  isVisible.value = true

  const existingScript = document.querySelector('script[data-tiktok-embed]')
  if (existingScript) return

  const script = document.createElement('script')
  script.src = 'https://www.tiktok.com/embed.js'
  script.async = true
  script.setAttribute('data-tiktok-embed', 'true')
  document.body.appendChild(script)
}

onMounted(() => {
  if (!containerRef.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        loadEmbed()
        observer.disconnect()
      }
    },
    { rootMargin: '200px' }
  )

  observer.observe(containerRef.value)
})
</script>

<template>
  <section class="bg-black text-white">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div class="max-w-3xl">
        <p class="text-[10px] uppercase tracking-[0.4em] text-white/60">Testimonial</p>
        <h2 class="mt-4 font-['Cormorant_Garamond'] text-4xl font-semibold italic leading-tight sm:text-5xl">
          Loved on TikTok.
        </h2>
        <p class="mt-4 max-w-xl text-sm text-white/80 sm:text-base">
          A quick look at the idea behind SpyGrocery and why it helps shoppers save.
        </p>
      </div>

      <div ref="containerRef" class="mt-10 flex flex-col items-center">
        <div class="w-full max-w-sm">
          <div class="relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-white/15 bg-white/5">
            <div class="absolute inset-0 flex items-center justify-center text-white/50">
              <span class="text-[10px] uppercase tracking-[0.35em]">Loading TikTok</span>
            </div>

            <div v-if="isVisible" class="absolute inset-0">
              <blockquote
                class="tiktok-embed h-full"
                :cite="videoUrl"
                data-video-id="7463203868734672134"
                style="max-width: 100%; min-width: 100%; height: 100%;"
              >
                <section>
                  <a target="_blank" rel="noreferrer" title="@bambalerequin" :href="profileUrl">@bambalerequin</a>
                  Maxi et Walmart seront rajoutés !
                  <a target="_blank" rel="noreferrer" title="economiser" href="https://www.tiktok.com/tag/economiser?refer=embed">#economiser</a>
                  <a target="_blank" rel="noreferrer" title="application" href="https://www.tiktok.com/tag/application?refer=embed">#application</a>
                  <a target="_blank" rel="noreferrer" title="montreal" href="https://www.tiktok.com/tag/montreal?refer=embed">#montreal</a>
                  <a target="_blank" rel="noreferrer" title="mtl" href="https://www.tiktok.com/tag/mtl?refer=embed">#mtl</a>
                  <a target="_blank" rel="noreferrer" title="mtlfood" href="https://www.tiktok.com/tag/mtlfood?refer=embed">#mtlfood</a>
                  <a target="_blank" rel="noreferrer" title="fyp" href="https://www.tiktok.com/tag/fyp?refer=embed">#fyp</a>
                  <a target="_blank" rel="noreferrer" title="son original" :href="musicUrl">♬ son original - bamba</a>
                </section>
              </blockquote>
            </div>
          </div>

          <div class="mt-4 flex flex-col items-center gap-2">
            <a
              :href="videoUrl"
              target="_blank"
              rel="noreferrer"
              class="rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:border-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Watch on TikTok
            </a>
            <p class="text-[10px] uppercase tracking-[0.35em] text-white/50">
              Captions available on TikTok
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
