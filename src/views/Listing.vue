<script setup>
import { reactive, watch, onMounted, toRaw, computed } from "vue";
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/stores/globalStore";
import debounce from "lodash.debounce";
import { useI18n } from "vue-i18n";

import LoadingListing from "@/components/LoadingListing.vue";
import Error from "@/components/Error.vue";
import LoadingCheapest from "@/components/LoadingCheapest.vue";
import { VAR_CONFIG } from "@/config/var.config";

const TARGET_STORE_ID = VAR_CONFIG.TARGET_STORE_ID;
const router = useRouter();
const store = useGlobalStore();
const { t } = useI18n();

// État UI local
const state = reactive({
  loading: false,
  error: null,
  loadingCheapest: false,
  loadingMore: false,
  noResult: false,
  searchQuery: "",
});

// Computed properties from store
const prices = computed(() => store.prices);
const totalCount = computed(() => store.totalCount);
const isEndOfResults = computed(() => store.isEndOfResults);

onMounted(async () => {
  store.resetPagination();
  await loadInitialListing();
});

async function loadInitialListing() {
  state.loading = true;
  state.error = null;
  try {
    const { _prices } = await store.getPricesByStoreId();
    if (!_prices) {
      state.error = t("Listing.state.error");
    }
  } catch (err) {
    state.error = t("Listing.state.error");
  } finally {
    state.loading = false;
  }
}

watch(
  () => state.searchQuery,
  debounce(async (newVal) => {
    state.noResult = false;
    store.resetPagination();
    if (!newVal) {
      return await loadInitialListing();
    }
    state.loading = true;
    try {
      const { _prices } = await store.searchPricesByStoreAndName(
        TARGET_STORE_ID,
        newVal
      );
      if (!_prices || _prices.length === 0) {
        state.noResult = true;
      }
    } catch (err) {
      state.noResult = true;
    } finally {
      state.loading = false;
    }
  }, 500)
);

async function handleLoadMore() {
  if (isEndOfResults.value) {
    return;
  }
  state.loadingMore = true;
  try {
    const fetcher = state.searchQuery
      ? () =>
          store.searchPricesByStoreAndName(TARGET_STORE_ID, state.searchQuery)
      : () => store.getPricesByStoreId();
    await fetcher();
  } catch (err) {
    state.error = t("Listing.state.error");
  } finally {
    state.loadingMore = false;
  }
}

async function handleProductClick(product) {
  try {
    state.loadingCheapest = true;
    state.error = null;
    await store.getBestPrice(toRaw(product));
    router.push("/cheapest");
  } catch (err) {
    state.error = t("Listing.state.error");
  }
}

function handleImageError(event) {
  event.target.src = VAR_CONFIG.TARGET_IMAGE_URL_ERROR;
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
          {{ t("Listing.title") }}
        </h2>
        <p class="text-base md:text-lg text-gray-600 text-center max-w-lg">
          {{ t("Listing.description") }}
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
            :placeholder="t('Listing.search_placeholder')"
            class="w-full bg-transparent text-base md:text-lg text-gray-800 placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      <div v-if="state.noResult" class="text-gray-400 text-center mb-4">
        {{ t("Listing.no_result") }}
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
        {{ prices.length }} / {{ totalCount }}
        {{ t("Listing.results") }}
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
          v-for="price in prices"
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
          :disabled="isEndOfResults"
          :class="{
            'bg-gray-200 text-gray-400': isEndOfResults,
            'bg-black text-white hover:bg-gray-800': !isEndOfResults,
          }"
          class="py-3 px-8 rounded-full transition-all duration-300 text-base md:text-lg font-medium shadow-md hover:shadow-lg"
        >
          {{ t("Listing.load_more") }}
        </button>
      </div>
    </div>
  </main>
</template>
