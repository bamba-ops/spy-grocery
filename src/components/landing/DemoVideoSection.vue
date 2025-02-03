<template>
  <section class="bg-gray-50 py-20 md:py-28 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="flex flex-col lg:flex-row gap-12 md:gap-16 items-center">
        <!-- Conteneur vidéo -->
        <div class="w-full lg:w-7/12">
          <div
            class="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300"
          >
            <div
              class="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center"
            >
              <!-- Placeholder vidéo -->
              <div class="text-center">
                <button
                  class="w-20 h-20 bg-white/90 hover:bg-white rounded-full flex items-center justify-center group transition-all duration-300 shadow-lg hover:scale-105"
                >
                  <svg
                    class="w-8 h-8 text-blue-600 group-hover:text-blue-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenu texte -->
        <div class="w-full lg:w-5/12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {{ t("DemoVideoSection.videoTitle") }}
          </h2>

          <p class="text-lg text-gray-600 mb-8">
            {{ t("DemoVideoSection.videoSubtitle") }}
          </p>

          <ul class="space-y-5 mb-10">
            <li class="flex items-start space-x-4">
              <div
                class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <svg
                  class="w-4 h-4 text-green-600"
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
              </div>
              <div>
                <h3 class="font-medium text-gray-900">
                  {{ t("DemoVideoSection.features.feature1.title") }}
                </h3>
                <p class="text-gray-600 text-sm">
                  {{ t("DemoVideoSection.features.feature1.description") }}
                </p>
              </div>
            </li>

            <li class="flex items-start space-x-4">
              <div
                class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <svg
                  class="w-4 h-4 text-green-600"
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
              </div>
              <div>
                <h3 class="font-medium text-gray-900">
                  {{ t("DemoVideoSection.features.feature2.title") }}
                </h3>
                <p class="text-gray-600 text-sm">
                  {{ t("DemoVideoSection.features.feature2.description") }}
                </p>
              </div>
            </li>

            <li class="flex items-start space-x-4">
              <div
                class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <svg
                  class="w-4 h-4 text-green-600"
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
              </div>
              <div>
                <h3 class="font-medium text-gray-900">
                  {{ t("DemoVideoSection.features.feature3.title") }}
                </h3>
                <p class="text-gray-600 text-sm">
                  {{ t("DemoVideoSection.features.feature3.description") }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<style scoped>
.aspect-w-16 {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.aspect-w-16 > div {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
