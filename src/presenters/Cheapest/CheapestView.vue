<script setup>
import { reactive, onMounted } from "vue";
import Error from "@/components/Error.vue";
import { mainModel } from "@/models/MainModel";

const TARGET_STORE_ID = "32d6dd89-4216-4588-a096-631bfaf5df56";
const _mainModel = mainModel();

const state = reactive({
  loading: false,
  error: null,
  targetProduct: null,
  bestMatch: [],
  bestDeal: null,
  otherDeals: [],
  showModal: false,
  modalProduct: null,
});

function openModal(product) {
  console.log("Ouverture du modal pour le produit :", product);
  state.modalProduct = product;
  state.showModal = true;
}

function closeModal() {
  console.log("Fermeture du modal");
  state.showModal = false;
  state.modalProduct = null;
}

function handleImageError(event) {
  console.log("Erreur de chargement de l'image, remplacement par défaut.");
  event.target.src =
    "https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg";
}

function handleIsBestPrice() {
  console.log("Calcul du meilleur prix...");
  const allDeals = [state.targetProduct];
  state.bestMatch.forEach((subArray) => {
    if (subArray[0] !== undefined) allDeals.push(subArray[0]);
  });

  allDeals.sort((a, b) => a.price - b.price);
  state.bestDeal = allDeals[0];
  state.otherDeals = allDeals.slice(1);
  console.log("Meilleur deal sélectionné :", state.bestDeal);
  console.log("Autres deals :", state.otherDeals);
}

function removeFirstProduct(id) {
  console.log("Suppression du premier produit pour l'ID :", id);
  const targetArray = state.bestMatch.find((subArray) =>
    subArray.some((obj) => obj.id === id)
  );

  if (targetArray) {
    targetArray.shift();
    handleIsBestPrice();
    if (targetArray.length == 0) {
      closeModal();
    } else {
      state.modalProduct = targetArray[0] || null;
      console.log("Produit suivant dans le modal :", state.modalProduct);
    }
  } else {
    closeModal();
    console.log("Aucun sous-tableau trouvé pour l'ID :", id);
  }
}

function handleBestPrice() {
  console.log("Chargement des prix...");
  state.loading = true;
  state.error = null;
  try {
    state.targetProduct = _mainModel.targetProduct;
    state.bestMatch = _mainModel.bestMatch;

    if (!state.targetProduct || !state.bestMatch) {
      state.error = "Failed to load the best price. Please try again.";
      console.error(state.error);
    } else {
      handleIsBestPrice();
      console.log("Données de prix chargées avec succès.");
    }
  } catch (e) {
    console.error("Erreur lors du chargement du meilleur prix :", e);
    state.error = "Failed to load the best price. Please try again.";
  } finally {
    state.loading = false;
  }
}

onMounted(() => {
  console.log("Composant monté, initialisation...");
  handleBestPrice();
});
</script>

<template>
  <div class="min-h-screen bg-white text-gray-900 px-4 py-8 md:px-6 md:py-12">
    <!-- Loading and Error States -->
    <LoadingResultComposant v-if="state.loading" />
    <Error v-if="state.error" />

    <div
      v-if="!state.loading && !state.error"
      class="max-w-7xl mx-auto animate-fade-in"
    >
      <!-- Header Section -->
      <div class="text-center mb-16">
        <div
          class="inline-block p-4 bg-black/5 rounded-full mb-6 animate-bounce-slow"
        >
          <span class="text-4xl">💰</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Best Price Found</h1>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">
          We've compared prices across multiple stores to find you the best
          deal.
        </p>
      </div>

      <!-- Best Deal Section -->
      <div
        v-if="state.bestDeal"
        class="mb-16 transform transition-all duration-500 hover:scale-[1.02]"
      >
        <div class="relative bg-white rounded-2xl shadow-xl overflow-hidden">
          <!-- Best Deal Label -->
          <div
            class="absolute top-6 left-6 bg-black text-white px-4 py-2 rounded-full text-sm font-medium z-10"
          >
            BEST DEAL
          </div>

          <div class="grid md:grid-cols-2 gap-8 p-8">
            <!-- Product Image -->
            <div class="relative group">
              <div
                class="aspect-square w-3/4 mx-auto rounded-xl overflow-hidden bg-gray-50"
              >
                <img
                  :src="state.bestDeal.product.image_url"
                  @error="handleImageError"
                  alt="Product Image"
                  class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>

            <!-- Product Info -->
            <div class="flex flex-col justify-center">
              <h2 class="text-2xl font-bold mb-2">
                {{ state.bestDeal.product.name }}
              </h2>
              <p class="text-gray-600 mb-4">
                {{ state.bestDeal.product.brand }}
                <span hidden> • {{ state.bestDeal.product.unit }} </span>
              </p>

              <!-- Price Section -->
              <div class="bg-black/5 rounded-xl p-6 mb-6">
                <div class="flex items-baseline gap-2">
                  <span class="text-3xl font-bold">
                    <span v-if="state.bestDeal.is_promo" class="">
                      {{ state.bestDeal.quantity }} /
                    </span>
                    ${{ state.bestDeal.price_un }}
                  </span>
                  <span
                    v-if="state.bestDeal.is_promo"
                    class="text-green-600 font-medium"
                  >
                    {{ state.bestDeal.quantity }} units
                  </span>
                </div>
                <p class="text-gray-600 mt-2">
                  ${{ state.bestDeal.price }} / {{ state.bestDeal.unit }}
                </p>
              </div>

              <!-- Store Info -->
              <div class="flex items-center gap-4">
                <img
                  :src="state.bestDeal.store.image_url"
                  @error="handleImageError"
                  alt="Store Logo"
                  class="w-12 h-12 rounded-full border border-gray-200"
                />
                <div>
                  <p class="font-medium">Available at</p>
                  <p class="text-gray-600">{{ state.bestDeal.store.name }}</p>
                </div>
              </div>

              <!-- Wrong Item Button -->
              <div
                v-if="state.bestDeal.store.id !== TARGET_STORE_ID"
                class="mt-6"
              >
                <button
                  @click="openModal(state.bestDeal)"
                  class="w-full bg-black text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800 transition-colors duration-300"
                >
                  Wrong Item?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Other Deals Section -->
      <div v-if="state.otherDeals && state.otherDeals.length">
        <h3 class="text-2xl font-bold mb-8">Other Options</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="deal in state.otherDeals"
            :key="deal.id"
            class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div
              class="aspect-[4/3] relative overflow-hidden w-2/3 mx-auto pt-4"
            >
              <img
                :src="deal.product.image_url"
                @error="handleImageError"
                alt="Product Image"
                class="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div class="p-6">
              <h4 class="font-bold text-lg mb-2">{{ deal.product.name }}</h4>
              <p class="text-gray-600 text-sm mb-4">
                {{ deal.product.brand }}
                <span hidden> • {{ deal.product.unit }}</span>
              </p>

              <div class="flex justify-between items-end mb-4">
                <div>
                  <p class="text-2xl font-bold">
                    <span v-if="deal.is_promo"> {{ deal.quantity }} / </span>${{
                      deal.price_un
                    }}
                  </p>
                  <p class="text-gray-600 text-sm">
                    ${{ deal.price }} / {{ deal.unit }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <img
                  :src="deal.store.image_url"
                  @error="handleImageError"
                  alt="Store Logo"
                  class="w-8 h-8 rounded-full border border-gray-200"
                />
                <p class="text-sm text-gray-600">{{ deal.store.name }}</p>
              </div>

              <button
                v-if="deal.store.id !== TARGET_STORE_ID"
                @click="openModal(deal)"
                class="w-full mt-4 border border-black text-black py-2 rounded-full hover:bg-black hover:text-white transition-colors duration-300"
              >
                Wrong Item?
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Home Button -->
      <div class="flex justify-center mt-16">
        <a
          href="/"
          class="inline-flex items-center justify-center w-14 h-14 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-300"
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
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        </a>
      </div>
    </div>

    <!-- Verification Modal -->
    <transition name="modal">
      <div
        v-if="state.showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
      >
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="closeModal"
        ></div>

        <div
          class="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-4 md:p-6 max-h-[90vh] overflow-y-auto"
        >
          <!-- Close Button -->
          <button
            @click="closeModal"
            class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Modal Content -->
          <div class="text-center mb-6">
            <div class="inline-block p-2 bg-black/5 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 11-9.995 9.9A10 10 0 0112 2z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-bold mb-1">Verify Product Match</h3>
            <p class="text-gray-600 text-sm">
              Please compare the products to ensure they match.
            </p>
          </div>

          <!-- Product Comparison -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Current Product -->
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <h4 class="font-medium text-gray-600 text-sm mb-3">
                Current Product
              </h4>
              <div v-if="state.modalProduct" class="space-y-3">
                <img
                  :src="state.modalProduct.product.image_url"
                  @error="handleImageError"
                  alt="Current Product"
                  class="w-20 h-20 mx-auto object-contain"
                />
                <h5 class="font-bold text-sm">
                  {{ state.modalProduct.product.name }}
                </h5>
                <p class="text-xs text-gray-600">
                  {{ state.modalProduct.product.brand }}
                </p>
                <p class="text-xs text-gray-600">
                  {{ state.modalProduct.product.unit }}
                </p>
                <p class="font-bold text-sm">
                  ${{ state.modalProduct.price }} /
                  {{ state.modalProduct.unit }}
                </p>
              </div>
            </div>

            <!-- Action Buttons for Mobile -->
            <div class="flex justify-center gap-3 my-4 md:hidden">
              <button
                @click="closeModal"
                class="px-4 py-2 bg-white border border-black text-black text-sm rounded-full hover:bg-black hover:text-white transition-colors duration-300"
              >
                It's Correct
              </button>
              <button
                @click="removeFirstProduct(state.modalProduct?.id)"
                class="px-4 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors duration-300"
              >
                Wrong Item
              </button>
            </div>

            <!-- Reference Product -->
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <h4 class="font-medium text-gray-600 text-sm mb-3">
                Reference Product
              </h4>
              <div v-if="state.targetProduct" class="space-y-3">
                <img
                  :src="state.targetProduct.product.image_url"
                  @error="handleImageError"
                  alt="Reference Product"
                  class="w-20 h-20 mx-auto object-contain"
                />
                <h5 class="font-bold text-sm">
                  {{ state.targetProduct.product.name }}
                </h5>
                <p class="text-xs text-gray-600">
                  {{ state.targetProduct.product.brand }}
                </p>
                <p class="text-xs text-gray-600">
                  {{ state.targetProduct.product.unit }}
                </p>
                <p class="font-bold text-sm">
                  ${{ state.targetProduct.price }} /
                  {{ state.targetProduct.unit }}
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons for Desktop -->
          <div class="hidden md:flex justify-center gap-3 mt-6">
            <button
              @click="closeModal"
              class="px-4 py-2 bg-white border border-black text-black text-sm rounded-full hover:bg-black hover:text-white transition-colors duration-300"
            >
              It's Correct
            </button>
            <button
              @click="removeFirstProduct(state.modalProduct?.id)"
              class="px-4 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors duration-300"
            >
              Wrong Item
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.animate-bounce-slow {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
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

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
