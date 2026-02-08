<script setup lang="ts">
useHead({
  title: 'SpyGrocery — Locate the lowest prices',
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
      href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Manrope:wght@400;500;600&display=swap'
    }
  ]
})
</script>

<template>
  <div class="bg-black font-['Manrope'] text-white">
    <AppHeader />
    <HeroSection />
    <TryItNowSection />
    <StepsSection />
    <FeaturesGridSection />
    <TikTokTestimonialSection />
    <AppFooter />
  </div>
</template>
