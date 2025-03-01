<script setup>
import { debounce } from "lodash";
import { useListingStore } from "@/stores/useListingStore";

const listingStore = useListingStore();
defineProps({
  t: {
    type: Function,
    required: true,
  },
});

// Créez une fonction debounced
const handleSearchTermDebounced = debounce((value) => {
  listingStore.searchTerm = value;
}, 300);

const handleSearchTerm = (event) => {
  handleSearchTermDebounced(event.target.value);
};
</script>

<template>
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
        :placeholder="t('Listing.search_placeholder')"
        class="w-full bg-transparent text-base md:text-lg text-gray-800 placeholder-gray-400 focus:outline-none"
        @input="handleSearchTerm"
        :value="listingStore.searchTerm"
      />
    </div>
  </div>
</template>
