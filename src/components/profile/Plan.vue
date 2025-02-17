<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

defineProps({
  t: {
    type: Function,
    required: true,
  },
});

function handleNavToPricing() {
  router.push("/pricing");
}
</script>

<template>
  <div class="bg-white rounded-lg mb-4 overflow-hidden shadow-sm">
    <div class="p-4 border-b">
      <!-- Utilisation de la clé de traduction pour le titre -->
      <h2 class="text-base font-medium text-gray-900">
        {{ t("currentPlan.title") }}
      </h2>
    </div>

    <div class="p-4">
      <div class="flex justify-between items-center">
        <p class="text-sm text-gray-900">Free</p>
        <!-- Utilisation de la clé de traduction pour le bouton -->
        <button
          @click="handleNavToPricing()"
          class="text-sm font-medium text-black hover:text-gray-700"
        >
          {{ t("currentPlan.change") }}
        </button>
      </div>
    </div>
  </div>
</template>
