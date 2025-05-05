<template>
  <div class="min-h-screen bg-white relative">
    <!-- État de chargement -->
    <div v-if="isLoading" class="max-w-4xl mx-auto px-4 py-6 animate-pulse">
      <!-- En-tête -->
      <div class="mb-8">
        <div class="h-8 bg-gray-200 rounded-full w-48 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded-full w-32"></div>
      </div>

      <!-- Produit principal -->
      <section class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex flex-col md:flex-row gap-6">
          <!-- Image -->
          <div class="md:w-1/3 relative">
            <div class="w-full h-32 bg-gray-200 rounded-lg p-2">
              <svg
                class="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <!-- Détails -->
          <div class="md:w-2/3 space-y-4">
            <!-- Magasin -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div class="h-4 bg-gray-200 rounded-full w-32"></div>
            </div>

            <!-- Prix -->
            <div class="space-y-3">
              <div class="h-8 bg-gray-200 rounded-full w-32"></div>
              <div class="h-4 bg-gray-200 rounded-full w-48"></div>
            </div>

            <!-- Bouton -->
            <div class="h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </section>

      <!-- Alternatives de chargement -->
      <section v-for="n in 2" :key="n" class="space-y-4 mt-8">
        <!-- En-tête magasin -->
        <div class="flex items-center gap-3 px-2">
          <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div class="h-4 bg-gray-200 rounded-full w-48"></div>
        </div>

        <!-- Produits -->
        <div class="overflow-x-auto pb-4 scrollbar-hidden">
          <div class="flex gap-4 w-max">
            <div
              v-for="n in 3"
              :key="n"
              class="w-64 flex-shrink-0 bg-white rounded-lg p-4 shadow-sm border"
            >
              <div class="w-full h-32 bg-gray-200 rounded-lg"></div>
              <div class="h-4 bg-gray-200 rounded-full mt-3 w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded-full mt-2 w-1/2"></div>
              <div class="h-8 bg-gray-200 rounded-full mt-3 w-16"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <template v-else>
      <!-- En-tête principal -->
      <header class="bg-white sticky top-0 z-20 shadow-sm">
        <div
          class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between"
        >
          <h1 class="text-xl font-bold text-gray-900">
            {{ targetStore.products[0].product_name }}
            <span class="block text-sm font-normal text-gray-500">{{
              targetStore.products[0].brand
            }}</span>
          </h1>
        </div>
      </header>

      <!-- Contenu principal -->
      <main class="max-w-3xl mx-auto px-4 py-6 space-y-8">
        <!-- Section produit principal -->
        <section class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex flex-col md:flex-row gap-6">
            <div class="md:w-1/3 relative">
              <img
                @error="onImgError"
                :src="targetStore.products[0].product_image_url"
                class="w-full h-48 object-contain bg-white rounded-lg p-4"
              />
              <span
                v-if="targetStore.products[0].is_promo"
                class="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded-full text-xs"
              >
                PROMO
              </span>
              <div
                v-if="lastAdded === targetStore.products[0].product_id"
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

            <div class="md:w-2/3 space-y-4">
              <div class="flex items-center gap-3">
                <img
                  @error="onImgError"
                  :src="targetStore.store_image_url"
                  class="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                />
                <div>
                  <h2 class="font-semibold">
                    {{ targetStore.store_name }}
                  </h2>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-baseline gap-2">
                  <span class="text-3xl font-bold text-gray-900">
                    {{ targetStore.products[0].price_un }}$
                  </span>
                  <span v-if="targetStore.products[0].price">
                    <span class="text-gray-500 text-sm">
                      {{ targetStore.products[0].price }}$/{{
                        targetStore.products[0].price_unit
                      }}
                    </span>
                  </span>
                </div>
                <p class="text-gray-600 text-sm">
                  {{ targetStore.products[0].product_unit }}
                </p>
              </div>

              <button
                @click="handleAddToCart(targetStore, targetStore.products[0])"
                class="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
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
                Ajouter au panier
              </button>
              <!-- Bouton de redirection -->
              <a
                :href="targetStore.products[0].link"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center w-full h-12 border bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span>Voir le produit sur {{ targetStore.store_name }}</span>
                <svg
                  class="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <!-- Alternatives par magasin -->
        <section
          v-for="store in alternativeStores"
          :key="store.store_id"
          class="space-y-4"
        >
          <div class="flex items-center gap-3 px-2">
            <img
              :src="store.store_image_url"
              @error="onImgError"
              class="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
            <div>
              <h3 class="font-semibold">{{ store.store_name }}</h3>
              <p class="text-sm text-gray-500 flex items-center gap-1">
                <span>🎯 {{ store.products.length }} options</span>
              </p>
            </div>
          </div>

          <div class="overflow-x-auto pb-4 scrollbar-hidden">
            <div class="flex gap-4 w-max">
              <div
                v-for="product in store.products"
                :key="product.product_id"
                class="w-64 flex-shrink-0 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border"
              >
                <a
                  :href="product.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block relative group"
                >
                  <img
                    @error="onImgError"
                    :src="product.product_image_url"
                    class="w-full h-32 object-contain bg-white p-2 rounded-lg hover:opacity-90 transition-opacity"
                  />
                  <div
                    v-if="product.is_promo"
                    class="absolute top-2 left-2 bg-black text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1"
                  >
                    <span>PROMO</span>
                  </div>
                  <!-- Badge externe -->
                  <span
                    class="absolute top-2 right-2 bg-black/90 px-2 py-1 rounded-full text-xs text-white shadow-sm flex items-center gap-1"
                  >
                    <svg
                      class="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    <span>Visiter</span>
                  </span>
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
                </a>
                <h4 class="font-medium text-sm line-clamp-2">
                  {{ product.product_name }}
                </h4>
                <p class="text-xs text-gray-500 mt-1">{{ product.brand }}</p>
                <template v-if="canCompareBasePrice(product)">
                  <div
                    v-if="getDiff(product) < 0"
                    class="text-green-600 text-xs mt-2 flex items-center gap-1"
                  >
                    ↓ {{ Math.abs(getDiff(product)).toFixed(2) }}$ moins cher au
                    {{ product.price_unit }}
                  </div>
                  <div
                    v-else-if="getDiff(product) > 0"
                    class="text-red-600 text-xs mt-2 flex items-center gap-1"
                  >
                    ↑ {{ getDiff(product).toFixed(2) }}$ plus cher au
                    {{ product.price_unit }}
                  </div>
                </template>

                <!-- sinon on compare sur price_un -->
                <template v-else>
                  <div
                    v-if="getDiff(product) < 0"
                    class="text-green-600 text-xs mt-2 flex items-center gap-1"
                  >
                    ↓ {{ Math.abs(getDiff(product)).toFixed(2) }}$ moins cher à
                    l'unité
                  </div>
                  <div
                    v-else-if="getDiff(product) > 0"
                    class="text-red-600 text-xs mt-2 flex items-center gap-1"
                  >
                    ↑ {{ getDiff(product).toFixed(2) }}$ plus cher à l'unité
                  </div>
                </template>

                <div class="mt-3 flex justify-between items-center">
                  <div>
                    <span class="font-bold">{{ product.price_un }}$</span>
                    <span v-if="product.price">
                      <span class="text-gray-500 text-xs ml-1"
                        >{{ product.price }}$</span
                      >
                      <span class="text-gray-500 text-xs ml-1"
                        >/{{ product.price_unit }}</span
                      >
                    </span>
                    <div class="mt-1 text-[0.7rem] text-gray-400">
                      {{ product.product_unit }}
                    </div>
                  </div>

                  <button
                    @click="handleAddToCart(store, product)"
                    class="p-2 rounded-lg bg-white border hover:bg-gray-200 transition-colors"
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
            </div>
          </div>

          <p
            v-if="store.products.length > 2"
            class="text-center text-sm text-gray-400 -mt-4"
          >
            ← Faites glisser pour voir plus d'options →
          </p>
        </section>
        <LockedStore v-if="!session" />
      </main>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "@/api/supabase";
import axios from "axios";
import { useCartStore } from "@/stores/useCartStore";
import LockedStore from "@/components/product/LockedStore.vue";

const route = useRoute();
const productId = route.params.id;
const targetStore = ref(null);
const cart = useCartStore();
const alternativeStores = ref([]);
const isLoading = ref(true);
const ERROR_MESSAGES = {
  SUPABASE: "❌ Erreur lors de l'appel de la fonction search_products_v3:",
  PROCESSING: "❌ Erreur lors du traitement:",
  SIMILARITY: "[localSimilarity] Error:",
};
const LOCAL_API = "https://api.spygrocery.com/similarity";
const SIMILARITY_THRESHOLD = 0.3;
const MAX_RESULTS = 100;
const defaultImage = ref(
  "https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg"
);
const lastAdded = ref(null);
const props = defineProps({
  session: {
    type: Object,
    required: true,
  },
});

// Simulation de chargement
onMounted(async () => {
  try {
    const result = await searchProductsById(productId);
    targetStore.value = result.targetStore; // Correction ici
    alternativeStores.value = result.alternativeStores;
  } catch (err) {
    console.error("❌ Erreur:", err.message);
  } finally {
    isLoading.value = false;
  }
});

function handleAddToCart(store, product) {
  const enrichedProduct = {
    ...product,
    store_id: store.store_id,
    store_name: store.store_name,
    store_image_url: store.store_image_url,
  };

  cart.addToCart(enrichedProduct);
  lastAdded.value = product.product_id;

  setTimeout(() => {
    lastAdded.value = null;
  }, 600);
}

function onImgError(event) {
  event.target.src = defaultImage.value;
  // pour éviter une boucle si defaultImage est lui-même introuvable :
  event.target.onerror = null;
}
// Appelle le microservice local pour obtenir les scores de similarité
async function localSimilarity(source, sentencesArray) {
  try {
    const response = await axios.post(
      LOCAL_API,
      {
        source_sentence: source,
        sentences: sentencesArray,
      },
      { headers: { "Content-Type": "application/json" }, timeout: 60000 }
    );
    return response.data;
  } catch (error) {
    console.error(
      ERROR_MESSAGES.SIMILARITY,
      error.response?.data || error.message
    );
    return null;
  }
}

// Recherche les produits similaires via Supabase + similarité locale
async function searchProductsById(id) {
  try {
    // Étape 1: Récupérer le produit de référence
    const { data: refProd, error: fetchError } = await supabase
      .from("products")
      .select("name")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    // Étape 2: Appeler la fonction PostgreSQL
    const { data: storeResults, error: rpcError } = await supabase.rpc(
      "search_products_v4",
      { search_text: refProd.name }
    );
    if (rpcError) throw rpcError;

    // Étape 3: Trouver le magasin cible
    let target = null;
    const alternatives = [];

    for (const store of storeResults) {
      const foundIndex = store.products.findIndex((p) => p.product_id === id);
      if (foundIndex > -1) {
        target = {
          ...store,
          products: [store.products[foundIndex]],
        };
      } else {
        alternatives.push(store);
      }
    }

    // Étape 4: Calculer la similarité pour les alternatives
    const allProducts = alternatives.flatMap((store) =>
      store.products.map((p) => ({ ...p, store }))
    );

    const scores = await localSimilarity(
      refProd.name,
      allProducts.map((p) => p.product_name)
    );

    // Étape 5: Fusionner les résultats
    const processed = allProducts
      .map((p, i) => ({ ...p, similarity: scores[i] }))
      .filter((p) => p.similarity >= SIMILARITY_THRESHOLD)
      .reduce((acc, p) => {
        acc[p.store.store_id] = acc[p.store.store_id] || {
          ...p.store,
          products: [],
        };
        acc[p.store.store_id].products.push(p);
        return acc;
      }, {});

    return {
      targetStore: target,
      alternativeStores: Object.values(processed),
    };
  } catch (error) {
    console.error("Erreur recherche:", error);
    return { targetStore: null, alternativeStores: [] };
  }
}

// Permet de savoir si on compare sur `price` (les deux non-null)
function canCompareBasePrice(product) {
  return (
    product.price != null && targetStore.value.products?.[0]?.price != null
  );
}

// Valeur « gauche » : soit product.price soit product.price_un
function getLeftPrice(product) {
  return canCompareBasePrice(product) ? product.price : product.price_un;
}

// Valeur « droite » : soit targetStore.products[0].price soit .price_un
function getRightPrice(product) {
  return canCompareBasePrice(product)
    ? targetStore.value.products[0].price
    : targetStore.value.products[0].price_un;
}

// Différence : positif si left > right, négatif si left < right
function getDiff(product) {
  return getLeftPrice(product) - getRightPrice(product);
}
</script>
<style scoped>
/* Masquage de la scrollbar natif */
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none; /* IE et Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
