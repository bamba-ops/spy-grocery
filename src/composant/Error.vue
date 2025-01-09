<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
function handleReloadingPage() {
  router.push("/");
}
</script>

<template>
  <!-- Error State (Style Uber Eats) -->
  <div class="flex flex-col items-center justify-center space-y-4 mt-10">
    <!-- Icône d'erreur -->
    <div class="text-red-500 text-6xl">😞</div>
    <h2 class="text-2xl font-bold text-gray-700">
      Oops! Something went wrong.
    </h2>
    <p class="text-gray-500 text-lg">
      We couldn't fetch the products. Please try again.
    </p>

    <!-- Bouton de Réessai -->
    <button
      @click="handleReloadingPage()"
      class="mt-4 px-6 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-300"
    >
      Retry
    </button>
  </div>
</template>
