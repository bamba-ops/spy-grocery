<template>
  <!-- 1. Overlay avec transition fade -->
  <transition
    name="fade-overlay"
    appear
  >
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      @click="close"
    ></div>
  </transition>

  <!-- 2. Drawer avec transition slide -->
  <transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-200 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <aside
      v-if="show"
      class="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
    >
      <!-- En-tête -->
      <header class="flex items-center justify-between px-6 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-900">
          Votre panier ({{ itemCount }} {{ itemCount > 1 ? 'articles' : 'article' }})
        </h2>
        <button
          @click="close"
          aria-label="Fermer le panier"
          class="p-2 rounded hover:bg-gray-100 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <!-- Contenu scrollable -->
      <div class="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-hidden">
        <div v-for="store in groupedStores" :key="store.id">
          <h3 class="text-base font-semibold text-gray-800 mb-3">
            {{ store.name }}
          </h3>
          <div class="space-y-4">
            <div
              v-for="item in store.products"
              :key="item.product_id"
              class="flex items-start space-x-4"
            >
              <img
                :src="item.product_image_url"
                alt="Produit"
                class="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">{{ item.product_name }}</h4>
                <p class="text-sm text-gray-500">{{ item.brand }}</p>

                <div class="mt-2 flex items-center space-x-2">
                  <button
                    @click="decrease(item)"
                    class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
                    aria-label="Diminuer la quantité"
                  >−</button>

                  <span class="w-8 text-center">{{ item.product_quantity }}</span>

                  <button
                    @click="increase(item)"
                    class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
                    aria-label="Augmenter la quantité"
                  >+</button>

                  <button
                    @click="remove(item)"
                    class="ml-auto text-red-600 hover:text-red-700 text-sm font-medium"
                    aria-label="Supprimer l’article"
                  >Supprimer</button>
                </div>
              </div>
              <div class="text-right">
                <p class="text-base font-semibold text-gray-900">
                  {{ (item.price_un * item.product_quantity).toFixed(2) }} $
                </p>
              </div>
            </div>

            <!-- Total par magasin -->
            <div class="text-right text-sm font-medium text-gray-800">
              Total {{ store.name }} : {{ storeTotal(store).toFixed(2) }} $
            </div>
          </div>
        </div>

        <!-- Panier vide -->
        <div
          v-if="groupedStores.length === 0"
          class="text-center py-12 text-gray-500"
        >
          Votre panier est vide.
        </div>
      </div>

      <!-- Modal de sauvegarde -->
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
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4"
          >
            <div class="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Sauvegarder la liste</h3>
                <button
                  @click="cart.showSaveModal = false"
                  class="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

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

      <!-- Footer total général + actions -->
      <footer class="border-t px-6 py-4 bg-white flex-shrink-0">
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-medium text-gray-800">Total général</span>
          <span class="text-xl font-bold text-gray-900">{{ totalGeneral.toFixed(2) }} $</span>
        </div>
        <div class="flex gap-2">
          <button
            @click="cart.showSaveModal = true"
            class="flex-1 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Sauvegarder ma liste
          </button>
          <button
            @click="cart.deleteCart()"
            class="py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Vider le panier
          </button>
        </div>
      </footer>
    </aside>
  </transition>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useCartStore } from "@/stores/useCartStore.js";

const props = defineProps({ show: Boolean });
const emit = defineEmits(["close"]);

const cart = useCartStore();

onMounted(() => {
  cart.getStores && cart.getStores();
});

// Regroupe par magasin
const groupedStores = computed(() => {
  const map = {};
  cart.cart.forEach(item => {
    const sid = item.store_id;
    if (!map[sid]) {
      map[sid] = { id: sid, name: item.store_name, products: [] };
    }
    map[sid].products.push(item);
  });
  return Object.values(map);
});

// Totaux
const totalGeneral = computed(() =>
  groupedStores.value.reduce((sum, s) => sum + storeTotal(s), 0)
);
const itemCount = computed(() =>
  cart.cart.reduce((sum, i) => sum + i.product_quantity, 0)
);
function storeTotal(store) {
  return store.products.reduce(
    (sum, p) => sum + p.price_un * p.product_quantity,
    0
  );
}

// Actions
function increase(item) { cart.addToCart(item); }
function decrease(item) { cart.decreaseQuantity(item); }
function remove(item)   { cart.removeFromCart(item); }
function close()        { emit("close"); }
</script>

<style scoped>
/* Fade pour l’overlay */
.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.3s ease;
}
.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}
.fade-overlay-enter-to,
.fade-overlay-leave-from {
  opacity: 0.5;
}

/* Masquage de la scrollbar */
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
