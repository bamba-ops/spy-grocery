<script setup>
import { useCompareStore } from "@/stores/useCompareStore";
import { useRouter } from "vue-router";

const compareStore = useCompareStore();
const router = useRouter();
defineProps({
  t: {
    type: Function,
    required: true,
  },
  session: {
    required: true,
  },
});

function handleNavToAuth() {
  router.push("/auth");
}

function handleImageError(event) {
  event.target.src = compareStore.IMAGE_URL_ERROR;
}
</script>
<template>
  <div v-if="compareStore.otherDeals && compareStore.otherDeals.length">
    <h3 class="text-xl md:text-2xl font-bold mb-4 md:mb-8">
      {{ t("Cheapest.other_options") }}
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <!-- Dynamic Other Deals -->
      <div
        v-for="deal in compareStore.otherDeals"
        :key="deal.id"
        class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
      >
        <div class="flex items-center p-3 md:block md:p-6">
          <div class="w-1/3 md:w-2/3 mx-auto">
            <div class="aspect-square relative overflow-hidden">
              <img
                :src="deal.product.image_url"
                @error="handleImageError"
                alt="Product Image"
                class="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          <div class="flex-1 pl-3 md:pl-0">
            <h4 class="font-bold text-sm md:text-lg mb-1 md:mb-2">
              {{ deal.product.name }}
            </h4>
            <p class="text-gray-600 text-xs md:text-sm mb-2 md:mb-4">
              {{ deal.product.brand }}
              <span hidden> • {{ deal.product.unit }}</span>
            </p>

            <div class="flex justify-between items-end mb-2 md:mb-4">
              <div>
                <p class="text-lg md:text-2xl font-bold">
                  <span v-if="deal.is_promo"> {{ deal.quantity }} / </span>${{
                    deal.price_un
                  }}
                </p>
                <p class="text-gray-600 text-xs md:text-sm">
                  ${{ deal.price }} / {{ deal.unit }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 md:gap-3">
              <img
                :src="deal.store.image_url"
                @error="handleImageError"
                alt="Store Logo"
                class="w-6 h-6 md:w-8 md:h-8 rounded-full border border-gray-200"
              />
              <p class="text-xs md:text-sm text-gray-600">
                {{ deal.store.name }}
              </p>
            </div>

            <button
              v-if="deal.store.id !== compareStore.TARGET_STORE_ID"
              @click="compareStore.openModal(deal)"
              class="w-full mt-2 md:mt-4 border border-black text-black py-1.5 md:py-2 rounded-full text-sm hover:bg-black hover:text-white transition-colors duration-300"
            >
              {{ t("Cheapest.wrong_item") }}
            </button>
          </div>
        </div>
      </div>

      <template v-if="!session">
        <!-- Only for no auth client -->
        <!-- Static Promotional Deals -->
        <div
          class="bg-gray-50 rounded-xl shadow-md overflow-hidden relative border-2 border-dashed border-gray-200"
        >
          <div class="absolute inset-0 bg-white/30 backdrop-blur-sm z-10"></div>

          <div class="relative z-20 p-6 text-center">
            <div class="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-12 w-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <h4 class="font-bold text-lg mb-2 text-gray-700">
              {{ t("Cheapest.promo.unlock") }}
            </h4>

            <p class="text-sm text-gray-500 mb-4">
              {{ t("Cheapest.promo.more_stores") }}
            </p>

            <button
              @click="handleNavToAuth()"
              class="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2.5 rounded-full text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm relative z-20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {{ t("Cheapest.promo.sign_up") }}
            </button>
          </div>
        </div>

        <!-- Duplicate for second promo -->
      </template>
    </div>
  </div>
</template>
