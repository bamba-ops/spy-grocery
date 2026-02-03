<script setup lang="ts">
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
      href: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;1,700;1,800&display=swap'
    }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-[#F5F5DC] font-['Barlow_Condensed']">
    <AppNavBar />
    
    <main class="mx-auto max-w-[1400px] px-6 py-8">
      <div class="flex gap-8">
        <!-- Sidebar - Fixed Width -->
        <aside class="w-64 shrink-0">
          <SearchSidebar />
        </aside>

        <!-- Main Content -->
        <div class="flex-1">
          <SearchResults />
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
