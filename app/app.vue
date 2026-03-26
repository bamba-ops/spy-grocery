<script setup lang="ts">
import 'vue-sonner/style.css'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  void authStore.initAuth()
})
</script>

<template>
  <div class="font-sans">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Sonner />
  </div>
</template>
