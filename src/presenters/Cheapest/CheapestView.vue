<script setup>
import { ref, onMounted } from "vue";
import Error from "@/composant/Error.vue";
import { mainModel } from "@/models/MainModel";

const TARGET_STORE_ID = "32d6dd89-4216-4588-a096-631bfaf5df56"; // À adapter si besoin
const loading = ref(false);
const error = ref(null);
const _targetProduct = ref();
const _bestMatch = ref([]);
const bestDeal = ref();
const otherDeals = ref();
const _mainModel = mainModel();

// -- NOUVELLES VARIABLES POUR GÉRER LE MODAL --
const showModal = ref(false);
const modalProduct = ref(null);

// Ouvre le modal, en stockant dans `modalProduct` le produit sur lequel on a cliqué
function openModal(product) {
  modalProduct.value = product;
  showModal.value = true;
}

// Ferme le modal et remet à zéro le produit
function closeModal() {
  showModal.value = false;
  modalProduct.value = null;
}

/**
 * Trie les deals par prix, assigne bestDeal, etc.
 */
function handleIsBestPrice() {
  const allDeals = [];
  allDeals.push(_targetProduct.value);

  for (let i = 0; i < _bestMatch.value.length; i++) {
    if (_bestMatch.value[i][0] !== undefined) {
      allDeals.push(_bestMatch.value[i][0]);
    }
  }

  allDeals.sort((a, b) => a.price - b.price);
  bestDeal.value = allDeals[0];
  otherDeals.value = allDeals.slice(1);
}

/**
 * Retire le premier produit du sous-tableau
 */
function removeFirstProduct(id) {
  let targetArray = _bestMatch.value.find((subArray) =>
    subArray.some((obj) => obj.id === id)
  );
  if (targetArray) {
    targetArray.shift();
  }
  handleIsBestPrice();
  modalProduct.value = targetArray[0];
  //closeModal(); // Ferme le modal
}

/**
 * Gère l’erreur de chargement d’image
 */
function handleImageError(event) {
  event.target.src =
    "https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg";
}

/**
 * Charge les produits et appelle handleIsBestPrice()
 */
function handleBestPrice() {
  loading.value = true;
  error.value = null;
  try {
    _targetProduct.value = _mainModel.targetProduct;
    _bestMatch.value = _mainModel.bestMatch;
    if (!_targetProduct.value || !_bestMatch.value) {
      error.value = "Failed to load the best price. Please try again.";
    } else {
      handleIsBestPrice();
    }
  } catch (e) {
    console.error("Error loading best price:", e);
    error.value = "Failed to load the best price. Please try again.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  handleBestPrice();
});
</script>

<template>
  <!-- Conteneur principal : fond sombre, texte clair -->
  <main
    class="bg-gray-900 min-h-screen text-white px-4 py-6 flex flex-col items-center"
  >
    <!-- État de chargement -->
    <LoadingResultComposant v-if="loading" />

    <!-- Erreur éventuelle -->
    <Error v-if="error" />

    <!-- SECTION ICÔNE + TITRE + DESCRIPTION -->
    <div v-if="!loading && !error" class="flex flex-col items-center mb-8">
      <!-- Icône (étoile) -->
      <div class="text-5xl md:text-6xl mb-3">🌟</div>
      <!-- Titre -->
      <h2 class="text-2xl md:text-3xl font-semibold mb-1">
        Nos meilleures offres
      </h2>
      <!-- Description -->
      <p class="text-sm md:text-base text-gray-300 text-center max-w-md">
        Découvrez nos articles phares sélectionnés rien que pour vous.
      </p>
    </div>

    <!-- BEST DEAL (carte principale) -->
    <div
      v-if="bestDeal && !loading & !error"
      class="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl p-6 mb-8 text-center relative"
    >
      <div
        class="absolute top-0 left-0 bg-gray-700 text-white px-4 py-1 text-sm font-semibold rounded-br-md"
      >
        BEST DEAL
      </div>

      <img
        :src="bestDeal.product.image_url"
        @error="handleImageError"
        alt="Product Image"
        class="w-32 h-32 object-cover rounded-md mx-auto mb-4 border border-gray-700"
      />

      <h2 class="text-xl font-bold mb-1">
        {{ bestDeal.product.name }}
      </h2>
      <p class="text-gray-400 text-sm mb-1">
        {{ bestDeal.product.brand }} &mdash; {{ bestDeal.product.unit }}
      </p>
      <p class="text-lg font-bold mb-3">
        ${{ bestDeal.price }} / {{ bestDeal.unit }}
      </p>

      <!-- Store -->
      <div class="flex items-center justify-center gap-4 mt-4">
        <img
          :src="bestDeal.store.image_url"
          @error="handleImageError"
          alt="Store Logo"
          class="w-16 h-16 object-contain rounded-full border border-gray-700"
        />
        <p class="text-sm text-gray-300">
          Available at
          <span class="text-white font-semibold">
            {{ bestDeal.store.name }}
          </span>
        </p>
      </div>

      <!-- Mauvais article -->
      <div v-if="bestDeal.store.id !== TARGET_STORE_ID" class="mt-6">
        <p class="text-sm text-gray-400 mb-2 italic">
          Mauvais article ? Cliquez ci-dessous
        </p>
        <button
          @click="openModal(bestDeal)"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition"
        >
          Mauvais article
        </button>
      </div>
    </div>

    <!-- OTHER DEALS -->
    <div
      v-if="otherDeals && otherDeals.length"
      class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl"
    >
      <div
        v-for="(deal, index) in otherDeals"
        :key="deal.id"
        class="relative bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center text-center border border-gray-700 transition-transform duration-300 hover:scale-105"
      >
        <div
          class="absolute top-3 left-3 bg-gray-700 text-white text-xs px-2 py-1 rounded-full"
        >
          #{{ index + 1 }}
        </div>

        <img
          :src="deal.product.image_url"
          @error="handleImageError"
          alt="Product Image"
          class="w-20 h-20 object-cover rounded-md mb-3 border border-gray-700"
        />
        <h3 class="text-base font-semibold mb-1">
          {{ deal.product.name }}
        </h3>
        <p class="text-xs text-gray-400 mb-1">
          {{ deal.product.brand }} &mdash; {{ deal.product.unit }}
        </p>
        <p class="text-sm font-bold mb-2">
          ${{ deal.price }} / {{ deal.unit }}
        </p>

        <div class="flex items-center justify-center gap-2 mt-2">
          <img
            :src="deal.store.image_url"
            @error="handleImageError"
            alt="Store Logo"
            class="w-10 h-10 object-contain rounded-full border border-gray-700"
          />
          <p class="text-sm text-gray-300">
            Available at
            <span class="text-white font-semibold">
              {{ deal.store.name }}
            </span>
          </p>
        </div>

        <div
          v-if="deal.store.id !== TARGET_STORE_ID"
          class="mt-4 flex flex-col items-center"
        >
          <p class="text-xs text-gray-400 mb-2 italic">Mauvais article ?</p>
          <button
            @click="openModal(deal)"
            class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-md transition"
          >
            Mauvais article
          </button>
        </div>
      </div>
    </div>

    <!-- BOUTON : RETOUR AU MENU PRINCIPAL (icône) -->
    <div v-if="!loading && !error" class="mt-8">
      <a
        href="/"
        class="inline-flex items-center justify-center w-12 h-12 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5
               9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125
               1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0
               1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      </a>
    </div>

    <!-- MODAL "MAUVAIS ARTICLE ?" -->
    <transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
      >
        <div
          class="relative w-full max-w-md md:max-w-3xl bg-gray-900 text-white rounded-xl shadow-2xl p-6"
        >
          <button
            @click="closeModal"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Icône contextuelle (ex. icône d'info) -->
          <div class="flex justify-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 
                   10 0 11-9.995 9.9A10 10 0 0112 2z"
              />
            </svg>
          </div>

          <h2 class="text-xl md:text-2xl font-semibold text-center mb-2">
            Vérification du produit
          </h2>
          <p
            class="text-center text-gray-400 text-sm mb-6 px-2 leading-relaxed"
          >
            Comparez le produit en cours avec le produit de référence pour
            déterminer si c’est le bon.
          </p>

          <!-- 2 colonnes (GAUCHE / DROITE) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              class="flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-700 pb-4 md:pb-0 md:pr-4"
            >
              <h3 class="text-md font-medium text-gray-300 mb-2">
                Produit à vérifier
              </h3>
              <div
                v-if="modalProduct"
                class="flex flex-col items-center space-y-2"
              >
                <img
                  :src="modalProduct.product.image_url"
                  @error="handleImageError"
                  alt="Produit en cours"
                  class="w-24 h-24 object-cover rounded-md"
                />
                <p class="font-semibold text-white text-center">
                  {{ modalProduct.product.name }}
                </p>
                <p class="text-sm text-gray-400">
                  {{ modalProduct.product.brand }}
                </p>
                <p class="text-sm text-gray-400">
                  {{ modalProduct.product.unit }}
                </p>
                <p class="text-md font-bold text-white">
                  ${{ modalProduct.price }} / {{ modalProduct.unit }}
                </p>
              </div>
            </div>

            <div class="flex flex-col items-center md:pl-4">
              <h3 class="text-md font-medium text-gray-300 mb-2">
                Produit de référence
              </h3>
              <div
                v-if="_targetProduct"
                class="flex flex-col items-center space-y-2"
              >
                <img
                  :src="_targetProduct.product.image_url"
                  @error="handleImageError"
                  alt="Produit de référence"
                  class="w-24 h-24 object-cover rounded-md"
                />
                <p class="font-semibold text-white text-center">
                  {{ _targetProduct.product.name }}
                </p>
                <p class="text-sm text-gray-400">
                  {{ _targetProduct.product.brand }}
                </p>
                <p class="text-sm text-gray-400">
                  {{ _targetProduct.product.unit }}
                </p>
                <p class="text-md font-bold text-white">
                  ${{ _targetProduct.price }} / {{ _targetProduct.unit }}
                </p>
              </div>
            </div>
          </div>

          <!-- BOUTONS -->
          <div
            class="mt-8 flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <button
              @click="closeModal"
              class="w-full md:w-auto px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-md hover:bg-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="size-6"
              >
                <path
                  fill-rule="evenodd"
                  d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <button
              @click="removeFirstProduct(modalProduct?.id)"
              class="w-full md:w-auto px-6 py-3 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="size-6"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
