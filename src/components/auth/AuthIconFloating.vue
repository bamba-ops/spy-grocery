<script setup>
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/useAuthStore";

const { t } = useI18n();
const authStore = useAuthStore();

function handleNavToAuth() {
  if (authStore.session) {
    authStore.handleUserEndSession();
  } else {
    window.location.href = "/auth";
  }
}
</script>

<template>
  <div class="fixed bottom-4 left-4 z-50">
    <div
      @click="handleNavToAuth()"
      :class="
        authStore.session
          ? 'bg-black rounded-md text-center shadow cursor-pointer px-3 py-2 min-w-[6rem] max-w-[90vw]'
          : 'flex items-center justify-center w-16 h-16 bg-black rounded-md shadow cursor-pointer'
      "
    >
      <template v-if="authStore.session">
        <span class="text-white text-xs md:text-base truncate">
          {{ t("UserIconFloating.button") }}
        </span>
      </template>
      <template v-else>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-8 h-8 text-white"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Le design minimaliste et responsive est géré avec Tailwind CSS */
</style>
