<script setup lang="ts">
import { Bot, Home, Search, ShoppingBag, List } from 'lucide-vue-next'
import { useListsStore } from '~/stores/lists'
import { useAuthStore } from '~/stores/auth'
import AiChatbot from '~/components/ai/AiChatbot.vue'

const lists = useListsStore()
const authStore = useAuthStore()
const isAiChatOpen = ref(false)

const route = useRoute()
const isHome = computed(() => route.path === '/')
const isSearch = computed(() => route.path.startsWith('/search') || route.path.startsWith('/products'))
const isLists = computed(() => route.path.startsWith('/lists'))

const setToggleAiChatPanel = () => {
  isAiChatOpen.value = !isAiChatOpen.value
}

const setOpenLists = async () => {
  if (!authStore.isReady) {
    await authStore.initAuth()
  }

  if (authStore.user) {
    await navigateTo('/lists')
    return
  }

  authStore.setOpenAuthPrompt({
    title: 'Your lists, saved for later',
    description: 'Create an account to keep all your lists in one place and access them anytime.',
    nextPath: '/lists',
    ctaLabel: 'Sign in to continue'
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
          aria-label="Home"
        >
          <Home class="h-5 w-5" />
        </NuxtLink>

        <NuxtLink
          to="/search"
          :class="[
            'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-11 sm:w-11',
            isSearch ? 'bg-white text-black' : 'text-white/80 bg-transparent hover:bg-white/10'
          ]"
          aria-label="Search"
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
          aria-label="Lists"
          @click="setOpenLists"
        >
          <List class="h-5 w-5" />
        </button>

        <button
          :class="[
            'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-95 sm:h-11 sm:w-11',
            isAiChatOpen ? 'bg-white text-black' : 'text-white/80 hover:text-white'
          ]"
          aria-label="Spy AI"
          @click="setToggleAiChatPanel"
        >
          <Bot class="h-5 w-5" />
        </button>

        <button
          class="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-11 sm:w-11"
          @click="lists.setToggleShoppingListDrawer()"
          aria-label="Compare list"
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

    <AiChatbot v-model:open="isAiChatOpen" />
  </div>
</template>
