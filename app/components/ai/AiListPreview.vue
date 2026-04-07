<script setup lang="ts">
import type { ListProduct } from '#shared/types/lists'

const props = defineProps<{
  items: ListProduct[]
}>()

defineEmits<{
  (event: 'add'): void
  (event: 'dismiss'): void
}>()

const groupedItems = computed(() => {
  return props.items.reduce((groups, item) => {
    const storeName = item.product.store || 'Magasin inconnu'
    if (!groups[storeName]) {
      groups[storeName] = []
    }

    groups[storeName].push(item)
    return groups
  }, {} as Record<string, ListProduct[]>)
})

const groupedItemsEntries = computed(() => {
  return Object.entries(groupedItems.value)
})

const storeTotals = computed(() => {
  return groupedItemsEntries.value.reduce((totals, [storeName, items]) => {
    totals[storeName] = items.reduce((acc, item) => {
      return acc + (item.product.price_num ?? 0) * item.quantity
    }, 0)
    return totals
  }, {} as Record<string, number>)
})

const grandTotal = computed(() => {
  return props.items.reduce((acc, item) => acc + (item.product.price_num ?? 0) * item.quantity, 0)
})
</script>

<template>
  <div class="w-full max-w-[92%] rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/90 sm:text-base">
    <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Liste suggeree</p>

    <div class="mt-3 space-y-6">
      <div
        v-for="([storeName, storeItems], groupIndex) in groupedItemsEntries"
        :key="`${storeName}-${groupIndex}`"
        class="space-y-3"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold uppercase tracking-[0.2em] text-white/90 sm:text-base">{{ storeName }}</span>
          <span class="text-[10px] uppercase tracking-[0.3em] text-white/60">${{ storeTotals[storeName]?.toFixed(2) }}</span>
        </div>

        <div
          v-for="item in storeItems"
          :key="item.product.id"
          class="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-3"
        >
          <div class="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/10 text-white/60">
            <img
              v-if="item.product.image_url"
              :src="item.product.image_url"
              :alt="item.product.title"
              class="h-full w-full object-contain"
              loading="lazy"
            >
            <div v-else class="text-2xl">◻</div>
            <div class="pointer-events-none absolute inset-0 bg-black/35"></div>
          </div>

          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold italic text-white">{{ item.product.title }}</p>
            <p class="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/60">
              ${{ item.product.price_num?.toFixed(2) ?? 'N/D' }}
            </p>
            <p class="mt-2 text-xs uppercase tracking-[0.3em] text-white/70">Qte {{ item.quantity }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 border-t border-white/10 pt-4">
      <div class="flex items-center justify-between text-sm uppercase tracking-[0.35em] text-white/70">
        <span>Total estime</span>
        <span class="font-display text-2xl font-semibold italic text-white">${{ grandTotal.toFixed(2) }}</span>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-2">
      <button
        type="button"
        class="rounded-full border border-white/20 bg-white px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        @click="$emit('add')"
      >
        Ajouter a la liste
      </button>
      <button
        type="button"
        class="rounded-full border border-white/20 bg-transparent px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        @click="$emit('dismiss')"
      >
        Ignorer
      </button>
    </div>
  </div>
</template>
