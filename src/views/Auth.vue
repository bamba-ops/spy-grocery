<script setup>
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/useAuthStore";

const authStore = useAuthStore();
const { t } = useI18n();
</script>

<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-8">
      <!-- Logo -->
      <div class="text-center">
        <div
          class="mx-auto h-12 w-12 bg-black rounded-full flex items-center justify-center mb-6"
        >
          <div
            class="w-10 h-10 bg-black rounded-full flex items-center justify-center"
          >
            <span class="text-white text-xl font-bold">S</span>
          </div>
        </div>
      </div>

      <!-- Formulaire -->
      <form
        @submit.prevent="authStore.handleUserSession(t)"
        class="mt-8 space-y-6"
      >
        <div>
          <input
            id="email"
            type="email"
            v-model="authStore.email"
            required
            :placeholder="t('Auth.email_placeholder')"
            class="w-full px-4 py-3 bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full flex justify-center items-center py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50"
        >
          <svg
            v-if="authStore.isLoading"
            class="animate-spin h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{{
            authStore.isLoading ? t("Auth.sending_progress") : t("Auth.send")
          }}</span>
        </button>
      </form>

      <!-- Messages de feedback -->
      <div
        v-if="authStore.message"
        class="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl animate-fade-in"
      >
        {{ authStore.message }}
      </div>
      <div
        v-if="authStore.error"
        class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-fade-in"
      >
        {{ authStore.error }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
