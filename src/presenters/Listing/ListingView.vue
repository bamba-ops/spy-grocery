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

    console.log(prices.value.length);
    console.log(totalCount.value);

    if (
      prices.value.length == totalCount.value ||
      prices.value.length > totalCount.value
    ) {
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
      if (
        prices.value.length == totalCount.value ||
        prices.value.length > totalCount.value
      ) {
        isEndOfResults.value = true;
      }
    } else {
      error.value = "No prices founded";
    }

    loadingMore.value = false;
  } catch (err) {
    console.error("Error loading prices:", err);
    error.value = "Failed to load prices. Please try again.";
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
    "https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg"; // Remplacement par l'image par défaut
}

onMounted(() => {
  handlePricesListing();
});
</script>

<template>
  <main class="p-4 mt-12">
    <!-- Loading State avec Animation Pulse -->
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <LoadingListing v-for="n in 30" :key="n" />
    </div>

    <LoadingCheapest v-if="loadingCheapest && !error && !loading" />

    <Error v-if="error" />

    <div
      v-if="!loading && !loadingCheapest && !error"
      class="relative mb-8 w-full"
    >
      <div class="flex justify-center">
        <!-- Conteneur flex avec input et svg alignés horizontalement -->
        <div
          class="flex items-center w-3/4 max-w-lg bg-white rounded-full shadow-lg px-4 py-3 space-x-3"
        >
          <!-- Icône SVG directement intégré à gauche -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            class="w-6 h-6 stroke-2 text-black flex-shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>

          <!-- Barre de recherche sans padding excessif -->
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher un produit..."
            class="w-full text-lg focus:outline-none border-none"
          />
        </div>
      </div>
    </div>

    <!-- Total Results -->
    <div
      v-if="!loading && !loadingCheapest && !error"
      class="text-left text-lg font-semibold text-gray-800 mb-4"
    >
      {{ totalCount }} Results
    </div>

    <div
      v-if="!loading && !loadingCheapest && !error"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="price in prices"
        :key="price.product_id"
        class="relative group bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
        @click="handleProductClick(price.product)"
      >
        <!-- Image Section -->
        <div
          class="relative w-full h-40 flex items-center justify-center overflow-hidden"
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
        <!-- Content Section -->
        <div class="p-4">
          <h2 class="text-lg font-bold text-gray-800 truncate">
            {{ price.product.name }}
          </h2>
          <p class="text-sm text-gray-500 font-medium mt-1">
            {{ price.product.brand }}
          </p>
          <p class="text-sm text-gray-600 mt-1">
            {{ price.product.unit }}
          </p>
          <p class="text-sm text-gray-600 mt-1">
            <span class="text-gray-800"> ${{ price.price }} </span>
            / {{ price.unit }}
          </p>
        </div>
      </div>
    </div>

    <div
      class="py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      v-if="loadingMore"
    >
      <LoadingListing v-for="n in 3" :key="n" />
    </div>

    <!-- Bouton Load More -->
    <div
      v-if="!error && !loading && !loadingCheapest"
      class="flex justify-center mt-6"
    >
      <button
        @click="handleLoadMore"
        :disabled="isEndOfResults"
        :class="{
          'bg-gray-400 cursor-not-allowed': isEndOfResults,
          'bg-black hover:bg-gray-800': !isEndOfResults,
        }"
        class="text-white text-lg py-3 px-6 rounded-full transition-all"
      >
        Charger plus
      </button>
    </div>
  </main>
</template>

<style scoped>
/* Custom styles if needed */
</style>
