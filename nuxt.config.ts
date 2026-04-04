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
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      meta: [
        { name: 'theme-color', content: '#000000' },
        { name: 'msapplication-TileColor', content: '#000000' }
      ]
    }
  },
  runtimeConfig: {
    aiGatewayApiKey: process.env.NUXT_AI_GATEWAY_API_KEY,
    aiGatewayModel: process.env.NUXT_AI_GATEWAY_MODEL,
    public: {
      posthogPublicKey: process.env.NUXT_PUBLIC_POSTHOG_KEY,
      posthogHost: process.env.NUXT_PUBLIC_POSTHOG_HOST,
      posthogDefaults: process.env.NUXT_PUBLIC_POSTHOG_DEFAULTS,
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAC0qEv0IAgoV4X5w',
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
