<script setup lang="ts">
const props = defineProps<{
  to: string
}>()
</script>

<template>
  <NuxtLink
    :to="props.to"
    class="group relative flex h-[260px] w-full flex-col items-center justify-center overflow-hidden rounded-[36px] border border-dashed border-white/15 bg-white/[0.03] p-7 text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)] transition hover:border-white/25"
  >
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_420px_at_50%_40%,rgba(255,255,255,0.05),transparent_60%)]"></div>
    <div class="relative">
      <div class="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5 text-2xl text-white/70 transition group-hover:text-white">
        +
      </div>
      <div class="mt-6 text-[10px] uppercase tracking-[0.35em] text-white/50">Go to search</div>
    </div>
  </NuxtLink>
</template>
