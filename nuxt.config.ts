// https://nuxt.com/docs/api/configuration/nuxt-config
const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'https://spygrocery.com'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@nuxtjs/robots', '@nuxtjs/sitemap', 'shadcn-nuxt'],
  app: {
    head: {
      htmlAttrs: {
        lang: 'fr-CA'
      }
    }
  },
  runtimeConfig: {
    aiGatewayApiKey: process.env.NUXT_AI_GATEWAY_API_KEY,
    aiGatewayModel: process.env.NUXT_AI_GATEWAY_MODEL,
    public: {
      siteUrl: SITE_URL
    }
  },
  site: {
    url: SITE_URL
  },
  sitemap: {
    sources: ['/api/__sitemap__/urls']
  },
  robots: {
    disallow: ['/auth/', '/onboarding'],
    sitemap: [`${SITE_URL}/sitemap.xml`]
  },
  imports: {
    dirs: ['~/composables/**']
  },
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui'
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_PUBLISHABLE_KEY,
    types: '../shared/types/database.types.ts',
    redirect: false
  }
})
