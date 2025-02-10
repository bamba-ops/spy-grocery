<template>
  <div class="py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div
      v-for="n in 30"
      :key="n"
      class="relative group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-4 w-full animate-pulse"
    >
      <!-- Rectangle principal pour simuler l'image -->
      <div class="h-40 w-full bg-gray-400 rounded-md"></div>

      <!-- Barres de texte -->
      <div class="flex flex-col space-y-4 mt-4">
        <div class="h-6 bg-gray-400 rounded w-3/4"></div>
        <div class="h-4 bg-gray-400 rounded w-1/2"></div>
        <div class="h-4 bg-gray-400 rounded w-1/3"></div>
      </div>
    </div>
  </div>
</template>
