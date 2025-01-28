<script setup>
import { reactive, watch, onMounted, toRaw } from "vue";
import { useRouter } from "vue-router";
import { mainModel } from "@/models/MainModel";
import debounce from "lodash.debounce";

import LoadingListing from "@/components/LoadingListing.vue";
import Error from "@/components/Error.vue";
import LoadingCheapest from "@/components/LoadingCheapest.vue";

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
  <main class="min-h-screen text-black bg-white p-4 flex flex-col">
    <LoadingCheapest
      v-if="state.loadingCheapest && !state.error && !state.loading"
    />
    <Error v-if="state.error" />

    <div v-if="!state.loadingCheapest && !state.error" class="flex-1">
      <!-- Header section -->
      <div class="flex flex-col items-center mb-12">
        <div class="text-6xl md:text-7xl mb-4">🍀</div>
        <h2 class="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
          Votre chance du jour
        </h2>
        <p class="text-base md:text-lg text-gray-600 text-center max-w-lg">
          Trouvez des offres imbattables aujourd'hui et profitez pleinement de
          votre chance !
        </p>
      </div>

      <!-- Search bar -->
      <div class="mb-10 w-full flex justify-center">
        <div
          class="flex items-center w-full max-w-2xl bg-white border border-gray-200 rounded-full px-6 py-3 space-x-4 shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-6 h-6 text-gray-400 flex-shrink-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="text"
            v-model="state.searchQuery"
            placeholder="Rechercher un produit..."
            class="w-full bg-transparent text-base md:text-lg text-gray-800 placeholder-gray-400 focus:outline-none"
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
        class="mb-6 text-left text-base md:text-lg text-gray-600 font-medium"
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
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <div
          v-for="price in state.prices"
          :key="price.product_id"
          class="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
          @click="handleProductClick(price.product)"
        >
          <div
            class="relative w-full h-48 sm:h-52 flex items-center justify-center overflow-hidden"
          >
            <img
              :src="price.product.image_url"
              :alt="price.product.name"
              @error="handleImageError"
              class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <div
              class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"
            ></div>
          </div>
          <div class="p-6">
            <h2 class="text-lg md:text-xl font-bold text-gray-900 truncate">
              {{ price.product.name_raw }}
            </h2>

            <p class="text-sm md:text-base text-gray-600 mt-2">
              {{ price.product.brand }}
            </p>
            <!--
            <p class="text-sm md:text-base text-gray-600">
              {{ price.product.unit }}
            </p>
          -->
            <div class="mt-4 flex items-baseline space-x-2">
              <p class="text-2xl font-bold text-gray-900">
                <span v-if="price.is_promo">
                  {{ price.quantity }} / ${{ price.price_un }}
                </span>
                <span v-else>${{ price.price_un }}</span>
              </p>
              <p class="text-sm text-gray-500">
                ${{ price.price }} / {{ price.unit }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="state.loadingMore"
        class="py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <LoadingListing v-for="n in 3" :key="n" />
      </div>

      <div v-if="!state.noResult" class="flex justify-center mt-10">
        <button
          @click="handleLoadMore"
          :disabled="state.isEndOfResults"
          :class="{
            'bg-gray-200 text-gray-400': state.isEndOfResults,
            'bg-black text-white hover:bg-gray-800': !state.isEndOfResults,
          }"
          class="py-3 px-8 rounded-full transition-all duration-300 text-base md:text-lg font-medium shadow-md hover:shadow-lg"
        >
          Charger plus
        </button>
      </div>
    </div>
  </main>
</template>
