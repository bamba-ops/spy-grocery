<script setup lang="ts">
const currentYear = new Date().getFullYear()

const footerColumns = [
  {
    title: 'Tools',
    links: ['Price Search', 'Store Map', 'Retail List']
  },
  {
    title: 'Company',
    links: ['About Us', 'Privacy', 'Contact']
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
              <li v-for="link in column.links" :key="link">
                <a href="#" class="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black">{{ link }}</a>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h4 class="text-[10px] uppercase tracking-[0.35em] text-white/60">Updates</h4>
          <p class="mt-4 text-sm text-white/70">Get early beta and price alerts.</p>
          <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="email"
              placeholder="Email address"
              class="h-11 w-full rounded-full border border-white/20 bg-transparent px-4 text-[10px] uppercase tracking-[0.25em] text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            />
            <button class="h-11 w-full rounded-full border border-white/20 px-4 text-[10px] uppercase tracking-[0.3em] text-white transition hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div class="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.35em] text-white/40 sm:flex-row">
        <span>© {{ currentYear }} Spygrocery</span>
        <div class="flex gap-6">
          <a href="#" class="hover:text-white">Privacy</a>
          <a href="#" class="hover:text-white">Terms</a>
          <a href="#" class="hover:text-white">Security</a>
        </div>
      </div>
    </div>
  </footer>
</template>
