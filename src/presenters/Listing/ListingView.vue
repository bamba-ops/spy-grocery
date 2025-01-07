<script setup>
import { reactive, ref, onMounted, toRaw } from "vue";
import LoadingListing from "@/composant/LoadingListing.vue";
import { MainModel } from "../../models/MainModel";
import { useRouter } from "vue-router";
import { useProductStore } from "@/store/productStore";
import Error from "@/composant/Error.vue";
import LoadingCheapest from "@/composant/LoadingCheapest.vue";

const router = useRouter();
const prices = ref([]);
const loading = ref(false);
const error = ref(null);
const mainModel = new MainModel();
const _useProductStore = useProductStore();
const loadingCheapest = ref(false);

async function handlePricesListing() {
  loading.value = true;
  error.value = null;
  try {
    const _prices = await mainModel.fetchPricesByStoreId();
    //console.log(prices)
    prices.value = _prices;
  } catch (err) {
    console.error("Error loading prices:", err);
    error.value = "Failed to load prices. Please try again.";
  } finally {
    loading.value = false;
  }
}

async function handleProductClick(product) {
  console.log("Product clicked:", toRaw(product));
  try {
    loadingCheapest.value = true;
    error.value = null;

    const [targetProduct, bestMatch] = await mainModel.fetchBestPrice(
      toRaw(product)
    );

    console.log(targetProduct);
    console.log(bestMatch);
    _useProductStore.setTargetProduct(targetProduct);
    _useProductStore.setBestMacth(bestMatch);

    router.push("/cheapest");
  } catch (err) {
    error.value = "Failed to fetch the product details.";
  } finally {
    loadingCheapest.value = false;
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
  <main class="p-4">
    <!-- Loading State avec Animation Pulse -->
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <LoadingListing v-for="n in 30" :key="n" />
    </div>

    <LoadingCheapest v-if="loadingCheapest" />

    <Error v-if="error" />

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
            Brand: {{ price.product.brand }}
          </p>
          <p class="text-sm text-gray-600 mt-1">
            Unit: {{ price.product.unit }}
          </p>
          <p class="text-sm text-gray-600 mt-1">
            Price:
            <span class="font-semibold text-gray-800">
              ${{ price.price.toFixed(2) }}
            </span>
            / {{ price.unit }}
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Custom styles if needed */
</style>
