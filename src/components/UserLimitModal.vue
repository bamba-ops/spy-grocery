<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md"
  >
    <div class="bg-white rounded-xl shadow-lg p-8 mx-4 w-full max-w-md">
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold text-gray-900">
          {{ $t("UserLimitModal.title") }}
        </h2>
        <p
          class="mt-4 text-base text-gray-700"
          v-html="$t('UserLimitModal.description', { search_number: 10 })"
        ></p>
      </div>
      <button
        @click="navToAuth"
        class="w-full py-3 px-4 bg-black text-white text-lg font-semibold rounded-xl hover:bg-gray-900 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-800"
      >
        {{ $t("UserLimitModal.button") }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function navToAuth() {
  router.push("/auth");
}
</script>

<style scoped>
/* Le responsive et le design minimaliste sont gérés via Tailwind CSS */
</style>
