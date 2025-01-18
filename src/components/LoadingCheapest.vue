<template>
  <div class="flex flex-col items-center justify-center min-h-[80vh] px-4">
    <!-- Main animation container -->
    <div class="relative mb-12">
      <!-- Pulsing circles animation -->
      <div class="absolute inset-0 animate-ping-slow">
        <div class="w-24 h-24 bg-black/5 rounded-full"></div>
      </div>
      <div class="absolute inset-0 animate-ping-slower">
        <div class="w-24 h-24 bg-black/10 rounded-full"></div>
      </div>

      <!-- Center icon -->
      <div
        class="relative w-24 h-24 bg-black rounded-full flex items-center justify-center"
      >
        <span class="text-white text-4xl">🛍️</span>
      </div>
    </div>

    <!-- Loading text -->
    <h2 class="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
      Finding the best deals
    </h2>

    <!-- Animated messages -->
    <div class="h-6 text-center mb-8">
      <transition name="fade" mode="out-in">
        <p :key="currentMessageIndex" class="text-gray-600">
          {{ messages[currentMessageIndex] }}
        </p>
      </transition>
    </div>

    <!-- Progress bar -->
    <div class="w-full max-w-md bg-gray-100 rounded-full h-1.5 mb-8">
      <div
        class="bg-black h-1.5 rounded-full transition-all duration-300"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>

    <!-- Tips -->
    <p class="text-sm text-gray-500 text-center max-w-md">
      While we search, did you know? We compare prices across multiple stores to
      save you up to 30% on your groceries.
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const messages = [
  "Scanning local stores...",
  "Comparing prices...",
  "Finding the best deals...",
  "Analyzing discounts...",
  "Almost there...",
];

const currentMessageIndex = ref(0);
const progress = ref(0);
let messageInterval;
let progressInterval;

onMounted(() => {
  // Rotate through messages
  messageInterval = setInterval(() => {
    currentMessageIndex.value =
      (currentMessageIndex.value + 1) % messages.length;
  }, 2000);

  // Update progress bar
  progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 15;
    }
  }, 700);
});

onBeforeUnmount(() => {
  clearInterval(messageInterval);
  clearInterval(progressInterval);
});
</script>

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

/* Message transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
