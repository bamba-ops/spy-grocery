<script setup>
import { useListingStore } from "@/stores/useListingStore";

const listingStore = useListingStore();

function handleImageError(event) {
  event.target.src = listingStore.IMAGE_URL_ERROR;
}
</script>
<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    <div
      v-for="price in listingStore.prices"
      :key="price.product_id"
      class="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
      @click="listingStore.setTaskByProductId(price.product.id, price.product)"
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
</template>

<style scoped></style>
