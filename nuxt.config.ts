// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', 'shadcn-nuxt'],
  runtimeConfig: {
    aiGatewayApiKey: process.env.NUXT_AI_GATEWAY_API_KEY || '',
    aiGatewayModel: process.env.NUXT_AI_GATEWAY_MODEL || 'openai/gpt-5-nano'
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
