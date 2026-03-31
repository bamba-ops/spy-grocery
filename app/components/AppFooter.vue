<script setup lang="ts">
const currentYear = new Date().getFullYear()

const footerColumns = [
  {
    title: 'Tools',
    links: [
      { label: 'Price Search', to: '/search' },
      { label: 'Store Map', to: '/search' },
      { label: 'Retail List', to: '/lists' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of services', to: '/terms' },
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Licenses', to: '/licenses' }
    ]
  }
]
</script>

<template>
  <footer id="about" class="bg-black text-white">
    <div class="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pb-14 sm:pt-16">
      <div class="grid gap-10 border-t border-white/10 pt-8 sm:pt-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/50">Spygrocery</p>
          <p class="mt-4 text-sm text-white/70">
            The price intelligence tool for your local neighborhood.
          </p>
        </div>

        <div class="grid gap-8 sm:grid-cols-2">
          <div v-for="column in footerColumns" :key="column.title">
            <h4 class="text-[10px] uppercase tracking-[0.35em] text-white/60">{{ column.title }}</h4>
            <ul class="mt-4 space-y-3 text-xs uppercase tracking-[0.25em] text-white/70">
              <li v-for="link in column.links" :key="link.label">
                <NuxtLink
                  :to="link.to"
                  class="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

      </div>

      <div class="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.35em] text-white/40 sm:flex-row">
        <span>© {{ currentYear }} Spygrocery</span>
      </div>
    </div>
  </footer>
</template>
