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
  <transition name="modal">
    <div
      v-if="compareStore.showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
    >
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        @click="compareStore.closeModal()"
      ></div>

      <div
        class="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-4 md:p-6 max-h-[90vh] overflow-y-auto"
      >
        <!-- Close Button -->
        <button
          @click="compareStore.closeModal()"
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
          <h3 class="text-lg font-bold mb-1">
            {{ t("Cheapest.modal.title") }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ t("Cheapest.modal.description") }}
          </p>
        </div>

        <!-- Product Comparison -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Current Product -->
          <div class="text-center p-3 bg-gray-50 rounded-lg">
            <h4 class="font-medium text-gray-600 text-sm mb-3">
              {{ t("Cheapest.modal.current_product") }}
            </h4>
            <div v-if="compareStore.modalProduct" class="space-y-3">
              <img
                :src="compareStore.modalProduct.product.image_url"
                @error="handleImageError"
                alt="Current Product"
                class="w-20 h-20 mx-auto object-contain"
              />
              <h5 class="font-bold text-sm">
                {{ compareStore.modalProduct.product.name }}
              </h5>
              <p class="text-xs text-gray-600">
                {{ compareStore.modalProduct.product.brand }}
              </p>
              <p class="text-xs text-gray-600">
                {{ compareStore.modalProduct.product.unit }}
              </p>
              <p class="font-bold text-sm">
                ${{ compareStore.modalProduct.price }} /
                {{ compareStore.modalProduct.unit }}
              </p>
            </div>
          </div>

          <!-- Action Buttons for Mobile -->
          <div class="flex justify-center gap-3 my-4 md:hidden">
            <button
              v-if="compareStore.shouldShowBackButton()"
              @click="compareStore.goToPreviousProduct()"
              class="px-4 py-2 bg-gray-200 text-black text-sm rounded-full hover:bg-gray-300 transition-colors"
            >
              {{ t("Cheapest.modal.back") }}
            </button>
            <button
              @click="compareStore.goToNextProduct()"
              :disabled="compareStore.shouldDisableNext"
              :class="{
                'bg-gray-300 cursor-not-allowed':
                  compareStore.shouldDisableNext,
                'bg-black hover:bg-gray-800': !compareStore.shouldDisableNext,
              }"
              class="px-4 py-2 text-white text-sm rounded-full transition-colors"
            >
              {{ t("Cheapest.modal.next") }}
            </button>
            <button
              @click="compareStore.confirmAsBest()"
              class="px-4 py-2 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors"
            >
              {{ t("Cheapest.modal.confirm") }}
            </button>
          </div>

          <!-- Reference Product -->
          <div class="text-center p-3 bg-gray-50 rounded-lg">
            <h4 class="font-medium text-gray-600 text-sm mb-3">
              {{ t("Cheapest.modal.reference_product") }}
            </h4>
            <div v-if="compareStore.targetProduct" class="space-y-3">
              <img
                :src="compareStore.targetProduct.product.image_url"
                @error="handleImageError"
                alt="Reference Product"
                class="w-20 h-20 mx-auto object-contain"
              />
              <h5 class="font-bold text-sm">
                {{ compareStore.targetProduct.product.name }}
              </h5>
              <p class="text-xs text-gray-600">
                {{ compareStore.targetProduct.product.brand }}
              </p>
              <p class="text-xs text-gray-600">
                {{ compareStore.targetProduct.product.unit }}
              </p>
              <p class="font-bold text-sm">
                ${{ compareStore.targetProduct.price }} /
                {{ compareStore.targetProduct.unit }}
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons for Desktop -->
        <div class="hidden md:flex justify-center gap-3 mt-6">
          <button
            v-if="compareStore.shouldShowBackButton()"
            @click="compareStore.goToPreviousProduct()"
            class="px-4 py-2 bg-gray-200 text-black text-sm rounded-full hover:bg-gray-300 transition-colors"
          >
            &larr; {{ t("Cheapest.modal.back") }}
          </button>
          <button
            @click="compareStore.goToNextProduct()"
            :disabled="compareStore.shouldDisableNext"
            :class="{
              'bg-gray-300 cursor-not-allowed': compareStore.shouldDisableNext,
              'bg-black hover:bg-gray-800': !compareStore.shouldDisableNext,
            }"
            class="px-4 py-2 text-white text-sm rounded-full transition-colors"
          >
            {{ t("Cheapest.modal.next") }} &rarr;
          </button>
          <button
            @click="compareStore.confirmAsBest()"
            class="px-4 py-2 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors"
          >
            ✓ {{ t("Cheapest.modal.confirm") }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>
