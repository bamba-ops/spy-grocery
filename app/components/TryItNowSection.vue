<script setup lang="ts">
const items = [
  { title: 'Organic Milk', label: 'Dairy' },
  { title: 'Fresh Avocados', label: 'Produce' },
  { title: 'Sourdough Bread', label: 'Bakery' }
]
</script>

<template>
  <section class="bg-black text-white">
    <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div class="mb-8 flex items-center justify-between">
        <h2 class="font-['Cormorant_Garamond'] text-2xl font-semibold italic">Try it now</h2>
        <span class="text-[10px] uppercase tracking-[0.35em] text-white/60">Selected essentials</span>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <div
          v-for="item in items"
          :key="item.title"
          class="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
        >
          <div class="mb-6 flex h-40 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/15 via-white/5 to-white/10 sm:h-48">
            <div class="h-20 w-20 rounded-full border border-white/15 bg-white/10"></div>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">{{ item.label }}</p>
              <h3 class="mt-2 text-lg font-semibold italic">{{ item.title }}</h3>
            </div>
            <span class="text-white/60">↗</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
