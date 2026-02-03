<script setup lang="ts">
useHead({
  title: 'SpyGrocery — Cut your grocery bill',
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
      href: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;1,700;1,800&display=swap'
    }
  ]
})
</script>

<template>
  <div class="bg-white font-['Barlow_Condensed']">
    <AppNavBar />
    <HeroSection />
    <HowItWorks />
    <WallOfLove />
    <CtaSection />
    <AppFooter />
  </div>
</template>
