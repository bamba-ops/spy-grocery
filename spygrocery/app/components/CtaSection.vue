<script setup lang="ts">
const ctaLabel = 'START SPYING FOR FREE'
</script>

<template>
  <section class="py-24 bg-white text-center">
    <div class="mx-auto max-w-4xl px-4">
      <!-- Headline -->
      <h2 class="mb-8 text-5xl font-black italic uppercase italic tracking-tighter text-black sm:text-7xl md:text-8xl leading-[0.9]">
        Stop Overpaying.<br />
        Start Spying.
      </h2>

      <!-- CTA Button -->
      <div class="mt-12 flex flex-col items-center gap-4">
        <NuxtLink
          to="#compare"
           class="inline-block rounded-full border-4 border-black bg-black px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-[#39FF14] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_#39FF14] focus:outline-none focus:ring-4 focus:ring-black/20 sm:text-base"
        >
          {{ ctaLabel }}
        </NuxtLink>
        
        <!-- Objection Handling -->
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">
          No credit card required • Instant access
        </p>
      </div>
    </div>
  </section>
</template>
