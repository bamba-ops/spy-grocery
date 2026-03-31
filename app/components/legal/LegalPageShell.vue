<script setup lang="ts">
defineProps<{
  title: string
  intro: string
  lastUpdated: string
}>()
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-black font-sans text-white">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_680px_at_50%_0%,rgba(255,255,255,0.1),transparent_56%),radial-gradient(900px_560px_at_10%_78%,rgba(255,255,255,0.06),transparent_62%),radial-gradient(700px_480px_at_92%_68%,rgba(255,255,255,0.05),transparent_60%)]" />

    <header class="relative z-10 border-b border-white/10 bg-black/80 backdrop-blur">
      <div class="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
        <NuxtLink
          to="/"
          class="font-display text-3xl italic tracking-tight text-white transition hover:text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          SpyGrocery
        </NuxtLink>

        <NuxtLink
          to="/"
          class="rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Back home
        </NuxtLink>
      </div>
    </header>

    <main class="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-12 sm:px-6 sm:pt-14">
      <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Legal</p>
      <h1 class="mt-4 font-display text-5xl font-semibold italic tracking-tight text-white sm:text-6xl">
        {{ title }}
      </h1>
      <p class="mt-5 max-w-2xl text-sm text-white/70 sm:text-base">
        {{ intro }}
      </p>
      <p class="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/45">
        Last updated {{ lastUpdated }}
      </p>

      <div class="mt-10 space-y-9 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
