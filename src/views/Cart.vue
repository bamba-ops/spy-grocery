<template>
  <transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="translate-y-full lg:translate-x-full"
    enter-to-class="translate-y-0 lg:translate-x-0"
    leave-active-class="transition-transform duration-200 ease-in"
    leave-from-class="translate-y-0 lg:translate-x-0"
    leave-to-class="translate-y-full lg:translate-x-full"
  >
    <aside
      v-if="show"
      class="fixed inset-x-0 bottom-0 w-full max-h-[60vh] lg:fixed lg:top-1/2 lg:-translate-y-1/2 lg:right-4 lg:left-auto lg:w-80 lg:max-h-[75vh] bg-white shadow-lg rounded-t-xl lg:rounded-xl p-4 overflow-auto z-50"
    >
      <!-- En‑tête + fermer -->
      <header class="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 class="text-xl font-semibold text-gray-800">Votre panier</h2>
        <button
          @click="close"
          class="p-1 rounded-md hover:bg-gray-100 focus:outline-none"
          aria-label="Fermer le panier"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            class="h-6 w-6 text-gray-500"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </header>

      <!-- Contenu scrollable groupé par magasin -->
      <div class="divide-y divide-gray-200 mb-4 space-y-4">
        <div v-for="store in groupedStores" :key="store.id" class="pb-4">
          <h3 class="text-lg font-medium text-gray-700 mb-2">
            {{ store.name }}
          </h3>
          <ul class="space-y-3">
            <li
              v-for="(prod, idx) in store.products"
              :key="idx"
              class="flex justify-between items-center"
            >
              <div class="flex items-center space-x-3">
                <!-- Image du produit -->
                <img
                  :src="prod.product_image_url"
                  alt="Produit"
                  @error="cart.onImgError"
                  class="w-10 h-10 object-cover rounded-md"
                />
                <div class="flex items-center space-x-2">
                  <!-- Bouton diminuer quantité -->
                  <button
                    @click="cart.decreaseQuantity(prod)"
                    class="w-6 h-6 flex items-center justify-center border border-gray-300 rounded"
                  >
                    −
                  </button>
                  <span class="text-gray-800 font-medium">{{
                    prod.product_quantity
                  }}</span>
                  <!-- Bouton augmenter quantité -->
                  <button
                    @click="cart.addToCart(prod)"
                    class="w-6 h-6 flex items-center justify-center border border-gray-300 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
              <div class="text-gray-900 font-semibold text-sm">
                {{ (prod.price_un * prod.product_quantity).toFixed(2) }} $
              </div>
            </li>
          </ul>
          <!-- Total par magasin -->
          <div class="text-right mt-2 text-sm font-medium text-gray-800">
            Total {{ store.name }} : {{ storeTotal(store).toFixed(2) }} $
          </div>
        </div>
      </div>

      <!-- Modals -->
       <!-- Modal de sauvegarde en dehors du panier -->
  <teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="cart.showSaveModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
      >
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4 animate-scale-in">
          <h3 class="text-xl font-semibold mb-4">Sauvegarder la liste</h3>

          <input
            v-model="cart.cartName"
            type="text"
            placeholder="Nom de la liste"
            class="w-full px-4 py-3 border rounded-lg mb-4 focus:ring-2 focus:ring-black focus:outline-none text-base"
            @keyup.enter="cart.handleSave"
          />

          <div v-if="cart.errorMessage" class="text-red-500 text-sm mb-4 -mt-2">
            {{ cart.errorMessage }}
          </div>

          <div class="flex gap-3">
            <button
              @click="cart.showSaveModal = false"
              class="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 transition-colors text-base font-medium"
            >
              Annuler
            </button>
            <button
              @click="cart.handleSave"
              class="flex-1 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-base font-medium"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>

      <!-- Total général + action -->
      <footer class="pt-4 border-t border-gray-200 flex-shrink-0">
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-medium text-gray-800">Total</span>
          <span class="text-xl font-bold text-gray-900"
            >{{ totalGeneral.toFixed(2) }} $</span
          >
        </div>
        <div class="flex gap-2">
          <!-- Bouton sauvegarde existant -->
          <button
            @click="cart.showSaveModal = true"
            class="flex-1 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Sauvegarder ma liste
          </button>
          <!-- Bouton poubelle -->
          <button
            class="p-2 bg-white rounded-lg flex items-center justify-center border hover:bg-gray-200 transition-colors"
            @click="cart.deleteCart()"
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
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      </footer>
    </aside>
  </transition>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useCartStore } from "@/stores/useCartStore.js";

const cart = useCartStore();

// props + emits
const props = defineProps({ show: Boolean });
const emit = defineEmits(["close"]);

// charge les magasins (si nécessaire)
onMounted(() => {
  cart.getStores && cart.getStores();
});

// groupe les produits par magasin
const groupedStores = computed(() => {
  const map = {};
  cart.cart.forEach((item) => {
    const sid = item.store_id;
    if (!map[sid]) {
      map[sid] = { id: sid, name: item.store_name, products: [] };
    }
    map[sid].products.push(item);
  });
  return Object.values(map);
});

// calcule total par magasin
function storeTotal(store) {
  return store.products.reduce(
    (sum, p) => sum + p.price_un * p.product_quantity,
    0
  );
}

// total général
const totalGeneral = computed(() =>
  groupedStores.value.reduce((sum, s) => sum + storeTotal(s), 0)
);

// ferme le panneau
function close() {
  emit("close");
}
</script>

<style scoped>
.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

input::placeholder {
  color: #94a3b8;
  opacity: 1;
}
</style>
