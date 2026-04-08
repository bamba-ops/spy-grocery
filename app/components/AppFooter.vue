<script setup lang="ts">
const currentYear = new Date().getFullYear()
const { fetchStores } = useStores()

const { data: storeLinksData } = await useAsyncData('footer-store-links', async () => {
  const stores = await fetchStores()

  return stores
    .sort((a, b) => {
      if (a.product_count !== b.product_count) {
        return b.product_count - a.product_count
      }

      return a.name.localeCompare(b.name)
    })
    .slice(0, 10)
    .map((store) => ({
      label: store.name,
      to: `/magasins/${encodeURIComponent(store.slug)}`
    }))
})

const storeLinks = computed(() => storeLinksData.value || [])

const footerColumns = [
  {
    title: 'Mentions legales',
    links: [
      { label: 'Conditions de service', to: '/terms' },
      { label: 'Politique de confidentialite', to: '/privacy' },
      { label: 'Licences', to: '/licenses' }
    ]
  }
]
</script>

<template>
  <footer id="about" class="bg-black text-white">
    <div class="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pb-14 sm:pt-16">
      <div class="grid gap-10 border-t border-white/10 pt-8 sm:pt-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/50">SpyGrocery</p>
          <p class="mt-4 text-sm text-white/70">
            L'outil pour comparer les prix et economiser a l'epicerie pres de chez vous.
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

        <div>
          <h4 class="text-[10px] uppercase tracking-[0.35em] text-white/60">Magasins</h4>
          <ul class="mt-4 space-y-3 text-sm uppercase tracking-[0.16em] text-white/85 sm:text-base">
            <li v-for="store in storeLinks" :key="store.to">
              <NuxtLink
                :to="store.to"
                class="font-semibold transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {{ store.label }}
              </NuxtLink>
            </li>
          </ul>
          <p v-if="storeLinks.length === 0" class="mt-4 text-sm text-white/60">
            Les pages magasins se chargent.
          </p>
        </div>

      </div>

      <div class="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.35em] text-white/40 sm:flex-row">
        <span>© {{ currentYear }} Spygrocery</span>
      </div>
    </div>
  </footer>
</template>
