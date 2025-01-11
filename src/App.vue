<script setup>
// (Aucun script particulier ici pour l’instant)
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex flex-col">
    <!-- Header Section -->
    <header
      class="sticky top-0 z-50 bg-gray-800 text-white shadow-sm p-4 flex items-center justify-between"
    >
      <!-- Logo + Nom de la marque -->
      <div class="flex items-center space-x-3">
        <img
          src="https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg"
          alt="Spy Grocery Logo"
          class="w-10 h-10 object-cover rounded-full border border-gray-700"
        />
        <h1 class="text-xl md:text-2xl font-semibold tracking-tight">
          Spy Grocery
        </h1>
      </div>

      <!-- Bouton "Sign in" -->
      <button
        class="px-4 py-2 bg-gray-700 text-white rounded-full font-medium hover:bg-gray-600 transition-colors"
      >
        Sign in
      </button>
    </header>

    <!-- Dynamic Content -->
    <main class="flex-1 p-6">
      <!-- Vue Router Outlet -->
      <router-view />
    </main>

    <!-- Footer Section -->
    <footer
      class="bg-gray-800 text-white py-4 text-center text-xs md:text-sm font-light"
    >
      &copy; 2025 Spy Grocery. All rights reserved.
    </footer>
  </div>
</template>

<style scoped>
/* Typo minimaliste */
body {
  font-family: "Inter", sans-serif;
}
</style>
