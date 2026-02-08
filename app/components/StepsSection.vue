<script setup lang="ts">
const steps = [
  {
    number: '01.',
    title: 'Set location',
    description: 'Enter your address to find every grocery store within your radius.'
  },
  {
    number: '02.',
    title: 'Find products',
    description: 'Search the items on your list and see live shelf prices instantly.'
  },
  {
    number: '03.',
    title: 'Save money',
    description: 'Compare results and head to the store with the best deal.'
  }
]
</script>

<template>
  <section id="process" class="bg-white text-black">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div class="grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <h2 class="font-['Cormorant_Garamond'] text-4xl font-semibold italic leading-tight sm:text-5xl">
          Simplicity
          <br />
          by design.
        </h2>
        <p class="max-w-md text-sm font-medium text-black/70 sm:text-base">
          Three simple steps to grocery savings. We scan local stores so you don’t have to.
        </p>
      </div>

      <div class="mt-8 rounded-2xl border border-black/10 p-8 sm:mt-10 sm:pt-10">
        <div class="grid gap-8 md:grid-cols-3">
          <div v-for="step in steps" :key="step.number">
            <p class="text-sm font-semibold italic text-black/40">{{ step.number }}</p>
            <h3 class="mt-3 text-base font-semibold uppercase tracking-[0.25em]">{{ step.title }}</h3>
            <p class="mt-3 text-sm text-black/70">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
