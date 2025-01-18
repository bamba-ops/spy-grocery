<script setup>
// Add any header-specific logic here
</script>

<template>
  <header
    class="sticky top-0 z-50 bg-white shadow-sm px-6 py-4 flex items-center justify-between"
  >
    <!-- Logo + Brand name -->
    <div class="flex items-center space-x-4">
      <div
        class="w-10 h-10 bg-black rounded-full flex items-center justify-center"
      >
        <span class="text-white text-xl font-bold">S</span>
      </div>
      <h1 class="text-xl font-bold tracking-tight text-black">Spy Grocery</h1>
    </div>

    <!-- Navigation Menu -->
    <nav class="hidden md:flex items-center space-x-8">
      <a
        href="#"
        class="text-gray-600 hover:text-black transition-colors duration-200"
        >Accueil</a
      >
      <a
        href="#"
        class="text-gray-600 hover:text-black transition-colors duration-200"
        >Promotions</a
      >
      <a
        href="#"
        class="text-gray-600 hover:text-black transition-colors duration-200"
        >Categories</a
      >
      <button
        class="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200"
      >
        Se connecter
      </button>
    </nav>

    <!-- Mobile Menu Button -->
    <button class="md:hidden text-gray-600 hover:text-black">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  </header>
</template>
