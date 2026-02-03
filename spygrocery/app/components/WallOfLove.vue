<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://www.tiktok.com/embed.js'
  script.async = true
  document.body.appendChild(script)
})
</script>

<template>
  <section id="wall-of-love" class="relative overflow-hidden bg-black py-20 text-center">
    <!-- Decorative Floating Elements -->
    <div class="absolute left-10 top-20 animate-pulse text-[#39FF14] opacity-80 sm:left-32">
       <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
         <path d="M12 2L14.39 8.26L21 9.27L16.5 14.14L17.77 21L12 17.77L6.23 21L7.5 14.14L3 9.27L9.61 8.26L12 2Z" />
       </svg>
    </div>
    <div class="absolute right-10 bottom-20 animate-bounce text-[#FF2A6D] opacity-80 sm:right-32">
       <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
         <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
       </svg>
    </div>

    <div class="relative mx-auto max-w-4xl px-4">
      <h2 class="mb-4 text-5xl font-black italic uppercase tracking-tighter text-[#39FF14] sm:text-7xl">
        Wall of Love
      </h2>
      <p class="mb-12 text-lg font-medium text-white/80">
        Proof that it actually works.
      </p>

      <!-- TikTok Embed -->
      <div class="flex justify-center">
        <blockquote
          class="tiktok-embed rounded-2xl border-4 border-[#39FF14] shadow-[8px_8px_0_#39FF14]"
          cite="https://www.tiktok.com/@bambalerequin/video/7463203868734672134"
          data-video-id="7463203868734672134"
          style="max-width: 605px;min-width: 325px;"
        >
          <section>
            <a target="_blank" title="@bambalerequin" href="https://www.tiktok.com/@bambalerequin?refer=embed">@bambalerequin</a>
            Maxi et Walmart seront rajoutés !
            <a title="economiser" target="_blank" href="https://www.tiktok.com/tag/economiser?refer=embed">#economiser</a>
            <a title="application" target="_blank" href="https://www.tiktok.com/tag/application?refer=embed">#application</a>
            <a title="montreal" target="_blank" href="https://www.tiktok.com/tag/montreal?refer=embed">#montreal</a>
            <a title="mtl" target="_blank" href="https://www.tiktok.com/tag/mtl?refer=embed">#mtl</a>
            <a title="mtlfood" target="_blank" href="https://www.tiktok.com/tag/mtlfood?refer=embed">#mtlfood</a>
            <a title="fyp" target="_blank" href="https://www.tiktok.com/tag/fyp?refer=embed">#fyp</a>
            <a target="_blank" title="♬ son original - bamba" href="https://www.tiktok.com/music/son-original-7463203882172599045?refer=embed">♬ son original - bamba</a>
          </section>
        </blockquote>
      </div>
    </div>
  </section>
</template>
