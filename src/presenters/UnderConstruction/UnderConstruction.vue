<template>
  <div
    class="bg-gray-900 min-h-screen flex flex-col items-center justify-center"
  >
    <!-- Icône ou émoji -->
    <div class="text-7xl mb-4">🚧</div>
    <!-- Titre principal -->
    <h1 class="text-3xl md:text-4xl font-bold text-white text-center">
      Site en construction
    </h1>
    <!-- Description -->
    <p class="text-gray-300 mt-3 mb-8 text-center max-w-md">
      Nous travaillons actuellement sur le site pour vous offrir la meilleure
      expérience possible. Revenez bientôt !
    </p>
    <!-- Loader Tailwind (simple spinner) -->
    <div
      class="w-12 h-12 border-4 border-t-4 border-yellow-500 rounded-full animate-spin"
    ></div>
  </div>
</template>

<script setup>
// Pour cette page, pas besoin de logic particulier si vous gérez la redirection
// via le router. On peut donc laisser le script vide.
</script>
