<script setup>
import { reactive, ref, onMounted, toRaw } from "vue";
import LoadingListing from "@/composant/LoadingListing.vue";
import { useRouter } from "vue-router";
import Error from "@/composant/Error.vue";
import LoadingCheapest from "@/composant/LoadingCheapest.vue";
import { mainModel } from "@/models/MainModel";

const router = useRouter();
const prices = ref([]);
const loading = ref(false);
const error = ref(null);
const loadingCheapest = ref(false);
const loadingMore = ref(false);
const _mainModel = mainModel();
const totalCount = ref(0);
const isEndOfResults = ref(false);
const searchQuery = ref(""); // Par exemple, si vous avez un input de recherche

async function handlePricesListing() {
  loading.value = true;
  error.value = null;
  try {
    const { total_count, _prices } = await _mainModel.getPricesByStoreId();
    if (_prices && total_count) {
      prices.value = _prices;
      totalCount.value = total_count;
    } else {
      error.value = "Failed to load prices. Please try again.";
    }

    if (prices.value.length >= totalCount.value) {
      isEndOfResults.value = true;
    }
  } catch (err) {
    console.error("Error loading prices:", err);
    error.value = "Failed to load prices. Please try again.";
  } finally {
    loading.value = false;
  }
}

async function handleLoadMore() {
  try {
    loadingMore.value = true;
    const { _prices } = await _mainModel.getPricesByStoreId();
    if (_prices) {
      prices.value.push(..._prices);
      if (prices.value.length >= totalCount.value) {
        isEndOfResults.value = true;
      }
    } else {
      error.value = "No prices found.";
    }
  } catch (err) {
    console.error("Error loading prices:", err);
    error.value = "Failed to load prices. Please try again.";
  } finally {
    loadingMore.value = false;
  }
}

async function handleProductClick(product) {
  try {
    loadingCheapest.value = true;
    error.value = null;

    await _mainModel.getBestPrice(toRaw(product));
    router.push("/cheapest");
  } catch (err) {
    error.value = "Failed to fetch the product details.";
  }
}

function handleImageError(event) {
  event.target.src =
    "https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg";
}

onMounted(() => {
  handlePricesListing();
});
</script>

<template>
  <!-- Conteneur global : fond sombre, texte clair -->
  <main class="min-h-screen bg-gray-900 text-white p-4 flex flex-col">
    <!-- 1) ÉTAT DE CHARGEMENT (SKELETONS) -->
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <LoadingListing v-for="n in 30" :key="n" />
    </div>

    <!-- 2) LOADING CHEAPEST (si on charge un produit) -->
    <LoadingCheapest v-if="loadingCheapest && !error && !loading" />

    <!-- 3) ERREUR ÉVENTUELLE -->
    <Error v-if="error" />

    <!-- 4) SECTION PRINCIPALE (LISTING) : uniquement si pas de chargement ni d’erreur -->
    <div v-if="!loading && !loadingCheapest && !error" class="flex-1">
      <!-- SECTION ICÔNE + TITRE + DESCRIPTION -->
      <div class="flex flex-col items-center mb-8">
        <!-- Icône “chance” (trèfle) : 🍀 -->
        <div class="text-5xl md:text-6xl mb-3">🍀</div>

        <!-- Titre -->
        <h2 class="text-2xl md:text-3xl font-semibold mb-1">
          Votre chance du jour
        </h2>

        <!-- Description -->
        <p class="text-sm md:text-base text-gray-300 text-center max-w-md">
          Trouvez des offres imbattables aujourd'hui et profitez pleinement de
          votre chance !
        </p>
      </div>

      <!-- Barre de recherche -->
      <div class="mb-8 w-full flex justify-center">
        <div
          class="flex items-center w-full max-w-xl bg-gray-800 rounded-full px-4 py-2 space-x-3"
        >
          <!-- Icône loupe -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5 text-gray-300 flex-shrink-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 
                 1 0 5.196 5.196a7.5 7.5 0 0 0 
                 10.607 10.607Z"
            />
          </svg>
          <!-- Input -->
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher un produit..."
            class="w-full bg-transparent text-sm md:text-base text-gray-100 placeholder-gray-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- Nombre total de résultats -->
      <div class="mb-4 text-left text-sm md:text-base text-gray-300">
        {{ totalCount }} résultats
      </div>

      <!-- Grid des produits -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="price in prices"
          :key="price.product_id"
          class="relative bg-gray-800 border border-gray-700 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
          @click="handleProductClick(price.product)"
        >
          <!-- Image du produit -->
          <div
            class="relative w-full h-36 sm:h-40 flex items-center justify-center overflow-hidden"
          >
            <img
              :src="price.product.image_url"
              :alt="price.product.name"
              @error="handleImageError"
              class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500"
            ></div>
          </div>
          <!-- Détails du produit -->
          <div class="p-4">
            <h2 class="text-base md:text-lg font-semibold truncate">
              {{ price.product.name }}
            </h2>
            <p class="text-xs md:text-sm text-gray-400 mt-1">
              {{ price.product.brand }}
            </p>
            <p class="text-xs md:text-sm text-gray-400">
              {{ price.product.unit }}
            </p>
            <p class="text-sm text-gray-100 mt-1">
              <span class="font-bold"> ${{ price.price }} </span>
              <span class="text-gray-300"> / {{ price.unit }} </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Loader "Load more" (skeletons) -->
      <div
        v-if="loadingMore"
        class="py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <LoadingListing v-for="n in 3" :key="n" />
      </div>

      <!-- Bouton "Charger plus" -->
      <div class="flex justify-center mt-6">
        <button
          @click="handleLoadMore"
          :disabled="isEndOfResults"
          :class="{
            'bg-gray-600 cursor-not-allowed': isEndOfResults,
            'bg-gray-800 hover:bg-gray-700': !isEndOfResults,
          }"
          class="text-sm md:text-base text-white py-2 px-6 rounded-full transition-all font-semibold"
        >
          Charger plus
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Optionnel : animation ou styles supplémentaires */
</style>
