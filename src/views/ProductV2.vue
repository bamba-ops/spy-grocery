```vue
<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "@/api/supabase";
import { useCartStore } from "@/stores/useCartStore";
import axios from "axios";

const route = useRoute();
const cart = useCartStore();
const productId = route.params.id;
const products = ref([]);
const isLoading = ref(true);
const ERROR_MESSAGES = {
  SUPABASE: "❌ Erreur lors de l'appel de la fonction search_products_v3:",
  PROCESSING: "❌ Erreur lors du traitement:",
  SIMILARITY: "[localSimilarity] Error:",
};
const LOCAL_API = "http://69.62.70.104:8001/similarity";
const SIMILARITY_THRESHOLD = 0.3;
const MAX_RESULTS = 100;
const defaultImage = ref('https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg')


function onImgError(event) {
        event.target.src = defaultImage.value
        // pour éviter une boucle si defaultImage est lui-même introuvable :
        event.target.onerror = null
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
    console.log(
      `🔄 Recherche de produits similaires pour ID="${id}" via Supabase...`
    );

    // 1) appel RPC full‑text sur le nom du produit référencé
    const { data: refProd, error: fetchError } = await supabase
      .from("products")
      .select("name")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;
    const searchText = refProd.name;

    // 2) appel RPC search_products_v3 avec le nom
    const { data: rpcProducts, error: rpcError } = await supabase.rpc(
      "search_products_v3",
      { search_text: searchText }
    );
    if (rpcError) throw new Error(rpcError.message);
    console.log(`🔍 ${rpcProducts.length} produits récupérés via Supabase.`);

    // 3) calcul de similarité
    const names = rpcProducts.map((p) => p.product_name);
    const scores = await localSimilarity(searchText, names);
    if (!scores || scores.length !== rpcProducts.length) {
      throw new Error("Erreur de correspondance des scores de similarité");
    }

    // 4) fusion scores + filtrage + tri
    return rpcProducts
      .map((prod, idx) => ({ ...prod, similarity: scores[idx] }))
      .filter((p) => p.similarity >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, MAX_RESULTS);
  } catch (error) {
    console.error(ERROR_MESSAGES.PROCESSING, error.message);
    return [];
  }
}

onMounted(async () => {
  try {
    products.value = await searchProductsById(productId);
  } catch (err) {
    console.error("❌ Initialisation ComparePage.vue:", err.message);
  } finally {
    isLoading.value = false;
  }
});

// Regroupement des produits par magasin
const grouped = computed(() => {
  const map = {};
  products.value.forEach((p) => {
    (map[p.store_id] ||= []).push(p);
  });
  return map;
});

// Garde un index courant pour chaque magasin
const indices = reactive({});
watch(
  grouped,
  (g) => {
    Object.keys(g).forEach((id) => {
      if (!(id in indices)) indices[id] = 0;
      if (indices[id] >= g[id].length) indices[id] = 0;
    });
  },
  { immediate: true }
);

function currentProduct(storeId) {
  return grouped.value[storeId]?.[indices[storeId]];
}

// Prix unitaire actuel
function priceUn(storeId) {
  return parseFloat(currentProduct(storeId)?.price_un ?? Infinity);
}

// Liste des store IDs dans l'ordre d'arrivée (pas de réordonnancement)
const storeIds = computed(() => Object.keys(grouped.value));

// Pour calculer la meilleure offre, on trie temporairement
const storeIdsSorted = computed(() =>
  Object.keys(grouped.value).sort((a, b) => priceUn(a) - priceUn(b))
);
const bestPrice = computed(() =>
  Math.min(...storeIdsSorted.value.map((id) => priceUn(id)))
);
function isBestDeal(storeId) {
  return priceUn(storeId) === bestPrice.value;
}

// Navigation du carrousel interne
function prev(storeId) {
  const len = grouped.value[storeId].length;
  indices[storeId] = (indices[storeId] - 1 + len) % len;
}
function next(storeId) {
  const len = grouped.value[storeId].length;
  indices[storeId] = (indices[storeId] + 1) % len;
}

// Animation après ajout au panier
const lastAdded = ref(null);
function handleAddToCart(product) {
  cart.addToCart(product);
  lastAdded.value = product.product_id;
  setTimeout(() => (lastAdded.value = null), 600);
}
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- EN‑TÊTE & RÉSUMÉ -->
    <header class="bg-white border-b border-gray-100">
      <div class="max-w-3xl mx-auto px-4 py-6">
        <h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          🛒 Comparer les prix
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Meilleure offre :
          <span class="font-semibold text-black">
            {{ bestPrice.toFixed(2) }} $
          </span>
          chez
          <span class="font-medium">
            {{
              storeIdsSorted.length
                ? currentProduct(storeIdsSorted[0]).store_name
                : ""
            }}
          </span>
        </p>
      </div>
    </header>

    <!-- CONTENU PRINCIPAL -->
    <main class="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
      <!-- SKELETON LOADER -->
      <template v-if="isLoading">
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse"
        >
          <div
            v-for="n in 6"
            :key="n"
            class="bg-white rounded-xl ring-1 ring-gray-100 p-4 space-y-4"
          >
            <div class="bg-gray-200 h-40 rounded"></div>
            <div class="h-3 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </template>

      <!-- CARTES PRODUIT -->
      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <article
            v-for="storeId in storeIds"
            :key="storeId"
            class="group relative bg-white hover:shadow-lg transition-shadow duration-200 rounded-xl"
          >
            <!-- BEST DEAL BADGE -->
            <span
              v-if="isBestDeal(storeId)"
              class="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm"
            >
              BEST DEAL
            </span>

            <!-- IMAGE + CARROUSEL -->
            <div
              class="relative aspect-square bg-gradient-to-br from-gray-50 to-white rounded-t-xl overflow-hidden"
            >
              <img
              @error="onImgError"
                :src="currentProduct(storeId)?.product_image_url"
                :alt="currentProduct(storeId)?.product_name"
                class="w-full h-full object-contain p-4 transition-transform duration-200 group-hover:scale-105"
              />

              <!-- PROMO BADGE -->
              <div
                v-if="currentProduct(storeId)?.is_promo"
                class="absolute top-2 right-2"
              >
                <span
                  class="bg-black text-white px-2.5 py-1 rounded-full text-xs font-medium tracking-wide shadow-sm"
                  >PROMO</span
                >
              </div>

              <!-- CONTRÔLES CARROUSEL -->
              <button
                v-if="grouped[storeId].length > 1"
                @click.stop="prev(storeId)"
                class="absolute left-1 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm p-1.5 rounded-full hover:bg-white"
              >
                <svg
                  class="h-5 w-5 text-gray-600"
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
                v-if="grouped[storeId].length > 1"
                @click.stop="next(storeId)"
                class="absolute right-1 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm p-1.5 rounded-full hover:bg-white"
              >
                <svg
                  class="h-5 w-5 text-gray-600"
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

              <!-- ANIM ADD TO CART -->
              <div
                v-if="lastAdded === currentProduct(storeId)?.product_id"
                class="absolute inset-0 flex items-center justify-center bg-white/60"
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

            <!-- INFOS PRODUIT -->
            <div class="p-4 space-y-2">
              <div class="flex items-center gap-2">
                <img
                  :src="currentProduct(storeId)?.store_image_url"
                  class="h-6 w-6 rounded-full border border-gray-200"
                  alt="logo"
                />
                <span class="text-xs font-medium text-gray-500">
                  {{ currentProduct(storeId)?.store_name }}
                </span>
                <span
                  v-if="grouped[storeId].length > 1"
                  class="ml-auto text-[15px] text-gray-400"
                  >{{ indices[storeId] + 1 }}/{{
                    grouped[storeId].length
                  }} Produits</span
                >
              </div>

              <h3
                class="text-sm font-semibold text-gray-900 leading-tight line-clamp-2"
              >
                {{ currentProduct(storeId)?.brand }}
              </h3>
              <p class="text-xs text-gray-500 line-clamp-2">
                {{ currentProduct(storeId)?.product_name }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                {{ currentProduct(storeId)?.product_name }}
              </p>

              <div class="flex items-end justify-between pt-2">
                <div>
                  <div class="text-lg font-bold text-gray-900">
                    {{ currentProduct(storeId)?.price_un }} $
                  </div>
                  <div class="text-xs text-gray-400">
                    {{ currentProduct(storeId)?.price ? currentProduct(storeId)?.price+"$/"+currentProduct(storeId)?.price_unit : "" }}
                     
                  </div>
                </div>

                <button
                  @click="handleAddToCart(currentProduct(storeId))"
                  class="flex items-center justify-center h-10 w-10 rounded-full bg-black hover:bg-gray-900 text-white transition-all duration-200 hover:scale-110"
                >
                  +
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
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </article>
        </div>
      </template>
    </main>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
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
</style>
