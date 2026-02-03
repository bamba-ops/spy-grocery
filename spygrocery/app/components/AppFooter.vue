<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t-4 border-[#39FF14] bg-black px-4 py-16 text-white">
    <div class="mx-auto flex max-w-6xl flex-col justify-between gap-12 md:flex-row">
      <!-- Brand -->
      <div class="max-w-xs">
        <div class="mb-6 flex items-center text-3xl font-black italic tracking-tighter">
          <span class="text-white">SPY</span>
          <span class="bg-[#39FF14] px-1 text-black">GROCERY</span>
        </div>
        <p class="text-xs font-medium leading-relaxed text-gray-400">
          The only intelligence tool you need for the grocery store. No price hidden. No deal missed.
        </p>
      </div>

      <!-- Links Grid -->
      <div class="flex flex-wrap gap-12 sm:gap-20">
        <!-- Column 1 -->
        <div class="flex flex-col gap-4">
          <h4 class="text-xs font-black uppercase tracking-[0.2em] text-[#39FF14]">Retailers</h4>
          <a href="#" class="text-xs font-bold uppercase tracking-wider text-white hover:text-[#39FF14]">Walmart</a>
          <a href="#" class="text-xs font-bold uppercase tracking-wider text-white hover:text-[#39FF14]">Target</a>
          <a href="#" class="text-xs font-bold uppercase tracking-wider text-white hover:text-[#39FF14]">Whole Foods</a>
          <a href="#" class="text-xs font-bold uppercase tracking-wider text-white hover:text-[#39FF14]">Aldi</a>
        </div>

        <!-- Column 2 -->
        <div class="flex flex-col gap-4">
          <h4 class="text-xs font-black uppercase tracking-[0.2em] text-[#39FF14]">Legal</h4>
          <a href="#" class="text-xs font-bold uppercase tracking-wider text-white hover:text-[#39FF14]">Privacy Policy</a>
          <a href="#" class="text-xs font-bold uppercase tracking-wider text-white hover:text-[#39FF14]">Terms of Use</a>
          <a href="#" class="text-xs font-bold uppercase tracking-wider text-white hover:text-[#39FF14]">Contact</a>
        </div>

        <!-- Column 3 -->
        <div class="flex flex-col gap-4">
          <h4 class="text-xs font-black uppercase tracking-[0.2em] text-[#39FF14]">Social</h4>
          <a href="#" class="text-xs font-bold uppercase tracking-wider text-white hover:text-[#39FF14]">Instagram</a>
          <a href="#" class="text-xs font-bold uppercase tracking-wider text-white hover:text-[#39FF14]">Twitter/X</a>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="mx-auto mt-20 flex max-w-6xl flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-[10px] font-bold uppercase tracking-widest text-[#555] sm:flex-row">
      <p>© {{ currentYear }} SPYGROCERY TECH</p>
    </div>
  </footer>
</template>
