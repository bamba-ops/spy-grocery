<script setup>
import { ref, onMounted, reactive } from "vue";
import Error from "@/composant/Error.vue";
import { mainModel } from "@/models/MainModel";

const TARGET_STORE_ID = "8f719263-a1a0-4f39-b398-29c37ef2c266"; // Le store_id à vérifier
const loading = ref(false);
const error = ref(null);
const _targetProduct = ref();
const _bestMatch = ref([]);
const bestDeal = ref();
const secondDeal = ref();
const _mainModel = mainModel();

function handleIsBestPrice() {
  if (_targetProduct.value.price > _bestMatch.value[0].price) {
    bestDeal.value = _bestMatch.value[0];
    secondDeal.value = _targetProduct.value;
  } else {
    bestDeal.value = _targetProduct.value;
    secondDeal.value = _bestMatch.value[0];
  }
}

function removeFirstProduct() {
  if (_bestMatch.value.length > 1) {
    _bestMatch.value.shift();
    handleIsBestPrice();
  }
}

function handleImageError(event) {
  event.target.src =
    "https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg"; // Remplacement par l'image par défaut
}

/*
async function handleBestPrice() {
  loading.value = true;
  error.value = null;

  try {
    //const targetProduct = null
    const [targetProduct, bestMatch] = await mainModel.fetchBestPrice();
    _targetProduct.value = targetProduct;
    _bestMatch.value = bestMatch;
    handleIsBestPrice();
  } catch (error) {
    console.error("Error loading best price:", error);
    error = "Failed to load the best price. Please try again.";
  } finally {
    loading.value = false;
  }
}
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
  } catch (error) {
    console.error("Error loading best price:", error);
    error = "Failed to load the best price. Please try again.";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  handleBestPrice();
});
</script>

--- ## ✅ **Template :** ```vue
<template>
  <main class="p-6 mt-12 flex flex-col items-center">
    <h1
      v-if="!loading && !error"
      class="text-4xl font-bold text-center mb-10 text-green-700"
    >
      🍀 Find the Best Deals
    </h1>

    <!-- État de chargement -->
    <LoadingResultComposant v-if="loading" />

    <Error v-if="error" />

    <!-- Produit le moins cher avec mise en avant -->
    <div
      v-else-if="bestDeal"
      class="w-full max-w-3xl bg-green-100 border border-green-400 rounded-lg shadow-lg p-8 mb-10 text-center relative animate-pulse"
    >
      <div
        class="absolute top-0 left-0 bg-green-500 text-white px-4 py-2 text-lg font-semibold rounded-br-lg"
      >
        🎉 Best Deal!
      </div>

      <!-- Image Section -->
      <img
        :src="bestDeal.product.image_url"
        @error="handleImageError"
        alt="Product Image"
        class="w-40 h-40 object-cover rounded-lg mx-auto mb-6"
      />
      <h2 class="text-3xl font-bold text-green-700">
        {{ bestDeal.product.name }}
      </h2>
      <p class="text-lg">{{ bestDeal.product.brand }}</p>
      <p class="text-lg">{{ bestDeal.product.unit }}</p>
      <p class="text-xl text-green-700 font-bold my-2">
        ${{ bestDeal.price }} / {{ bestDeal.unit }}
      </p>

      <!-- Section Store -->
      <div class="flex items-center justify-center gap-4 mt-6">
        <img
          :src="bestDeal.store.image_url"
          @error="handleImageError"
          alt="Store Logo"
          class="w-12 h-12 object-contain rounded-full border border-gray-300"
        />
        <p class="text-md text-gray-700 font-semibold">
          Available at
          <span class="text-green-700">{{ bestDeal.store.name }}</span>
        </p>
      </div>

      <!-- ✅ Bouton de Suppression Conditionnel -->
      <div
        v-if="bestDeal.store.id === TARGET_STORE_ID"
        class="mt-6 text-center"
      >
        <p class="text-lg font-semibold text-red-600 mb-2">
          ❓ Est-ce le mauvais article ? Cliquez ci-dessous pour passer !
        </p>
        <button
          @click="removeFirstProduct"
          class="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-300"
        >
          🚫 Passer cet article
        </button>
      </div>
    </div>

    <!-- Liste des autres produits -->
    <div
      v-if="secondDeal"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl"
    >
      <div
        class="bg-white border border-gray-300 rounded-lg shadow-md p-6 text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
      >
        <!-- Numéro du produit -->
        <div
          class="absolute top-2 left-2 bg-gray-800 text-white px-3 py-1 rounded-full font-bold"
        >
          #1
        </div>

        <!-- Image -->
        <img
          :src="secondDeal.product.image_url"
          @error="handleImageError"
          alt="Product Image"
          class="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
        />

        <!-- Infos Produit -->
        <h3 class="text-lg font-bold">
          {{ secondDeal.product.name }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ secondDeal.product.brand }}
        </p>
        <p class="text-sm">{{ secondDeal.product.unit }}</p>
        <p class="text-lg font-bold text-green-700 mt-2">
          ${{ secondDeal.price }} / {{ secondDeal.unit }}
        </p>

        <!-- Infos Store -->
        <div class="flex items-center justify-center gap-3 mt-4">
          <img
            :src="secondDeal.store.image_url"
            @error="handleImageError"
            alt="Store Logo"
            class="w-12 h-12 object-contain rounded-full border border-gray-300"
          />
          <p class="text-sm text-gray-600">
            {{ secondDeal.store.name }}
          </p>
        </div>
        <!-- ✅ Bouton de Suppression Conditionnel -->
        <div
          v-if="secondDeal.store.id === TARGET_STORE_ID"
          class="mt-6 text-center"
        >
          <p class="text-lg font-semibold text-red-600 mb-2">
            ❓ Est-ce le mauvais article ? Cliquez ci-dessous pour passer !
          </p>
          <button
            @click="removeFirstProduct"
            class="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-300"
          >
            🚫 Passer cet article
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
