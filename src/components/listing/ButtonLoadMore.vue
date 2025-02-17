<script setup>
import { useListingStore } from "@/stores/useListingStore";

const listingStore = useListingStore();

defineProps({
  t: {
    type: Function,
    required: true,
  },
});
</script>

<template>
  <div class="flex justify-center mt-10">
    <button
      @click="listingStore.handleLoadingMorePrices()"
      class="bg-black text-white hover:bg-gray-800 py-3 px-8 rounded-full transition-all duration-300 text-base md:text-lg font-medium shadow-md hover:shadow-lg"
    >
      {{ t("Listing.load_more") }}
    </button>
  </div>
</template>
