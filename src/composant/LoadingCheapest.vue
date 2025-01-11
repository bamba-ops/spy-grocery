<template>
  <div
    class="flex flex-col items-center justify-center min-h-[300px] space-y-4 bg-gray-900 text-white"
  >
    <!-- Animation circulaire -->
    <div
      class="animate-spin rounded-full h-16 w-16 border-t-4 border-green-400 border-solid"
    ></div>

    <!-- Texte -->
    <p class="text-base md:text-lg font-semibold text-gray-200 text-center">
      Searching for the best deals just for you... 🛍️
    </p>
  </div>
</template>

<style scoped>
/* Animation de rotation (vous pouvez la laisser telle quelle, ou la personnaliser) */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
