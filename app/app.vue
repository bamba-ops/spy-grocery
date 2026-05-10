<script setup lang="ts">
import 'vue-sonner/style.css'
import { useAuthStore } from '~/stores/auth'
import { useListsStore } from '~/stores/lists'

const authStore = useAuthStore()
const listsStore = useListsStore()
const analytics = useAnalytics()

onMounted(() => {
  void authStore.initAuth()
  listsStore.setHydrateCurrentListDraft()
  analytics.captureAiReferralLanding()

  // Debug log intentionally kept while onboarding v2 is monitored.
  console.log('[app] initialized auth and list draft hydration')

  let identifiedUserId: string | null = null

  watch(
    () => authStore.user,
    (user) => {
      const userId = user?.id?.trim() || null

      if (!userId) {
        if (identifiedUserId) {
          analytics.reset()
          identifiedUserId = null
        }

        return
      }

      if (identifiedUserId && identifiedUserId !== userId) {
        analytics.reset()
      }

      if (identifiedUserId === userId) {
        return
      }

      const userEmail = typeof user?.email === 'string'
        ? user.email.trim().toLowerCase()
        : ''

      analytics.identify(userId, {
        email: userEmail || undefined,
        is_authenticated: true
      })

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
