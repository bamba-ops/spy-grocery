<template>
  <div
    class="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-8 max-w-3xl mx-2 sm:mx-0 animate-pulse"
  >
    <div class="h-7 bg-gray-200 rounded w-1/4 mb-6"></div>

    <div class="grid grid-cols-1 gap-3 md:gap-4 mb-4 md:mb-6">
      <div
        v-for="i in 3"
        :key="i"
        class="p-3 md:p-4 border-2 border-gray-100 rounded-lg md:rounded-xl"
      >
        <div class="flex items-center space-x-2 md:space-x-3">
          <div
            class="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-md md:rounded-lg"
          ></div>
          <div class="flex-1 space-y-2">
            <div class="h-5 bg-gray-200 rounded w-1/2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center space-x-2 md:space-x-4">
      <div class="h-5 w-5 bg-gray-200 rounded-full"></div>
      <div class="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
