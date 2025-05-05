<!-- components/NavBar.vue -->
<template>
  <nav
    class="fixed inset-x-0 bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 py-3 sm:py-3"
  >
    <ul class="flex justify-around items-center h-16 sm:h-14">
      <li v-for="item in navItems" :key="item.name">
        <button
          @click="activate(item.name)"
          :class="[
            'group relative w-14 h-14 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl transition-all duration-200',
            active === item.name
              ? 'bg-black text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100/60 hover:text-gray-800',
          ]"
        >
          <div v-if="item.name === 'Cart'" class="relative">
            <component
              :is="item.icon"
              class="h-7 w-7 sm:h-6 sm:w-6"
              :class="active === item.name ? 'stroke-[1.8]' : 'stroke-1'"
            />
            <span
              v-if="cartCount > 0"
              class="absolute -top-1 -right-1 h-2 w-2 bg-blue-400 rounded-full animate-ping"
            ></span>
          </div>
          <template v-else>
            <component
              :is="item.icon"
              class="h-7 w-7 sm:h-6 sm:w-6"
              :class="active === item.name ? 'stroke-[1.8]' : 'stroke-1'"
            />
          </template>

          <span
            class="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-700 text-white text-sm sm:text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md whitespace-nowrap"
          >
            {{ item.label }}
          </span>
        </button>
      </li>
    </ul>
  </nav>

  <!-- Le Panier est maintenant géré directement dans NavBar -->
  <Cart :show="showPanier" @close="showPanier = false" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import {
  ShoppingCartIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ListBulletIcon,
} from "@heroicons/vue/24/outline";
import Cart from "@/views/Cart.vue";
import { useCartStore } from "@/stores/useCartStore.js";
import { useRoute } from "vue-router";

const route = useRoute();
const showPanier = ref(false);
const cartStore = useCartStore();

const navItems = [
  { name: "Cart", icon: ShoppingCartIcon, label: "Panier" },
  { name: "Landing", icon: HomeIcon, label: "Accueil" },
  { name: "Listing", icon: MagnifyingGlassIcon, label: "Recherche" },
  { name: "Auth", icon: UserIcon, label: "Profile" },
  { name: "CartListing", icon: ListBulletIcon, label: "Liste" },
];

const active = ref("Landing");

function activate(name) {
  active.value = name;
  if (name === "Cart") {
    showPanier.value = !showPanier.value;
  } else if (name === "Landing") {
    window.location.href = "/";
  } else if (name === "Listing") {
    window.location.href = "/listing";
  } else if (name === "Auth") {
    window.location.href = "/auth";
  } else if (name === "CartListing") {
    window.location.href = "/cart";
  }
}

const cartCount = computed(() =>
  cartStore.cart.reduce((sum, item) => sum + item.product_quantity, 0)
);

watch(
  () => route.name,
  (newRoute) => {
    active.value = newRoute;
    console.log(newRoute);
  }
);
</script>

<style scoped>
nav {
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.25);
}

@media (min-width: 640px) {
  nav {
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.25);
  }
}

button {
  transform-origin: center;
}

button:hover {
  transform: scale(1.1);
}

button:active {
  transform: scale(0.95);
}

/* Garantit que le footer n'est pas caché sur mobile */
@media (max-width: 639px) {
  div[min-h-screen] {
    padding-bottom: 6rem; /* Ajustez selon la hauteur de votre navigation */
  }
}
</style>
