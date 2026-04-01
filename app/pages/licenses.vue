<script setup lang="ts">
const lastUpdated = 'March 31, 2026'

const libraries = [
  { name: 'Nuxt', license: 'MIT', url: 'https://github.com/nuxt/nuxt' },
  { name: 'Vue', license: 'MIT', url: 'https://github.com/vuejs/core' },
  { name: 'Pinia', license: 'MIT', url: 'https://github.com/vuejs/pinia' },
  { name: '@nuxtjs/supabase', license: 'MIT', url: 'https://github.com/nuxt-modules/supabase' },
  { name: 'lucide-vue-next', license: 'ISC', url: 'https://github.com/lucide-icons/lucide' },
  { name: 'zod', license: 'MIT', url: 'https://github.com/colinhacks/zod' },
  { name: 'vue-sonner', license: 'MIT', url: 'https://github.com/xiaoluoboding/vue-sonner' }
]

useHead({
  title: 'Licenses — SpyGrocery',
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
})
</script>

<template>
  <LegalPageShell
    title="Licenses"
    intro="SpyGrocery depends on open-source software. This page lists key libraries used in the product."
    :last-updated="lastUpdated"
  >
    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Open-source dependencies</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        The tools below are part of our current stack. Each project keeps its own official license terms.
      </p>

      <div class="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/40">
        <div
          v-for="library in libraries"
          :key="library.name"
          class="flex flex-col gap-2 px-4 py-4 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="font-medium text-white">{{ library.name }}</p>
          <div class="flex items-center gap-4">
            <p class="text-[10px] uppercase tracking-[0.25em] text-white/55">{{ library.license }}</p>
            <a
              :href="library.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-[10px] uppercase tracking-[0.25em] text-white/70 underline underline-offset-4 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Project
            </a>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Additional notices</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        If you need full third-party notices for compliance review, contact:
        <a
          href="mailto:legal@spygrocery.com"
          class="ml-1 underline underline-offset-4 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          legal@spygrocery.com
        </a>
      </p>
    </section>
  </LegalPageShell>
</template>
