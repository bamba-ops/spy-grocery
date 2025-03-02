<script setup>
import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

// Récupérer la langue active via vue-i18n
const { locale } = useI18n();

// Définir dynamiquement les meta tags en fonction de la langue
const metaData = computed(() => {
  if (locale.value === "fr") {
    return {
      title: "Liste des prix d'épicerie en temps réel | Spy Grocery",
      meta: [
        {
          name: "description",
          content:
            "Découvrez et comparez en temps réel les prix des produits d'épicerie au Québec sur Spy Grocery.",
        },
        {
          name: "keywords",
          content:
            "épicerie, comparaison de prix, liste, Québec, Spy Grocery, prix, courses",
        },
        {
          property: "og:title",
          content: "Liste des prix d'épicerie en temps réel | Spy Grocery",
        },
        {
          property: "og:description",
          content:
            "Explorez notre liste détaillée des prix d'épicerie et trouvez les meilleures offres sur Spy Grocery.",
        },
        { property: "og:url", content: "https://spygrocery.com/listing" },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: "https://spygrocery.com/path-to-your-listing-image.jpg",
        },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Liste des prix d'épicerie en temps réel | Spy Grocery",
        },
        {
          name: "twitter:description",
          content:
            "Découvrez la liste des prix d'épicerie et comparez pour économiser sur vos courses au Québec.",
        },
        {
          name: "twitter:image",
          content: "https://spygrocery.com/path-to-your-listing-image.jpg",
        },
      ],
    };
  } else {
    return {
      title: "Real-Time Grocery Price Listings | Spy Grocery",
      meta: [
        {
          name: "description",
          content:
            "Explore and compare real-time grocery prices across Quebec on Spy Grocery.",
        },
        {
          name: "keywords",
          content:
            "grocery, price listing, comparison, Quebec, Spy Grocery, prices, shopping",
        },
        {
          property: "og:title",
          content: "Real-Time Grocery Price Listings | Spy Grocery",
        },
        {
          property: "og:description",
          content:
            "Check our detailed list of real-time grocery prices and find the best deals on Spy Grocery.",
        },
        { property: "og:url", content: "https://spygrocery.com/listing" },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: "https://spygrocery.com/path-to-your-listing-image.jpg",
        },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Real-Time Grocery Price Listings | Spy Grocery",
        },
        {
          name: "twitter:description",
          content:
            "Discover real-time grocery price listings and compare deals to save money on your shopping.",
        },
        {
          name: "twitter:image",
          content: "https://spygrocery.com/path-to-your-listing-image.jpg",
        },
      ],
    };
  }
});

// Appliquer dynamiquement les meta tags via Unhead
useHead(metaData.value);
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
