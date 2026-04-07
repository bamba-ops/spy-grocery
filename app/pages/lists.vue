<script setup lang="ts">
import { useListsStore } from '~/stores/lists'

const listsStore = useListsStore()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://spygrocery.com').replace(/\/$/, '')

definePageMeta({
  layout: 'bottom-nav',
  middleware: ['auth', 'onboarding']
})

useServerSeoMeta({
  robots: 'noindex,follow'
})

useHead({
  title: 'Mes listes - SpyGrocery',
  link: [
    {
      rel: 'canonical',
      href: `${siteUrl}/lists`
    },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;1,600&family=Manrope:wght@400;500;600&display=swap'
    }
  ]
})

onMounted(() => {
  listsStore.setLoadListsPage()
})

</script>

<template>
  <div class="min-h-screen bg-black font-sans text-white">
    <div class="pointer-events-none fixed inset-0   bg-[radial-gradient(1200px_650px_at_20%_10%,rgba(255,255,255,0.12),transparent_58%),radial-gradient(900px_600px_at_85%_35%,rgba(255,255,255,0.08),transparent_60%),radial-gradient(700px_520px_at_40%_85%,rgba(255,255,255,0.06),transparent_60%)]"></div>

    <main class="relative mx-auto max-w-7xl px-4 pb-28 pt-16 sm:px-6">
      <div class="flex flex-col gap-10">
        <div class="flex items-end justify-between gap-6">
          <h1 class="font-display text-6xl font-semibold italic tracking-tight sm:text-7xl">Mes listes</h1>
        </div>

        <ListsToolbar :model-value="listsStore.listsControls" @update:modelValue="listsStore.setListsControls" />

        <div v-if="listsStore.error" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          {{ listsStore.error }}
        </div>

        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <SavedListCard
            v-for="list in listsStore.filteredLists"
            :key="list.name"
            :list="list"
            @open="listsStore.setCurrentListFromStorageByName"
            @delete="listsStore.deleteListsStorageByName"
          />
          <CreateListCard to="/search" />
        </div>
      </div>
    </main>
  </div>
</template>
