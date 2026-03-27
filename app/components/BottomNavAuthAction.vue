<script setup lang="ts">
import { LogIn, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const DEFAULT_NEXT_PATH = '/search'

const authStore = useAuthStore()
const route = useRoute()

const isAuthenticated = computed(() => {
  return Boolean(authStore.user)
})

const authLabel = computed(() => {
  return isAuthenticated.value ? 'Log out' : 'Log in'
})

const getSafeNextPath = (value: string) => {
  if (!value.startsWith('/') || value.startsWith('//')) {
    return DEFAULT_NEXT_PATH
  }

  return value
}

const setHandleAuthAction = async () => {
  if (authStore.isLoading) {
    return
  }

  if (isAuthenticated.value) {
    await authStore.logout()
    return
  }

  const nextPath = getSafeNextPath(route.fullPath || DEFAULT_NEXT_PATH)
  await navigateTo(`/login?next=${encodeURIComponent(nextPath)}`)
}
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-[5.25rem] z-40 flex justify-center px-4 sm:bottom-[5.75rem]">
    <button
      type="button"
      :disabled="authStore.isLoading"
      :aria-label="authLabel"
      class="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-black/85 px-4 font-sans text-[10px] uppercase tracking-[0.25em] text-white/80 shadow-[0_12px_25px_rgba(0,0,0,0.55)] transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
      @click="setHandleAuthAction"
    >
      <LogOut v-if="isAuthenticated" class="h-3.5 w-3.5" />
      <LogIn v-else class="h-3.5 w-3.5" />
      {{ authLabel }}
    </button>
  </div>
</template>
