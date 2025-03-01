<script setup>
import Header from "@/components/listing/Header.vue";
import SearchBar from "@/components/listing/SearchBar.vue";
import LoadingPriceList from "@/components/listing/LoadingPriceList.vue";
import Error from "@/components/Error.vue";
import ButtonLoadMore from "@/components/listing/ButtonLoadMore.vue";
import TaskStatus from "@/components/listing/TaskStatus.vue";
import LimitReachedModal from "@/components/listing/LimitReachedModal.vue";
import { useListingStore } from "@/stores/useListingStore";
import { onMounted, watch, ref, onUnmounted } from "vue";
import PriceList from "@/components/listing/PriceList.vue";
import { useRouter } from "vue-router";

const listingStore = useListingStore();
const searchTimeout = ref(null);
const router = useRouter();

// Subscribe to all mutations in the store
const unsubscribe = listingStore.$subscribe((mutation, state) => {
  if (mutation.payload && "task" in mutation.payload) {
    listingStore.setLocalStorageTask(state.task);
  }
});

defineProps({
  t: {
    type: Function,
    required: true,
  },
  session: {
    required: true,
  },
});

onMounted(async () => {
  await listingStore.getAllPrices();
  //await listingStore.getAllProductNames();
  await listingStore.initLocalStorageTask();
});

onUnmounted(() => {
  unsubscribe();
});

watch(
  () => listingStore.searchTerm,
  (newVal, oldVal) => {
    if (newVal === oldVal) return;

    listingStore.prices = [];

    // Annule le timeout existant
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value);
    }

    // Gestion du loading immédiat
    listingStore.isLoading = true;

    // Configuration du debounce
    searchTimeout.value = setTimeout(async () => {
      try {
        if (newVal.length > 2) {
          await listingStore.getPriceBySearchTerm();
        } else if (newVal.length === 0) {
          await listingStore.getAllPrices();
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        listingStore.isLoading = false;
      }
    }, 300); // Réduit le debounce à 300ms pour une meilleure réactivité
  }
);
</script>

<template>
  <main
    v-if="!listingStore.isError"
    class="min-h-screen text-black bg-white p-4 flex flex-col"
  >
    <div class="flex-1">
      <!-- Header section -->
      <Header :t="t" />
      <!-- Search bar -->
      <SearchBar :t="t" />
      <div
        v-if="!listingStore.isLoading && listingStore.prices.length === 0"
        class="flex flex-col items-center justify-center space-y-4 text-gray-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-16 h-16"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
          />
        </svg>
        <p class="text-xl font-medium text-center">
          {{ t("Listing.no_result") }}
        </p>
      </div>
      <!-- PriceList -->
      <PriceList v-if="listingStore.prices" :session="session" />
      <!-- LaodingPriceList -->
      <LoadingPriceList v-if="listingStore.isLoading" />
      <!-- ButtonLoadingMore -->
    </div>
    <ButtonLoadMore
      v-if="!listingStore.isLoading && listingStore.prices.length >= 30"
      :t="t"
    />
    <TaskStatus :t="t" />
    <LimitReachedModal :t="t" v-if="listingStore.isLimitReached" />
  </main>
  <!-- Error -->
  <Error v-else :t="t" />
</template>

<style scoped></style>
