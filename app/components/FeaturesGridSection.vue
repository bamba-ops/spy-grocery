<script setup lang="ts">
const features = [
  {
    title: 'Live prices',
    description: 'Our data is updated constantly throughout the day for accuracy.'
  },
  {
    title: 'Local stores only',
    description: 'We focus on the retailers near you, not generic online shopping rates.'
  },
  {
    title: 'Private search',
    description: 'We don’t track your shopping habits. Your data stays private.'
  }
]
</script>

<template>
  <section id="features" class="bg-black text-white">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div class="grid gap-6 md:grid-cols-2">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:bg-white/10"
        >
          <div class="mb-6 text-xl">◎</div>
          <h3 class="text-lg font-semibold italic">{{ feature.title }}</h3>
          <p class="mt-3 text-sm text-white/80">{{ feature.description }}</p>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white p-8 text-black">
          <h3 class="text-lg font-semibold italic">Ready to save?</h3>
          <p class="mt-3 text-sm text-black/70">
            Join thousands of smart shoppers comparing local grocery prices every day.
          </p>
          <button class="mt-8 w-full rounded-full border border-black/20 bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-black transition hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto">
            Compare Local Prices
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
