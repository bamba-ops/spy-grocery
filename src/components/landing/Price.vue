<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function handleFree() {
  router.push("/auth");
}

function handlePrenium() {
  window.open(import.meta.env.VITE_STRIPE_LINK, "_blank");
}

defineProps({
  t: {
    type: Function,
    required: true,
  },
});
</script>
<template>
  <section class="py-16 bg-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">
          {{ t("Pricing.title") }}
        </h2>
        <p class="text-xl text-gray-600">
          {{ t("Pricing.subtitle") }}
        </p>
      </div>

      <div
        class="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-4xl mx-auto"
      >
        <!-- Plan Gratuit -->
        <div
          class="flex-1 bg-white border-2 border-gray-100 rounded-xl p-8 hover:border-gray-300 transition-all"
        >
          <div class="mb-8">
            <h3 class="text-2xl font-semibold text-gray-900 mb-2">
              {{ t("Pricing.free.title") }}
            </h3>
            <p class="text-5xl font-bold text-gray-900 mb-4">
              {{ t("Pricing.free.price") }}$<span
                class="text-lg text-gray-500"
              ></span>
            </p>
            <div class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm">
              {{ t("Pricing.free.badge") }}
            </div>
          </div>

          <ul class="space-y-4 mb-8">
            <li class="flex items-center text-gray-700">
              <svg
                class="w-5 h-5 text-gray-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>5 {{ t("Pricing.free.features.searches") }}</span>
            </li>
            <li class="flex items-center text-gray-700">
              <svg
                class="w-5 h-5 text-gray-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>5 {{ t("Pricing.free.features.stores") }}</span>
            </li>
            <li class="flex items-center text-gray-700">
              <svg
                class="w-5 h-5 text-gray-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{{ t("Pricing.free.features.support") }}</span>
            </li>
          </ul>

          <button
            @click="handleFree()"
            class="w-full py-3 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
          >
            {{ t("Pricing.free.cta") }}
          </button>
        </div>

        <!-- Plan Premium -->
        <div
          class="flex-1 bg-gray-900 text-white rounded-xl p-8 transform hover:scale-[1.01] transition-transform"
        >
          <div class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-2xl font-semibold">
                {{ t("Pricing.premium.title") }}
              </h3>
              <span class="bg-white/10 px-3 py-1 rounded-full text-sm">{{
                t("Pricing.premium.badge")
              }}</span>
            </div>
            <p class="text-5xl font-bold mb-4">
              {{ t("Pricing.premium.price") }}$<span class="text-lg opacity-80"
                >/{{ t("Pricing.free.month") }}</span
              >
            </p>
            <div class="opacity-80 text-sm">
              {{ t("Pricing.premium.billing") }}
            </div>
          </div>

          <ul class="space-y-4 mb-8 opacity-90">
            <li class="flex items-center">
              <svg
                class="w-5 h-5 text-white/80 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{{ t("Pricing.premium.features.comparator") }}</span>
            </li>
            <li class="flex items-center">
              <svg
                class="w-5 h-5 text-white/80 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{{ t("Pricing.premium.features.all_stores") }}</span>
            </li>
            <li class="flex items-center">
              <svg
                class="w-5 h-5 text-white/80 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{{ t("Pricing.premium.features.priority_support") }}</span>
            </li>
            <li class="flex items-center">
              <svg
                class="w-5 h-5 text-white/80 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{{ t("Pricing.premium.features.early_access") }}</span>
            </li>
          </ul>

          <button
            @click="handlePrenium()"
            class="w-full py-3 px-6 bg-white hover:bg-gray-100 text-gray-900 rounded-lg font-medium transition-colors"
          >
            {{ t("Pricing.premium.cta") }}
          </button>
        </div>
      </div>

      <p class="text-center text-gray-500 mt-8 text-sm">
        {{ t("Pricing.guarantee") }}
      </p>
    </div>
  </section>
</template>
