<template>
  <div
    class="flex flex-col items-center justify-center min-h-[300px] space-y-4"
  >
    <!-- Animation circulaire -->
    <div
      class="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 border-solid"
    ></div>

    <!-- Texte -->
    <p class="text-lg font-semibold text-gray-700 text-center">
      Searching for the best deals just for you... 🛍️
    </p>
  </div>
</template>

<style scoped>
/* Animation de rotation personnalisée */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
