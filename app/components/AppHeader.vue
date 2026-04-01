<script setup lang="ts">
import { LogIn, LogOut, Menu, X } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const isOpen = ref(false)
const authStore = useAuthStore()

const navItems = [
  { label: 'Processus', href: '#process' },
  { label: 'Fonctionnalites', href: '#features' },
  { label: 'Temoignage', href: '#temoignage' }
]

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const isAuthenticated = computed(() => {
  return Boolean(authStore.user)
})

const setSignOut = async () => {
  const ok = await authStore.logout()
  if (!ok) {
    return
  }

  closeMenu()
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-white/10 bg-black/90 text-white backdrop-blur">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
      <div class="flex items-center gap-3">
        <span class="font-display text-2xl font-semibold italic tracking-tight text-white">SpyGrocery</span>
      </div>

      <nav class="hidden items-center gap-8 font-sans text-sm font-medium text-white/75 md:flex">
        <a
          v-for="item in navItems"
          :key="item.label"
          :href="item.href"
          class="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="flex items-center gap-3">
        <NuxtLink
          v-if="!isAuthenticated"
          to="/login"
          class="hidden items-center gap-2 rounded-full border border-white/20 bg-white px-4 py-2 font-sans text-xs font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:inline-flex"
        >
          <LogIn class="h-4 w-4" />
          Connexion
        </NuxtLink>

        <button
          v-else
          type="button"
          :disabled="authStore.isLoading"
          class="hidden items-center gap-2 rounded-full border border-white/20 bg-transparent px-4 py-2 font-sans text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
          @click="setSignOut"
        >
          <LogOut class="h-4 w-4" />
          Deconnexion
        </button>

        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:hidden"
          type="button"
          :aria-expanded="isOpen"
          aria-controls="mobile-menu"
          aria-label="Afficher le menu"
          @click="toggleMenu"
        >
          <Menu v-if="!isOpen" class="h-4 w-4" />
          <X v-else class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div v-if="isOpen" id="mobile-menu" class="border-t border-white/10 bg-black px-4 pb-6 md:hidden">
      <div class="flex flex-col gap-4 py-4 font-sans text-sm font-medium text-white/75">
        <a
          v-for="item in navItems"
          :key="item.label"
          :href="item.href"
          class="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          @click="closeMenu"
        >
          {{ item.label }}
        </a>

        <NuxtLink
          v-if="!isAuthenticated"
          to="/login"
          class="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white px-4 py-3 font-sans text-xs font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          @click="closeMenu"
        >
          <LogIn class="h-4 w-4" />
          Connexion
        </NuxtLink>

        <button
          v-else
          type="button"
          :disabled="authStore.isLoading"
          class="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-4 py-3 font-sans text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
          @click="setSignOut"
        >
          <LogOut class="h-4 w-4" />
          Deconnexion
        </button>
      </div>
    </div>
  </header>
</template>
