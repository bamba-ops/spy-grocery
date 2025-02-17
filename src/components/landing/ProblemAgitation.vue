<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

defineProps({
  t: {
    type: Function,
    required: true,
  },
});

function navToListing() {
  router.push("/listing");
}
</script>

<template>
  <section class="bg-white py-20 md:py-28 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-14 md:mb-20">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {{ t("ProblemAgitation.title") }}
        </h2>
        <p class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          {{ t("ProblemAgitation.subtitle") }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        <!-- Problème 1 -->
        <div
          class="p-6 md:p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-300"
        >
          <div
            class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6"
          >
            <svg
              class="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="t('ProblemAgitation.problem1.icon')"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">
            {{ t("ProblemAgitation.problem1.title") }}
          </h3>
          <p
            class="text-gray-600 mb-4"
            v-html="
              t('ProblemAgitation.problem1.description', { percent: '9%' })
            "
          ></p>
          <div class="bg-red-50 p-4 rounded-xl">
            <p
              class="text-sm text-red-700"
              v-html="
                t('ProblemAgitation.problem1.solution', { saving: '35%' })
              "
            ></p>
          </div>
        </div>

        <!-- Problème 2 -->
        <div
          class="p-6 md:p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-300"
        >
          <div
            class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6"
          >
            <svg
              class="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="t('ProblemAgitation.problem2.icon')"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">
            {{ t("ProblemAgitation.problem2.title") }}
          </h3>
          <p
            class="text-gray-600 mb-4"
            v-html="
              t('ProblemAgitation.problem2.description', {
                products: '49',
                stores: '6',
              })
            "
          ></p>
          <div class="bg-blue-50 p-4 rounded-xl">
            <p
              class="text-sm text-blue-700"
              v-html="
                t('ProblemAgitation.problem2.solution', { economy: '65,8' })
              "
            ></p>
          </div>
        </div>

        <!-- Problème 3 -->
        <div
          class="p-6 md:p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-300"
        >
          <div
            class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6"
          >
            <svg
              class="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="t('ProblemAgitation.problem3.icon')"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">
            {{ t("ProblemAgitation.problem3.title") }}
          </h3>
          <p
            class="text-gray-600 mb-4"
            v-html="
              t('ProblemAgitation.problem3.description', {
                insecurity: '14,9%',
                people: '1M',
              })
            "
          ></p>
          <div class="bg-green-50 p-4 rounded-xl">
            <p
              class="text-sm text-green-700"
              v-html="
                t('ProblemAgitation.problem3.solution', { update: 'minutes' })
              "
            ></p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-16 md:mt-20 text-center">
        <button
          @click="navToListing"
          class="bg-black text-white px-8 py-4 rounded-full hover:from-blue-700 hover:to-blue-600 transition-all duration-300 flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl"
        >
          <span class="font-semibold text-lg">
            {{ t("ProblemAgitation.cta.text") }}
          </span>
          <svg
            class="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>
<style scoped>
/* Animations supplémentaires si nécessaire */
</style>
