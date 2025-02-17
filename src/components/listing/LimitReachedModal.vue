<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
  >
    <div
      class="animate-scale-in bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-gray-100 dark:border-gray-800"
    >
      <div class="space-y-6">
        <div class="text-center space-y-4">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ $t("UserLimitModal.title") }} ⚠️
          </h3>

          <p
            class="text-gray-600 dark:text-gray-300 text-left leading-relaxed tracking-tight"
          >
            {{ $t("UserLimitModal.main_message") }}

            <span class="block mt-3">
              {{ $t("UserLimitModal.upgrade_part1") }}
              <strong
                class="font-semibold bg-black bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300"
              >
                {{ $t("UserLimitModal.upgrade_part2") }}
              </strong>
              {{ $t("UserLimitModal.upgrade_part3") }}
            </span>

            <span class="block mt-3 text-sm text-gray-500 dark:text-gray-400">
              {{ $t("UserLimitModal.reset_message") }}
            </span>
          </p>
        </div>

        <div class="space-y-4">
          <button
            @click="handleNavToPricing"
            class="w-full bg-black hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
          >
            {{ $t("UserLimitModal.button") }}
          </button>

          <p
            @click="handleNavToHome"
            class="text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
          >
            {{ $t("UserLimitModal.reminder") }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useListingStore } from "@/stores/useListingStore";

const listingStore = useListingStore();
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

function handleNavToHome() {
  listingStore.isLimitReached = false;
}
</script>

<style>
/* Animation scale-in plus moderne */
@keyframes scale-in {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
