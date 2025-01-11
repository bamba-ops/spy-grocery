<script setup></script>

<template>
  <!-- Error State (Uber-like) -->
  <div
    class="flex flex-col items-center justify-center space-y-4 min-h-[300px] bg-gray-900 text-white p-6"
  >
    <!-- Icône d'erreur (émoticône) -->
    <div class="text-red-400 text-6xl">😞</div>

    <!-- Titre d’erreur -->
    <h2 class="text-2xl md:text-3xl font-semibold">
      Oops! Something went wrong.
    </h2>

    <!-- Message d’explication -->
    <p class="text-sm md:text-base text-gray-300 text-center">
      We couldn't fetch the products. Please try again.
    </p>

    <!-- Bouton de réessai -->
    <button
      class="px-6 py-2 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 transition-all duration-300"
    >
      <a href="/">Retry</a>
    </button>
  </div>
</template>
