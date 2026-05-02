<script setup lang="ts">
import { Search, Plus } from 'lucide-vue-next'

export type ListsSort = 'recent' | 'name' | 'total'

const props = defineProps<{
  modelValue: {
    sort: ListsSort
    query: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { sort: ListsSort; query: string }): void
}>()

const setSort = (sort: ListsSort) => {
  emit('update:modelValue', { ...props.modelValue, sort })
}

const setQuery = (query: string) => {
  emit('update:modelValue', { ...props.modelValue, query })
}

const pillBase = 'inline-flex h-10 items-center justify-center rounded-full border px-4 text-[10px] uppercase tracking-[0.35em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black'
</script>

<template>
  <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div class="flex items-center gap-2">
        <button
          type="button"
          :class="[
            pillBase,
            modelValue.sort === 'recent'
              ? 'border-white/10 bg-white text-black'
              : 'border-white/15 bg-white/5 text-white/80 hover:text-white'
          ]"
          @click="setSort('recent')"
        >
          Recentes
        </button>
        <button
          type="button"
          :class="[
            pillBase,
            modelValue.sort === 'name'
              ? 'border-white/10 bg-white text-black'
              : 'border-white/15 bg-white/5 text-white/80 hover:text-white'
          ]"
          @click="setSort('name')"
        >
          Nom
        </button>
        <button
          type="button"
          :class="[
            pillBase,
            modelValue.sort === 'total'
              ? 'border-white/10 bg-white text-black'
              : 'border-white/15 bg-white/5 text-white/80 hover:text-white'
          ]"
          @click="setSort('total')"
        >
          Valeur totale
        </button>
      </div>

      <div class="relative w-full sm:w-[340px]">
        <Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          :value="modelValue.query"
          type="text"
          placeholder="Rechercher des listes enregistrees..."
          class="h-11 w-full rounded-full border border-white/15 bg-white/5 pl-11 pr-4 text-base text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:h-10 md:text-sm"
          @input="setQuery(($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>
