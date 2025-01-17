<script setup>
import { reactive, watch, onMounted, toRaw } from "vue";
import { useRouter } from "vue-router";
import { mainModel } from "@/models/MainModel";
import debounce from "lodash.debounce";

import LoadingListing from "@/composant/LoadingListing.vue";
import Error from "@/composant/Error.vue";
import LoadingCheapest from "@/composant/LoadingCheapest.vue";

const TARGET_STORE_ID = "32d6dd89-4216-4588-a096-631bfaf5df56";
const router = useRouter();
const _mainModel = mainModel();

const state = reactive({
  prices: [],
  loading: false,
  error: null,
  loadingCheapest: false,
  loadingMore: false,
  isEndOfResults: false,
  totalCount: 0,
  noResult: false,
  searchQuery: "",
});

onMounted(async () => {
  console.log("Montage du composant : chargement initial...");
  _mainModel.currentOffset = 0;
  state.isEndOfResults = false;
  await loadInitialListing();
});

async function loadInitialListing() {
  console.log("Chargement de la liste initiale...");
  state.loading = true;
  state.error = null;
  try {
    const { total_count, _prices } = await _mainModel.getPricesByStoreId();
    if (_prices) {
      state.prices = _prices;
      state.totalCount = total_count;
      state.isEndOfResults = state.prices.length >= total_count;
      console.log("Liste initiale chargée avec succès.", {
        prices: state.prices,
      });
    } else {
      state.error = "Failed to load prices. Please try again.";
      console.error(state.error);
    }
  } catch (err) {
    console.error("Erreur lors du chargement initial :", err);
    state.error = "Failed to load prices. Please try again.";
  } finally {
    state.loading = false;
  }
}

watch(
  () => state.searchQuery,
  debounce(async (newVal) => {
    console.log("Recherche modifiée :", newVal);
    state.noResult = false;
    _mainModel.currentOffset = 0;
    state.isEndOfResults = false;
    if (!newVal) {
      console.log("Recherche vide, rechargement de la liste initiale...");
      return await loadInitialListing();
    }
    state.loading = true;
    try {
      const { total_count, _prices } =
        await _mainModel.searchPricesByStoreAndName(TARGET_STORE_ID, newVal);
      if (_prices) {
        state.prices = _prices;
        state.totalCount = total_count;
        state.isEndOfResults = state.prices.length >= total_count;
        console.log("Résultats de recherche :", { prices: state.prices });
      } else {
        state.noResult = true;
        console.log("Aucun résultat trouvé pour la recherche.");
      }
    } catch (err) {
      console.error("Erreur lors de la recherche :", err);
      state.noResult = true;
    } finally {
      state.loading = false;
    }
  }, 500)
);

async function handleLoadMore() {
  console.log("Chargement de plus de résultats...");
  if (state.isEndOfResults) {
    console.log("Fin des résultats atteinte.");
    return;
  }
  state.loadingMore = true;
  try {
    const fetcher = state.searchQuery
      ? _mainModel.searchPricesByStoreAndName.bind(
          null,
          TARGET_STORE_ID,
          state.searchQuery
        )
      : _mainModel.getPricesByStoreId;
    const { total_count, _prices } = await fetcher();
    state.totalCount = total_count;
    if (_prices?.length) {
      state.prices.push(..._prices);
      state.isEndOfResults = state.prices.length >= state.totalCount;
      console.log("Nouveaux éléments ajoutés :", _prices);
    } else {
      console.log("Aucun nouvel élément trouvé.");
    }
  } catch (err) {
    console.error("Erreur lors du chargement de plus de résultats :", err);
    state.error = "Failed to load more products.";
  } finally {
    state.loadingMore = false;
  }
}

async function handleProductClick(product) {
  console.log("Produit sélectionné :", product);
  try {
    state.loadingCheapest = true;
    state.error = null;
    await _mainModel.getBestPrice(toRaw(product));
    console.log("Navigation vers '/cheapest' après sélection du produit.");
    router.push("/cheapest");
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des détails du produit :",
      err
    );
    state.error = "Failed to fetch product details.";
  }
}

function handleImageError(event) {
  console.log(
    "Erreur de chargement de l'image, remplacement par une image par défaut."
  );
  event.target.src =
    "https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg";
}
</script>

<template>
  <main class="min-h-screen text-white p-4 flex flex-col">
    <LoadingCheapest
      v-if="state.loadingCheapest && !state.error && !state.loading"
    />
    <Error v-if="state.error" />

    <div v-if="!state.loadingCheapest && !state.error" class="flex-1">
      <!-- Titre et description -->
      <div class="flex flex-col items-center mb-8">
        <div class="text-5xl md:text-6xl mb-3">🍀</div>
        <h2 class="text-2xl md:text-3xl font-semibold mb-1">
          Votre chance du jour
        </h2>
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
          <input
            type="text"
            v-model="state.searchQuery"
            placeholder="Rechercher un produit..."
            class="w-full bg-transparent text-sm md:text-base text-gray-100 placeholder-gray-500 focus:outline-none"
          />
        </div>
      </div>

      <div v-if="state.noResult" class="text-gray-400 text-center mb-4">
        Aucun résultat
      </div>

      <div
        v-if="state.loading && !state.noResult"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <LoadingListing v-for="n in 30" :key="n" />
      </div>

      <div
        v-if="!state.noResult"
        class="mb-4 text-left text-sm md:text-base text-gray-300"
      >
        {{ state.prices.length }} / {{ state.totalCount }} résultats
      </div>

      <div
        v-if="
          !state.loading &&
          !state.error &&
          !state.loadingCheapest &&
          !state.noResult
        "
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="price in state.prices"
          :key="price.product_id"
          class="relative bg-gray-800 border border-gray-700 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
          @click="handleProductClick(price.product)"
        >
          <div
            class="relative w-full h-36 sm:h-40 flex items-center justify-center overflow-hidden group"
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
            <p class="text-lg text-gray-100 mt-1">
              <span v-if="price.is_promo">
                <span class="font-bold"> {{ price.quantity }} / </span>
                <span class="font-bold"> ${{ price.price_un }} </span>
              </span>
              <span v-else class="font-bold"> ${{ price.price_un }} </span>
            </p>
            <p class="text-xs md:text-sm text-gray-400">
              ${{ price.price }} / {{ price.unit }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="state.loadingMore"
        class="py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <LoadingListing v-for="n in 3" :key="n" />
      </div>

      <div v-if="!state.noResult" class="flex justify-center mt-6">
        <button
          @click="handleLoadMore"
          :disabled="state.isEndOfResults"
          :class="{
            'bg-gray-600 cursor-not-allowed': state.isEndOfResults,
            'bg-gray-800 hover:bg-gray-700': !state.isEndOfResults,
          }"
          class="bg-gray-900 text-sm md:text-base text-white py-2 px-6 rounded-full transition-all font-semibold"
        >
          Charger plus
        </button>
      </div>
    </div>
  </main>
</template>
