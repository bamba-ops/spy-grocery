<script setup lang="ts">
import { Home, Search, ShoppingBag, List } from 'lucide-vue-next'
import { useListsStore } from '~/stores/lists'
import { useAuthStore } from '~/stores/auth'

const lists = useListsStore()
const authStore = useAuthStore()

const route = useRoute()
const isHome = computed(() => route.path === '/')
const isSearch = computed(() => route.path.startsWith('/search') || route.path.startsWith('/produits'))
const isLists = computed(() => route.path.startsWith('/lists'))

const setOpenLists = async () => {
  if (!authStore.isReady) {
    await authStore.initAuth()
  }

  if (authStore.user) {
    await navigateTo('/lists')
    return
  }

  authStore.setOpenAuthPrompt({
    title: 'Vos listes, enregistrees pour plus tard',
    description: 'Creez un compte pour garder toutes vos listes au meme endroit et y acceder a tout moment.',
    nextPath: '/lists',
    ctaLabel: 'Connexion pour continuer'
  })
}
</script>

<template>
  <div>
    <div class="fixed inset-x-0 bottom-2 z-40 flex justify-center px-4">
      <nav
        class="flex w-fit items-center gap-3 rounded-full border border-white/15 bg-black/80 px-3 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur sm:gap-5 sm:px-5"
        aria-label="Primary"
      >
        <NuxtLink
          to="/"
          :class="[
            'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-11 sm:w-11',
            isHome ? 'bg-white text-black' : 'text-white/80'
          ]"
          aria-label="Accueil"
        >
          <Home class="h-5 w-5" />
        </NuxtLink>

        <NuxtLink
          to="/search"
          :class="[
            'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-11 sm:w-11',
            isSearch ? 'bg-white text-black' : 'text-white/80 bg-transparent hover:bg-white/10'
          ]"
          aria-label="Recherche"
        >
          <Search class="h-5 w-5" />
        </NuxtLink>

        <button
          type="button"
          :class="[
            'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11',
            isLists ? 'bg-white text-black' : 'text-white/80'
          ]"
          :disabled="authStore.isLoading"
          aria-label="Listes"
          @click="setOpenLists"
        >
          <List class="h-5 w-5" />
        </button>

        <!-- Spy AI is temporarily hidden while onboarding v2 is rolled out. -->

        <button
          class="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-11 sm:w-11"
          @click="lists.setToggleShoppingListDrawer()"
          aria-label="Liste de comparaison"
        >
          <ShoppingBag class="h-5 w-5" />
          <span
            v-if="lists.itemCount > 0"
            class="absolute -right-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white text-[10px] font-semibold text-black"
          >
            {{ lists.itemCount }}
          </span>
        </button>
      </nav>
    </div>
  </div>
</template>
