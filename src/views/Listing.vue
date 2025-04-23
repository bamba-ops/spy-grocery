<script setup>
import { useListingStore } from "@/stores/useListingStore";
import { ref, computed, onMounted, watch } from "vue";
import { useCartStore } from "@/stores/useCartStore";
import Popup from "@/components/listing/Popup.vue";
import { useRoute } from "vue-router";

const listing = useListingStore();
const cart = useCartStore();
const route = useRoute();
const lastAdded = ref(null);
const carousel = ref(null);

const props = defineProps({
  session: {
    type: Object,
    required: true
  }
})

function scrollBy(amount) {
  if (!carousel.value) return;
  carousel.value.scrollBy({ left: amount, behavior: "smooth" });
}

function handleAddToCart(product) {
  cart.addToCart(product);
  lastAdded.value = product.product_id;
  setTimeout(() => {
    lastAdded.value = null;
  }, 600);
}

onMounted(async () => {
  await listing.getStoresWithAccess();
  await listing.getAllProducts();
});
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="bg-white z-10 border-b border-gray-100">
      <div class="max-w-3xl mx-auto px-4 py-4 sm:py-5">
        <div class="flex flex-col gap-3 sm:flex-row">
          <div class="flex-1 relative shadow-sm rounded-xl w-full">
            <input
              v-model="listing.searchTerm"
              type="text"
              placeholder="Rechercher un produit..."
              class="w-full px-5 py-4 rounded-xl border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-black placeholder-gray-400 transition-all text-gray-900"
            />
            <svg
              class="absolute right-4 top-4 h-6 w-6 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>

          <div class="flex flex-col w-full gap-3 sm:flex-row sm:w-auto">
            <div class="relative w-full sm:w-auto">
              <button
                @click="
                  listing.isSortDropdownOpen = !listing.isSortDropdownOpen
                "
                class="w-full flex items-center justify-between gap-2 px-4 py-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <span class="text-sm font-medium text-gray-600">Trier</span>
                <svg
                  class="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <transition
                enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <div
                  v-show="listing.isSortDropdownOpen"
                  class="absolute right-0 mt-2 sm:w-48 w-full origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-50"
                >
                  <div class="p-2">
                    <button
                      @click="listing.getAllProductsSortBy(true)"
                      :class="[
                        'w-full text-left px-4 py-2.5 text-sm flex items-center justify-between rounded-lg',
                        listing.isSortBy === true
                          ? 'bg-gray-100'
                          : 'hover:bg-gray-50',
                      ]"
                    >
                      <span>Prix croissant</span>
                      <svg
                        v-if="listing.isSortBy === true"
                        class="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                    <button
                      @click="listing.getAllProductsSortBy(false)"
                      :class="[
                        'w-full text-left px-4 py-2.5 text-sm flex items-center justify-between rounded-lg',
                        listing.isSortBy === false
                          ? 'bg-gray-100'
                          : 'hover:bg-gray-50',
                      ]"
                    >
                      <span>Prix décroissant</span>
                      <svg
                        v-if="listing.isSortBy === false"
                        class="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </transition>
            </div>
            <button
              @click="listing.getAllProductsProductsInPromo()"
              :class="[
                'px-4 py-4 text-sm font-medium rounded-xl transition-colors',
                listing.selectedIsPromo
                  ? 'bg-black text-white'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600',
              ]"
            >
              En promo
            </button>
          </div>
        </div>
        <!--
        <div class="flex gap-2 mt-3">
          <button
            @click="listing.searchMode = 'multi'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              listing.searchMode === 'multi'
                ? 'bg-black text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100',
            ]"
          >
            Multi-Magasin
          </button>
          <button
            @click="listing.searchMode = 'mono'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              listing.searchMode === 'mono'
                ? 'bg-black text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100',
            ]"
          >
            Mono-Magasin
          </button>
        </div>
      -->

        <!-- Liste des magasins style Uber -->
        <div class="mt-4 pb-2 px-2 relative">
          <!-- Carrousel -->
          <div
            ref="carousel"
            class="flex space-x-3 overflow-x-auto snap-x snap-mandatory px-2 py-2 pb-4 scrollbar-hidden"
            style="-webkit-overflow-scrolling: touch"
          >
            <button
              v-for="store in listing.stores"
              :key="store.id"
              @click="
                !store.is_unlocked && !session
                  ? (listing.showLockedModal = true)
                  : listing.getAllProductsByStoreId(store.id)
              "
              class="snap-center shrink-0 flex flex-col items-center p-2 w-24 sm:w-28 rounded-xl bg-white transition-all relative group"
              :class="[
                listing.selectedStoreId === store.id ? 'ring-2 ring-black' : '',
                !store.is_unlocked && !session
                  ? 'opacity-75 grayscale hover:grayscale-0'
                  : 'shadow-md hover:shadow-lg',
              ]"
            >
              <!-- Overlay verrouillé -->
              <div
                v-if="!store.is_unlocked && !session"
                class="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-xl z-[1]"
              >
                <div
                  class="flex flex-col items-center transform -translate-y-2"
                >
                  <svg
                    class="w-9 h-9 text-white mb-1.5 animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                  <span
                    class="text-[0.7rem] font-semibold text-white px-2 py-1 rounded-full"
                  >
                    DÉBLOQUÉ
                  </span>
                </div>
              </div>

              <!-- Contenu normal -->
              <img
                :src="store.image_url"
                :alt="store.name"
                class="h-16 w-16 sm:h-20 sm:w-20 rounded-full mb-1 transition-transform duration-300 group-hover:scale-105"
                :class="{ 'blur-sm': !store.is_unlocked && !session}"
              />
              <span
                class="text-xs text-center line-clamp-2 px-1"
                :class="[
                  listing.selectedStoreId === store.id
                    ? 'font-semibold text-gray-900'
                    : 'text-gray-700',
                  !store.is_unlocked ? 'text-gray-500' : '',
                ]"
              >
                {{ store.name }}
              </span>
            </button>
          </div>

          <!-- Flèches -->
          <button
            @click="scrollBy(-200)"
            class="hidden sm:flex absolute left-1 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md backdrop-blur-sm"
          >
            <svg
              class="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            @click="scrollBy(200)"
            class="hidden sm:flex absolute right-1 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md backdrop-blur-sm"
          >
            <svg
              class="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <!-- Modal déverrouillage -->
          <div
            v-if="listing.showLockedModal"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <div
              class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-scale-in"
            >
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-semibold">Magasin Premium</h3>
                <button
                  @click="listing.showLockedModal = false"
                  class="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p class="text-gray-600 mb-6">
                Créez un compte gratuit pour accéder à tous nos magasins et
                bénéficier d'une comparaison de prix exclusifs !
              </p>
              <button
                @click="listing.navToAuth()"
                class="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                S'inscrire gratuitement
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <main class="max-w-3xl mx-auto px-4 pb-8 pt-2">
      <!--
      <div
        v-if="!listing.searchTerm"
        class="text-center py-12 text-gray-400 text-sm"
      >
        🔍 Commencez par rechercher un produit pour afficher les résultats
      </div>
    -->
      <template v-if="listing.isLoading">
        <div
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <div v-for="n in 8" :key="n" class="animate-pulse">
            <div class="bg-gray-100 aspect-square rounded-xl"></div>
            <div class="mt-3 space-y-2">
              <div class="h-4 bg-gray-100 rounded w-4/5"></div>
              <div class="h-4 bg-gray-100 rounded w-3/5"></div>
              <div class="h-5 bg-gray-100 rounded w-2/5 mt-2"></div>
            </div>
          </div>
        </div>
      </template>

      <div v-else-if="listing.error" class="text-center py-12">
        <div class="text-red-500 text-sm font-medium">{{ listing.error }}</div>
      </div>

      <template v-else>
        <div
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <article
            v-for="product in listing.products"
            @click="listing.navToProduct(product.product_id)"
            :key="product.product_id"
            class="group bg-white hover:shadow-lg transition-shadow duration-200 rounded-xl flex flex-col"
          >
            <div
              class="relative aspect-square bg-white rounded-xl overflow-hidden"
            >
              <img
                @error="listing.onImgError"
                :src="product.product_image_url"
                :alt="product.name"
                class="w-full h-full object-contain p-4 transition-transform duration-200 group-hover:scale-105"
              />
              <div v-if="product.is_promo" class="absolute top-2 right-2">
                <span
                  class="bg-black text-white px-2.5 py-1 rounded-full text-xs font-medium tracking-wide shadow-sm"
                >
                  PROMO
                </span>
              </div>

              <div
                v-if="lastAdded === product.product_id"
                class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50"
              >
                <svg
                  class="h-8 w-8 text-black animate-ping"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <div class="p-3 flex flex-col flex-grow">
              <div class="flex items-center gap-2 mb-2">
                <img
                  :src="product.store_image_url"
                  class="h-6 w-6 rounded-full border border-gray-200"
                  alt="Logo magasin"
                />
                <span class="text-xs font-medium text-gray-500">{{
                  product.store_name
                }}</span>
              </div>
              <h3
                class="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight"
              >
                {{ product.brand }}
              </h3>
              <p class="text-xs text-gray-500 line-clamp-2 mt-1">
                {{ product.product_name }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                {{ product.product_unit }}
              </p>

              <div class="mt-auto flex items-center justify-between">
                <div>
                  <div class="text-lg font-bold text-gray-900">
                    {{ product.price_un }}$
                  </div>
                  <div class="text-xs text-gray-400 mt-0.5">
                    {{
                      product.price
                        ? product.price + "$/" + product.price_unit
                        : ""
                    }}
                  </div>
                </div>
                <button
                  @click.stop="handleAddToCart(product)"
                  class="flex items-center justify-center h-10 w-10 rounded-lg border bg-white hover:bg-gray-200 text-black transition-all duration-200 hover:scale-110"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </article>
        </div>
        <div
          v-if="listing.products.length >= listing.perPage"
          class="px-4 pt-6 pb-12 sm:pb-16"
        >
          <div class="flex justify-center">
            <button
              class="w-full sm:w-auto px-8 py-4 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="listing.loadMore"
              :disabled="listing.isLoading"
            >
              <div class="flex items-center justify-center gap-2">
                <svg
                  v-if="listing.isLoading"
                  class="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{{
                  listing.isLoading ? "Chargement..." : "Charger plus"
                }}</span>
              </div>
            </button>
          </div>
        </div>

        <div v-if="listing.products.length === 0" class="text-center py-12">
          <div class="text-gray-400 text-sm">Aucun produit trouvé</div>
        </div>
      </template>
    </main>
    <Popup :show="listing.showPopup" @close="listing.onPopupClose" />
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
@keyframes fadeOut {
  0% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  100% {
    opacity: 0;
    transform: scale(2.5);
  }
}

body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  @apply antialiased;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

article {
  animation: fadeIn 0.3s ease-out;
}

/* Masque la scrollbar native pour mobile */
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-bounce {
  animation: bounce 1.5s infinite;
}
</style>
