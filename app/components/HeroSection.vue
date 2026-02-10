<script setup lang="ts">
const searchPlaceholder = 'Search items (e.g., Eggs, Coffee...)'
</script>

<template>
  <section class="relative overflow-hidden bg-black text-white">
    <div class="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-[120px]"></div>
    <div class="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-[120px]"></div>

    <div class="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
      <div class="max-w-3xl">
        <h1 class="font-display text-[clamp(2.6rem,6vw,4.8rem)] font-semibold italic leading-[0.95] tracking-tight text-white">
          Locate the lowest prices.
          <br />
          In real-time.
        </h1>
        <p class="mt-4 max-w-2xl text-sm font-medium text-white/80 sm:mt-6 sm:text-base">
          Search any grocery item and instantly compare live prices across local stores.
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
          <div class="flex h-11 w-full items-center gap-3 rounded-full border border-white/20 bg-white/5 px-4 focus-within:ring-2 focus-within:ring-white/60 focus-within:ring-offset-2 focus-within:ring-offset-black sm:flex-1">
            <span class="text-white/60">⌕</span>
            <input
              type="text"
              :placeholder="searchPlaceholder"
              class="h-full w-full bg-transparent text-[10px] uppercase tracking-[0.2em] text-white placeholder:text-white/40 focus:outline-none sm:text-xs"
            />
          </div>
          <button class="h-11 w-full rounded-full border border-white/20 bg-white px-6 text-[10px] font-semibold uppercase tracking-[0.35em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto">
            Compare Local Prices
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
