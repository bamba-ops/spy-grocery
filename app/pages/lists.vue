<script setup lang="ts">
import type { SavedList } from '~/stores/shoppingList'
import { useShoppingListStore } from '~/stores/shoppingList'
import type { ListsSort } from '~/components/ListsToolbar.vue'

const shoppingListStore = useShoppingListStore()

definePageMeta({
  layout: 'bottom-nav'
})

useHead({
  title: 'My Lists — SpyGrocery',
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;1,600&family=Manrope:wght@400;500;600&display=swap'
    }
  ]
})

const controls = ref<{ sort: ListsSort; query: string }>({ sort: 'recent', query: '' })

const refreshLists = () => {
  if (!process.client) return
  savedLists.value = shoppingListStore.getSavedLists()
}


const handleOpenList = (name: string) => {
  const ok = shoppingListStore.loadSavedList(name)
  if (ok) {
    shoppingListStore.openDrawer()
  }
}

const handleDeleteList = (name: string) => {
  if (!process.client) return
  const ok = window.confirm(`Delete "${name}"?`)
  if (!ok) return
  const deleted = shoppingListStore.deleteSavedList(name)
  if (deleted) {
    refreshLists()
  }
}

const savedLists = ref<SavedList[]>([])

onMounted(() => {
  refreshLists()
})

const listScore = (list: SavedList) => {
  const total = list.items.reduce((acc, it) => acc + (it.product.price ?? 0) * it.quantity, 0)
  const items = list.items.reduce((acc, it) => acc + (it.quantity || 0), 0)
  return { total, items }
}

const filteredLists = computed(() => {
  const q = controls.value.query.trim().toLowerCase()
  const base = q
    ? savedLists.value.filter(l => l.name.toLowerCase().includes(q))
    : savedLists.value.slice()

  const sort = controls.value.sort
  base.sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name)
    if (sort === 'total') return listScore(b).total - listScore(a).total
    // recent
    return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  })

  return base
})
</script>

<template>
  <div class="min-h-screen bg-black font-sans text-white">
    <div class="pointer-events-none fixed inset-0   bg-[radial-gradient(1200px_650px_at_20%_10%,rgba(255,255,255,0.12),transparent_58%),radial-gradient(900px_600px_at_85%_35%,rgba(255,255,255,0.08),transparent_60%),radial-gradient(700px_520px_at_40%_85%,rgba(255,255,255,0.06),transparent_60%)]"></div>

    <main class="relative mx-auto max-w-7xl px-4 pb-28 pt-16 sm:px-6">
      <div class="flex flex-col gap-10">
        <div class="flex items-end justify-between gap-6">
          <h1 class="font-display text-6xl font-semibold italic tracking-tight sm:text-7xl">My Lists</h1>
        </div>

        <ListsToolbar v-model="controls" />

        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <SavedListCard v-for="list in filteredLists" :key="list.name" :list="list" @open="handleOpenList" @delete="handleDeleteList" />
          <CreateListCard to="/search" />
        </div>
      </div>
    </main>
  </div>
</template>
