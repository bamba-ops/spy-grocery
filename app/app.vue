<script setup lang="ts">
import 'vue-sonner/style.css'
import { useAuthStore } from '~/stores/auth'
import { useListsStore } from '~/stores/lists'

const authStore = useAuthStore()
const listsStore = useListsStore()

const getPosthogClient = () => {
  const { $posthog } = useNuxtApp()

  if (typeof $posthog !== 'function') {
    return null
  }

  return $posthog()
}

onMounted(() => {
  void authStore.initAuth()
  listsStore.setHydrateCurrentListDraft()

  // Debug log intentionally kept while onboarding v2 is monitored.
  console.log('[app] initialized auth and list draft hydration')

  let identifiedUserId: string | null = null

  watch(
    () => authStore.user,
    (user) => {
      const posthogClient = getPosthogClient()

      if (!posthogClient) {
        return
      }

      const userId = user?.id?.trim() || null

      if (!userId) {
        if (identifiedUserId) {
          posthogClient.reset()
          identifiedUserId = null
        }

        return
      }

      if (identifiedUserId && identifiedUserId !== userId) {
        posthogClient.reset()
      }

      if (identifiedUserId === userId) {
        return
      }

      const userEmail = typeof user?.email === 'string'
        ? user.email.trim().toLowerCase()
        : ''

      if (userEmail) {
        posthogClient.identify(userId, {
          email: userEmail
        })
      } else {
        posthogClient.identify(userId)
      }

      identifiedUserId = userId
    },
    {
      immediate: true
    }
  )

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
