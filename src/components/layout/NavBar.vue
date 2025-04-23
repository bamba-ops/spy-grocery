<!-- components/NavBar.vue -->
<template>
  <nav
    class="/* Mobile : barre floue en bas */ fixed inset-x-0 bottom-0 bg-white/70 backdrop-blur-md border-t border-gray-200 py-2 /* Desktop : transparent, full‑height à droite */ sm:fixed sm:inset-y-0 sm:top-0 sm:bottom-0 sm:right-4 sm:left-auto sm:bg-transparent sm:border-0 sm:shadow-none sm:py-0 z-45"
  >
    <ul
      class="/* Mobile : row */ flex justify-around items-center h-14 /* Desktop : column full‑height, centré */ sm:flex sm:flex-col sm:justify-center sm:items-center sm:space-y-4 sm:h-full"
    >
      <li v-for="item in navItems" :key="item.name">
        <button
          @click="activate(item.name)"
          :class="[
            'w-12 h-12 flex items-center justify-center transition',
            active === item.name
              ? 'bg-black/10 text-black rounded-full'
              : 'text-gray-500 hover:text-black',
          ]"
        >
          <div v-if="item.name === 'Cart'" class="relative">
            <component :is="item.icon" class="h-6 w-6" />
            <span
              v-if="cartCount > 0"
              class="absolute -top-1 -right-1 h-2 w-2 bg-black rounded-full animate-ping"
            ></span>
          </div>
          <template v-else>
            <component :is="item.icon" class="h-6 w-6" />
          </template>
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
  ListBulletIcon
} from "@heroicons/vue/24/outline";
import Cart from "@/views/Cart.vue";
import { useCartStore } from "@/stores/useCartStore.js";
import { useRoute } from "vue-router";

const route = useRoute();
const showPanier = ref(false);
const cartStore = useCartStore();

const navItems = [
  { name: "Cart", icon: ShoppingCartIcon },
  { name: "Landing", icon: HomeIcon },
  { name: "Listing", icon: MagnifyingGlassIcon },
  { name: "Auth", icon: UserIcon },
  { name: "CartListing", icon: ListBulletIcon }
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

watch(() => route.name, (newRoute) => {
  active.value = newRoute
  console.log(newRoute)
})

</script>
