<script setup></script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Header Section -->
    <header
      class="bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-50"
    >
      <div class="flex items-center space-x-2">
        <img
          src="https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg"
          alt="Spy Grocery Logo"
          class="w-10 h-10 object-cover rounded-full"
        />
        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Grocery</h1>
      </div>
      <button
        class="px-4 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all"
      >
        Sign in
      </button>
    </header>

    <!-- Dynamic Content -->
    <main class="flex-1 p-6">
      <router-view />
    </main>

    <!-- Footer Section -->
    <footer class="bg-gray-900 text-white py-4 text-center text-sm font-light">
      &copy; 2025 Spy Grocery. All rights reserved.
    </footer>
  </div>
</template>

<style>
body {
  font-family: "Inter", sans-serif;
}
</style>
