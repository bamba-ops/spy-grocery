<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-8">
    <!-- En-tête -->
    <header class="mb-8 space-y-1">
      <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
        Mes listes
      </h1>
      <p class="text-gray-500">Retrouvez vos paniers enregistrés</p>
    </header>

    <!-- Grille des listes -->
    <div
      v-if="savedCarts.length > 0"
      class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <article
        v-for="cart in savedCarts"
        :key="cart.name"
        class="group relative bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 ease-out"
      >
        <div class="flex flex-col h-full">
          <!-- En-tête de carte -->
          <div class="flex justify-between items-start mb-4">
            <div class="space-y-1">
              <h3 class="text-lg font-semibold text-gray-900 truncate pr-6">
                {{ cart.name }}
              </h3>
              <p class="text-sm text-gray-500">{{ formatDate(cart.date) }}</p>
            </div>
            <button
              @click.stop="showDeleteModal(cart.name)"
              class="text-gray-300 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"
            >
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Contenu -->
          <div class="flex-1 border-t border-gray-100 pt-4 space-y-4">
            <!-- Badges d'information -->
            <div class="flex flex-wrap gap-2">
              <div class="flex items-center px-3 py-1 bg-gray-50 rounded-full">
                <span class="text-xs font-medium text-gray-700"
                  >{{ totalItems(cart) }} articles</span
                >
              </div>
            </div>

            <!-- Total -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">Total estimé</span>
              <span class="text-lg font-bold text-gray-900">
                {{ cart.total.toFixed(2) }} $
              </span>
            </div>
          </div>

          <!-- Bouton d'action -->
          <button
            @click="openCartModal(cart)"
            class="mt-4 w-full py-3 bg-black bg-opacity-90 text-white rounded-xl hover:bg-opacity-100 transition-all font-medium flex items-center justify-center gap-2"
          >
            <EyeIcon class="w-5 h-5" />
            <span>Voir la liste</span>
          </button>
        </div>
      </article>
    </div>

    <!-- État vide -->
    <div v-else class="text-center py-20">
      <div class="mx-auto max-w-md space-y-4">
        <div class="inline-flex p-6 bg-gray-100 rounded-2xl">
          <LockClosedIcon class="w-12 h-12 text-gray-400" />
        </div>
        <h3 class="text-2xl font-semibold text-gray-900">
          Aucune liste sauvegardée
        </h3>
        <p class="text-gray-500">
          Ajoutez des articles à votre panier et enregistrez-les pour les
          retrouver ici
        </p>
      </div>
    </div>

    <!-- Modal de visualisation -->
    <teleport to="body">
      <transition
        enter-active-class="transition-opacity duration-200 ease-out"
        leave-active-class="transition-opacity duration-150 ease-in"
      >
        <div
          v-if="openedCart"
          class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          @click.self="closeCartModal"
        >
          <div
            class="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl animate-modal-in"
          >
            <!-- En-tête -->
            <div
              class="p-6 border-b border-gray-100 flex items-center justify-between"
            >
              <h3 class="text-xl font-semibold">{{ openedCart.name }}</h3>
              <button
                @click="closeCartModal"
                class="text-gray-400 hover:text-gray-600 p-1 -mr-2"
              >
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>

            <!-- Contenu scrollable -->
            <div class="flex-1 overflow-y-auto p-6">
              <!-- Groupe par magasin -->
              <div
                v-for="store in groupedStores(openedCart.items)"
                :key="store.id"
                class="mb-6 last:mb-0 bg-gray-50 p-4 rounded-xl"
              >
                <div class="flex items-center gap-3 justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <img
                      :src="store.image"
                      @error="onImgError"
                      class="w-8 h-8 rounded-full object-cover border"
                    />
                    <div>
                      <h4 class="font-semibold text-gray-900">
                        {{ store.name }}
                      </h4>
                      <p class="text-xs text-gray-500">
                        {{ store.products.length }} articles
                      </p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-bold text-gray-900">
                      {{ store.total.toFixed(2) }} $
                    </p>
                    <p class="text-xs text-gray-500">Total magasin</p>
                  </div>
                </div>

                <!-- Articles -->
                <ul class="space-y-3">
                  <li
                    v-for="(item, index) in store.products"
                    :key="index"
                    class="group relative bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 ease-out"
                  >
                    <a
                      :href="item.link"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                    >
                      <!-- Image Container -->
                      <div class="relative flex-shrink-0 w-full sm:w-20">
                        <img
                          :src="item.product_image_url"
                          @error="onImgError"
                          class="w-full h-20 sm:h-20 object-contain bg-gray-50 rounded-lg border"
                        />
                        <!-- Hover Badge -->
                        <div
                          class="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <span
                            class="flex items-center text-white text-sm font-medium px-3 py-1.5"
                          >
                            <svg
                              class="w-4 h-4 mr-1.5"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                              />
                            </svg>
                            Visiter
                          </span>
                        </div>
                      </div>

                      <!-- Text Content -->
                      <div class="flex-1 min-w-0 space-y-1">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          {{ item.product_name }}
                        </p>
                        <p class="text-xs text-gray-500 truncate">
                          {{ item.brand }}
                        </p>
                        <div
                          class="flex items-center gap-2 text-xs text-gray-500"
                        >
                          <span
                            class="inline-flex items-center px-2 py-0.5 rounded bg-gray-100"
                          >
                            {{ item.product_quantity }} ×
                          </span>
                          <span>{{ item.price_un.toFixed(2) }} $</span>
                        </div>
                      </div>

                      <!-- Total Price -->
                      <div class="sm:self-start flex-shrink-0">
                        <p
                          class="text-sm font-semibold text-gray-900 text-right"
                        >
                          {{
                            (item.price_un * item.product_quantity).toFixed(2)
                          }}
                          $
                        </p>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <div class="flex justify-between items-center">
                <span class="font-semibold">Total général</span>
                <span class="text-xl font-bold text-gray-900"
                  >{{ openedCart.total.toFixed(2) }} $</span
                >
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Modal de suppression -->
    <teleport to="body">
      <transition
        enter-active-class="transition-opacity duration-150 ease-out"
        leave-active-class="transition-opacity duration-150 ease-in"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="deleteModalOpen"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div
            class="bg-white rounded-xl p-6 w-full max-w-md mx-4 animate-scale-in"
          >
            <h3 class="text-lg font-semibold mb-4">Supprimer la liste</h3>
            <p class="text-gray-600">
              Êtes-vous sûr de vouloir supprimer définitivement "<strong>{{
                cartToDelete
              }}</strong
              >" ?
            </p>
            <div class="flex gap-3 mt-6">
              <button
                @click="deleteModalOpen = false"
                class="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                @click="confirmDelete"
                class="flex-1 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useCartStore } from "@/stores/useCartStore";
import {
  LockClosedIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

const cartStore = useCartStore();
const openedCart = ref(null);
const deleteModalOpen = ref(false);
const cartToDelete = ref("");

// Charger les paniers au montage
onMounted(() => {
  cartStore.loadSavedCarts();
});

const savedCarts = computed(() => cartStore.savedCarts);

const showDeleteModal = (cartName) => {
  cartToDelete.value = cartName;
  deleteModalOpen.value = true;
};

const confirmDelete = () => {
  cartStore.deleteSavedCart(cartToDelete.value);
  deleteModalOpen.value = false;
};

const openCartModal = (cart) => {
  openedCart.value = cart;
};

const closeCartModal = () => {
  openedCart.value = null;
};

const groupedStores = (items) => {
  const groups = {};
  items.forEach((item) => {
    if (!groups[item.store_id]) {
      groups[item.store_id] = {
        id: item.store_id,
        name: item.store_name,
        image: item.store_image_url,
        total: 0,
        products: [],
      };
    }
    const itemTotal = item.price_un * item.product_quantity;
    groups[item.store_id].total += itemTotal;
    groups[item.store_id].products.push(item);
  });
  return Object.values(groups);
};
const totalItems = (cart) => {
  return cart.items.reduce((sum, item) => sum + item.product_quantity, 0);
};

const formatDate = (isoDate) => {
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const onImgError = (e) => {
  e.target.src =
    "https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg";
};
</script>

<style>
.animate-modal-in {
  animation: modalSlideIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes modalSlideIn {
  from {
    transform: translateY(20px) scale(0.98);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
