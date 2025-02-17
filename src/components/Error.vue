<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
const handleRetry = () => {
  window.location.href = "/listing";
};

defineProps({
  t: {
    type: Function,
    required: true,
  },
});
</script>

<template>
  <div
    class="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-white text-black"
  >
    <!-- Animation container -->
    <div class="relative mb-8">
      <!-- Pulsing circles animation -->
      <div class="absolute inset-0 animate-ping-slow">
        <div class="w-24 h-24 bg-red-50 rounded-full"></div>
      </div>
      <div class="absolute inset-0 animate-ping-slower">
        <div class="w-24 h-24 bg-red-100 rounded-full"></div>
      </div>

      <!-- Center icon -->
      <div
        class="relative w-24 h-24 bg-red-500 rounded-full flex items-center justify-center"
      >
        <span class="text-white text-4xl">⚠️</span>
      </div>
    </div>

    <!-- Error content -->
    <div class="text-center space-y-4 max-w-md">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-900">
        {{ t("Error.title") }}
      </h2>
      <p class="text-base md:text-lg text-gray-600">
        {{ t("Error.description") }}
      </p>
      <button
        @click="handleRetry"
        class="mt-6 px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
      >
        {{ t("Error.button") }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-ping-slow {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-ping-slower {
  animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
