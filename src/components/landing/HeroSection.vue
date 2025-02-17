<script setup>
import { useLandingStore } from "@/stores/useLandingStore";
import { useRouter } from "vue-router";
import HeroLoading from "./HeroLoading.vue";

const landingStore = useLandingStore();
const router = useRouter();

defineProps({
  t: {
    type: Function,
    required: true,
  },
});

function handleNavToListing() {
  router.push("/listing");
}
</script>

<template>
  <section class="relative bg-black min-h-screen">
    <!-- Background image avec overlay -->
    <div class="absolute inset-0 bg-black/50"></div>

    <div class="relative h-full flex items-center">
      <div class="container mx-auto px-4 py-16">
        <!-- Contenu principal -->
        <div class="max-w-2xl mb-8 md:mb-12">
          <h1
            class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight"
          >
            {{ t("HeroSection.title") }}
          </h1>

          <p class="text-base sm:text-lg md:text-xl text-gray-200 mb-6 md:mb-8">
            {{ t("HeroSection.subtitle") }}
          </p>
        </div>

        <HeroLoading v-if="!landingStore.tasks_test.length" />

        <!-- Zone de test de comparaison (style Uber) -->
        <div
          v-if="landingStore.tasks_test.length"
          class="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-8 max-w-3xl mx-2 sm:mx-0"
        >
          <h3
            class="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4"
          >
            {{ t("HeroSection.demo_section.title") }}
          </h3>

          <div>
            <div class="grid grid-cols-1 gap-3 md:gap-4 mb-4 md:mb-6">
              <button
                v-for="task in landingStore.tasks_test"
                :key="task.target_product.product.id"
                @click="landingStore.selectProduct(task)"
                class="p-3 md:p-4 border-2 border-gray-200 rounded-lg md:rounded-xl hover:border-blue-500 transition-all duration-300 group text-left"
              >
                <div class="flex items-center space-x-2 md:space-x-3">
                  <div
                    class="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-md md:rounded-lg flex items-center justify-center overflow-hidden"
                  >
                    <img
                      v-if="task.target_product.product.image_url"
                      :src="task.target_product.product.image_url"
                      class="w-full h-full object-cover"
                      :alt="task.target_product.product.name"
                    />
                    <span v-else class="text-blue-600 text-lg md:text-xl"
                      >🛒</span
                    >
                  </div>
                  <div>
                    <h4
                      class="text-base md:text-lg font-medium text-gray-900 group-hover:text-blue-600"
                    >
                      {{ task.target_product.product.name_raw }}
                    </h4>
                    <p>
                      {{ task.target_product.product.brand || "" }}
                    </p>
                    <p class="text-sm text-green-600 font-medium mt-1">
                      ${{ task.target_product.price_un }}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div
              class="flex items-center space-x-2 md:space-x-4 text-xs md:text-sm text-gray-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 md:h-5 md:w-5 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
              <p class="leading-tight">
                {{ t("HeroSection.demo_section.info_message") }}
              </p>
            </div>
          </div>
        </div>

        <!-- Nouveau bouton avec meilleur espacement -->
        <div class="mt-10 md:mt-14 text-center">
          <p class="text-gray-300 text-sm md:text-base mb-3">
            {{ t("HeroSection.custom_search.prompt") }}
          </p>
          <button
            @click="handleNavToListing()"
            class="bg-white/90 hover:bg-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2 group border border-gray-200 mx-auto"
          >
            <span
              class="text-gray-800 group-hover:text-blue-600 font-medium text-sm md:text-base"
            >
              {{ t("HeroSection.custom_search.button") }}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-blue-600 group-hover:translate-y-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
