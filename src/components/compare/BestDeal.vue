<script setup>
import { useCompareStore } from "@/stores/useCompareStore";

const compareStore = useCompareStore();
defineProps({
  t: {
    type: Function,
    required: true,
  },
});

function handleImageError(event) {
  event.target.src = compareStore.IMAGE_URL_ERROR;
}
</script>

<template>
  <div
    v-if="compareStore.bestDeal"
    class="mb-8 md:mb-16 transform transition-all duration-500 hover:scale-[1.02]"
  >
    <div class="relative bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- Best Deal Label -->
      <div
        class="absolute top-3 left-3 md:top-6 md:left-6 bg-black text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium z-10"
      >
        {{ t("Cheapest.best_deal") }}
      </div>

      <div class="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8 p-4 md:p-8">
        <!-- Product Image -->
        <div class="relative group">
          <div
            class="aspect-square w-full md:w-3/4 mx-auto rounded-xl overflow-hidden bg-gray-50"
          >
            <img
              :src="compareStore.bestDeal.product.image_url"
              @error="handleImageError"
              alt="Product Image"
              class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        </div>

        <!-- Product Info -->
        <div class="flex flex-col justify-center">
          <h2 class="text-lg md:text-2xl font-bold mb-1 md:mb-2">
            {{ compareStore.bestDeal.product.name }}
          </h2>
          <p class="text-gray-600 text-sm md:text-base mb-2 md:mb-4">
            {{ compareStore.bestDeal.product.brand }}
            <span hidden> • {{ compareStore.bestDeal.product.unit }} </span>
          </p>

          <!-- Price Section -->
          <div class="bg-black/5 rounded-xl p-3 md:p-6 mb-3 md:mb-6">
            <div class="flex items-baseline gap-1 md:gap-2">
              <span class="text-xl md:text-3xl font-bold">
                <span v-if="compareStore.bestDeal.is_promo">
                  {{ compareStore.bestDeal.quantity }} /
                </span>
                ${{ compareStore.bestDeal.price_un }}
              </span>
              <span
                v-if="compareStore.bestDeal.is_promo"
                class="text-green-600 font-medium text-sm md:text-base"
              >
                {{ compareStore.bestDeal.quantity }} {{ t("Cheapest.unit") }}
              </span>
            </div>
            <p class="text-gray-600 text-sm mt-1 md:mt-2">
              ${{ compareStore.bestDeal.price }} /
              {{ compareStore.bestDeal.unit }}
            </p>
          </div>

          <!-- Store Info -->
          <div class="flex items-center gap-2 md:gap-4">
            <img
              :src="compareStore.bestDeal.store.image_url"
              @error="handleImageError"
              alt="Store Logo"
              class="w-8 h-8 md:w-12 md:h-12 rounded-full border border-gray-200"
            />
            <div>
              <p class="font-medium text-sm md:text-base">
                {{ t("Cheapest.available_at") }}
              </p>
              <p class="text-gray-600 text-sm">
                {{ compareStore.bestDeal.store.name }}
              </p>
            </div>
          </div>

          <!-- Wrong Item Button -->
          <div
            v-if="
              compareStore.bestDeal.store.id !== compareStore.TARGET_STORE_ID
            "
            class="mt-3 md:mt-6"
          >
            <button
              @click="compareStore.openModal(compareStore.bestDeal)"
              class="w-full bg-black text-white py-2 md:py-3 px-4 md:px-6 rounded-full text-sm md:text-base font-medium hover:bg-gray-800 transition-colors duration-300"
            >
              {{ t("Cheapest.wrong_item") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
