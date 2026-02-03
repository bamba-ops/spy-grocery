<script setup lang="ts">
import { Search, ArrowLeftRight, PiggyBank } from 'lucide-vue-next'
</script>

<template>
  <section id="how" class="py-20 bg-white">
    <!-- Retailer Marquee/Logos -->
    <div class="mb-20 text-center">
       <p class="mb-8 text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 sm:text-xs">Tracking Prices Across</p>
       <div class="flex flex-wrap justify-center gap-6 px-4 opacity-30 grayscale sm:gap-16">
          <span class="text-lg font-black uppercase text-black">Retail One</span>
          <span class="text-lg font-black uppercase text-black">Mart-X</span>
          <span class="text-lg font-black uppercase text-black">Grocery Go</span>
          <span class="text-lg font-black uppercase text-black">Whole-Foods</span>
          <span class="text-lg font-black uppercase text-black">Super-Save</span>
       </div>
    </div>

    <!-- How It Works -->
    <div class="mx-auto max-w-6xl px-4 text-center">
      <h2 class="mb-16 text-4xl font-black italic uppercase tracking-tighter text-black sm:text-5xl md:text-7xl">
        How It Works
      </h2>

      <div class="grid gap-12 sm:grid-cols-3">
        <!-- Step 1 -->
        <div class="flex flex-col items-center">
          <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#39FF14] text-black shadow-[6px_6px_0_#000] border-4 border-black -rotate-3 transition-transform hover:rotate-0">
            <Search :size="32" :stroke-width="3" />
          </div>
          <h3 class="mb-2 text-2xl font-black uppercase italic">1. Search</h3>
          <p class="max-w-[200px] text-sm font-medium leading-relaxed text-black/60">
            Enter your grocery list. We track over 12,000 locations in real-time.
          </p>
        </div>

        <!-- Step 2 -->
        <div class="flex flex-col items-center">
          <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-black shadow-[6px_6px_0_#000] border-4 border-black rotate-2 transition-transform hover:rotate-0">
            <ArrowLeftRight :size="32" :stroke-width="3" />
          </div>
          <h3 class="mb-2 text-2xl font-black uppercase italic">2. Compare</h3>
          <p class="max-w-[200px] text-sm font-medium leading-relaxed text-black/60">
            Instantly see which store nearby has the absolute lowest price today.
          </p>
        </div>

        <!-- Step 3 -->
        <div class="flex flex-col items-center">
           <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#39FF14] text-black shadow-[6px_6px_0_#000] border-4 border-black -rotate-1 transition-transform hover:rotate-0">
            <PiggyBank :size="32" :stroke-width="3" />
          </div>
          <h3 class="mb-2 text-2xl font-black uppercase italic">3. Save</h3>
          <p class="max-w-[200px] text-sm font-medium leading-relaxed text-black/60">
            Head to the store and save up to 40% on your total bill. It's that easy.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
