<script setup lang="ts">
import { useSearchStore } from '~/stores/search'

const searchStore = useSearchStore()

definePageMeta({
  layout: 'bottom-nav'
})

useHead({
  title: 'Search Products — SpyGrocery',
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

onMounted(() => {
  searchStore.setSearchPageInitialized()
})
</script>

<template>
  <div class="min-h-screen bg-black font-sans text-white">
    <main class="mx-auto grid max-w-7xl gap-6 px-4 pb-28 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section>
        <SearchResults />
      </section>

      <aside class="hidden lg:block">
        <SearchListPanel />
      </aside>
    </main>

    <ChatBot />
  </div>
</template>
