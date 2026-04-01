<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://spygrocery.com').replace(/\/$/, '')

const seoTitle = 'SpyGrocery - Comparez les prix en epicerie au Quebec'
const seoDescription = 'SpyGrocery vous aide a comparer les aubaines en epicerie, reduire le total du panier et economiser selon les prix par magasin au Quebec.'

const seoJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SpyGrocery',
    url: `${siteUrl}/`,
    logo: `${siteUrl}/favicon.ico`
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SpyGrocery',
    url: `${siteUrl}/`
  }
]

useServerSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogType: 'website',
  ogUrl: `${siteUrl}/`,
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  robots: 'index,follow'
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: `${siteUrl}/`
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
  ],
  script: seoJsonLd.map((data) => ({
    type: 'application/ld+json',
    children: JSON.stringify(data)
  }))
})
</script>

<template>
  <div class="bg-black text-white">
    <AppHeader />
    <HeroSection />
    <StepsSection />
    <FeaturesGridSection />
    <TikTokTestimonialSection />
    <AppFooter />
  </div>
</template>
