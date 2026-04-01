<script setup lang="ts">
import 'vue-sonner/style.css'
import { useAuthStore } from '~/stores/auth'
import { useListsStore } from '~/stores/lists'

const authStore = useAuthStore()
const listsStore = useListsStore()

onMounted(() => {
  void authStore.initAuth()

  watch(
    () => authStore.user?.id,
    (userId) => {
      if (!userId) {
        return
      }

      void listsStore.setSyncLocalListsToApi()
    },
    {
      immediate: true
    }
  )
})
</script>

<template>
  <div class="font-sans">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Sonner />
    <ConfirmActionModal
      :open="authStore.authPromptOpen"
      eyebrow="Compte requis"
      :title="authStore.authPromptTitle"
      :message="authStore.authPromptDescription"
      :confirm-text="authStore.authPromptCtaLabel"
      cancel-text="Plus tard"
      @close="authStore.setCloseAuthPrompt"
      @confirm="authStore.setContinueAuthPromptToLogin"
    />
  </div>
</template>
