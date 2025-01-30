<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

// Language Dropdown
const isDropdownOpen = ref(false);
const storedLanguage = localStorage.getItem("user-language") || locale.value;
const currentLanguage = ref(storedLanguage.toUpperCase());

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const changeLanguage = (lang) => {
  locale.value = lang;
  localStorage.setItem("user-language", lang);
  currentLanguage.value = lang.toUpperCase();
  isDropdownOpen.value = false;
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  const dropdown = document.querySelector(".language-dropdown");
  if (dropdown && !dropdown.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
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

    <!-- Language Dropdown -->
    <div class="relative inline-block text-left language-dropdown">
      <button
        @click="toggleDropdown"
        class="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
          />
        </svg>
        <span class="text-sm font-medium">{{ currentLanguage }}</span>
      </button>

      <!-- Dropdown menu -->
      <div
        v-if="isDropdownOpen"
        class="absolute right-0 mt-2 w-28 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
      >
        <div class="py-1">
          <button
            @click="changeLanguage('en')"
            class="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 hover:text-black transition-colors duration-200"
            :class="{ 'font-bold': currentLanguage === 'EN' }"
          >
            English
          </button>
          <button
            @click="changeLanguage('fr')"
            class="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 hover:text-black transition-colors duration-200"
            :class="{ 'font-bold': currentLanguage === 'FR' }"
          >
            Français
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation Menu 
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
    -->

    <!-- Mobile Menu Button
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
  --></header>
</template>
