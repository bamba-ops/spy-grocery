<template>
  <div class="text-center mb-8 md:mb-16">
    <div class="inline-block p-2 md:p-4 bg-black/5 rounded-full mb-4 md:mb-6 animate-bounce-slow">
      <span class="text-2xl md:text-4xl">💰</span>
    </div>
    <h1 class="text-2xl md:text-5xl font-bold mb-2 md:mb-4">
      {{ t("Cheapest.title") }}
    </h1>
    <p class="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
      {{ t("Cheapest.description") }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  t: {
    type: Function,
    required: true,
  },
});
</script>

<style scoped>
.animate-bounce-slow {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style> 