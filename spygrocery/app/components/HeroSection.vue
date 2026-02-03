<script setup lang="ts">
const primaryCtaLabel = 'SPY YOUR SAVINGS'
</script>

<template>
  <section id="compare" class="relative overflow-hidden bg-[#39FF14]" aria-labelledby="hero-title">
    <div
      class="relative mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center px-4 pb-20 pt-14 text-center"
    >
      <img
        src="/magnifying-glass-grocery-receipt-sticker.png"
        alt=""
        class="pointer-events-none absolute left-0 top-32 z-0 h-28 w-auto -rotate-12 drop-shadow-[5px_5px_0_rgba(0,0,0,1)] sm:-left-2 sm:top-24 sm:h-40 md:top-20 md:h-52"
        aria-hidden="true"
        loading="lazy"
      />
      <img
        src="/apple-banana-straw.png"
        alt=""
        class="pointer-events-none absolute right-0 top-12 z-0 h-28 w-auto rotate-6 opacity-85 sm:-right-2 sm:top-10 sm:h-40 sm:opacity-100 md:top-6 md:h-52"
        aria-hidden="true"
        loading="lazy"
      />
      <div class="relative z-10 flex w-full flex-col items-center">
      <div
        class="inline-flex items-center gap-2 rounded-full border-4 border-black bg-[#E8FFE8] px-4 py-1 text-[10px] font-black uppercase tracking-[0.25em]"
      >
        <span aria-hidden="true">💸</span>
        Now tracking 12,000+ stores
      </div>

      <div class="mt-8 w-full max-w-4xl">
        <h1
          id="hero-title"
          class="text-[clamp(2.6rem,7vw,5.6rem)] font-black italic uppercase leading-[0.9] tracking-tight text-black"
        >
          Cut your grocery bill by
          <span class="mt-3 inline-block border-4 border-black bg-[#39FF14] px-4 py-2">
            40% every week
          </span>
          without changing where you shop.
        </h1>
      </div>

      <p class="mt-6 max-w-2xl text-sm font-semibold text-black/70 sm:text-base">
        SpyGrocery monitors 12,000+ stores in real time to show the absolute lowest price on every
        item in your list.
      </p>

      <div class="mt-8 flex flex-col items-center gap-4">
        <NuxtLink
          class="rounded-full border-4 border-black bg-black px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#39FF14] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/20"
          to="#compare"
        >
          {{ primaryCtaLabel }}
        </NuxtLink>
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-black/70">
          <div class="flex -space-x-2">
            <span class="h-6 w-6 rounded-full border-2 border-black bg-white" aria-hidden="true"></span>
            <span class="h-6 w-6 rounded-full border-2 border-black bg-white" aria-hidden="true"></span>
            <span class="h-6 w-6 rounded-full border-2 border-black bg-white" aria-hidden="true"></span>
          </div>
          Join 50,000+ smart shoppers
        </div>
      </div>

      <div id="price-drops" class="mt-20 w-full max-w-6xl">
        <div class="mb-10 flex items-center justify-center gap-4 text-black">
          <span class="h-1 w-8 bg-black sm:w-16" aria-hidden="true"></span>
          <h2 class="text-center text-3xl font-black italic uppercase tracking-tighter sm:text-5xl">
            Top Price Drops Today
          </h2>
          <span class="h-1 w-8 bg-black sm:w-16" aria-hidden="true"></span>
        </div>

        <div class="grid gap-4 sm:grid-cols-3 sm:gap-6">
          <!-- Card 1 -->
          <div class="group relative flex flex-col rounded-2xl border-4 border-black bg-white p-3 shadow-[6px_6px_0_#000] transition hover:-translate-y-1 hover:shadow-[10px_10px_0_#000] sm:rounded-[2.5rem] sm:p-6 sm:shadow-[8px_8px_0_#000] sm:hover:shadow-[12px_12px_0_#000]">
            <div class="absolute -right-2 -top-3 -rotate-12 transform rounded-full border-4 border-black bg-[#FF2A6D] px-2 py-0.5 text-[10px] font-black text-white shadow-[2px_2px_0_#000] sm:-top-4 sm:px-4 sm:py-1 sm:text-sm sm:shadow-[4px_4px_0_#000]">
              -52%
            </div>
            <div class="mb-3 flex aspect-square items-center justify-center rounded-xl border-4 border-black bg-[#F0F0F0] p-2 sm:mb-6 sm:rounded-2xl sm:p-8">
               <span class="text-3xl sm:text-6xl">🥑</span>
            </div>
            <div class="mt-auto text-left">
              <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-black/60 sm:text-[10px]">Produce</p>
              <h3 class="mt-0.5 text-lg font-black italic uppercase leading-none tracking-tight text-black sm:mt-1 sm:text-2xl">Ripe Avocado</h3>
              <div class="mt-2 flex items-baseline gap-2 sm:mt-3 sm:gap-3">
                <span class="text-xl font-black text-black sm:text-3xl">$0.89</span>
                <span class="text-[10px] font-bold text-gray-400 line-through decoration-2 sm:text-sm">$1.85</span>
              </div>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="group relative flex flex-col rounded-2xl border-4 border-black bg-white p-3 shadow-[6px_6px_0_#000] transition hover:-translate-y-1 hover:shadow-[10px_10px_0_#000] sm:rounded-[2.5rem] sm:p-6 sm:shadow-[8px_8px_0_#000] sm:hover:shadow-[12px_12px_0_#000]">
            <div class="absolute -right-2 -top-3 rotate-6 transform rounded-full border-4 border-black bg-[#39FF14] px-2 py-0.5 text-[10px] font-black text-black shadow-[2px_2px_0_#000] sm:-top-4 sm:px-4 sm:py-1 sm:text-sm sm:shadow-[4px_4px_0_#000]">
              -38%
            </div>
            <div class="mb-3 flex aspect-square items-center justify-center rounded-xl border-4 border-black bg-[#F0F0F0] p-2 sm:mb-6 sm:rounded-2xl sm:p-8">
               <span class="text-3xl sm:text-6xl">☕</span>
            </div>
            <div class="mt-auto text-left">
              <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-black/60 sm:text-[10px]">Pantry</p>
              <h3 class="mt-0.5 text-lg font-black italic uppercase leading-none tracking-tight text-black sm:mt-1 sm:text-2xl">Organic Roast</h3>
              <div class="mt-2 flex items-baseline gap-2 sm:mt-3 sm:gap-3">
                <span class="text-xl font-black text-black sm:text-3xl">$8.45</span>
                <span class="text-[10px] font-bold text-gray-400 line-through decoration-2 sm:text-sm">$12.99</span>
              </div>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="group relative flex flex-col rounded-2xl border-4 border-black bg-white p-3 shadow-[6px_6px_0_#000] transition hover:-translate-y-1 hover:shadow-[10px_10px_0_#000] sm:rounded-[2.5rem] sm:p-6 sm:shadow-[8px_8px_0_#000] sm:hover:shadow-[12px_12px_0_#000]">
            <div class="absolute -right-2 -top-3 -rotate-3 transform rounded-full border-4 border-black bg-black px-2 py-0.5 text-[10px] font-black text-[#39FF14] shadow-[2px_2px_0_#000] sm:-top-4 sm:px-4 sm:py-1 sm:text-sm sm:shadow-[4px_4px_0_#000]">
              -41%
            </div>
            <div class="mb-3 flex aspect-square items-center justify-center rounded-xl border-4 border-black bg-[#F0F0F0] p-2 sm:mb-6 sm:rounded-2xl sm:p-8">
               <span class="text-3xl sm:text-6xl">🥛</span>
            </div>
            <div class="mt-auto text-left">
              <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-black/60 sm:text-[10px]">Dairy</p>
              <h3 class="mt-0.5 text-lg font-black italic uppercase leading-none tracking-tight text-black sm:mt-1 sm:text-2xl">Whole Milk</h3>
              <div class="mt-2 flex items-baseline gap-2 sm:mt-3 sm:gap-3">
                <span class="text-xl font-black text-black sm:text-3xl">$2.10</span>
                <span class="text-[10px] font-bold text-gray-400 line-through decoration-2 sm:text-sm">$3.55</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </section>
</template>
