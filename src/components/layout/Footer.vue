<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const showModal = ref(false);
const formData = ref({
  name: "",
  email: "",
  problem: "",
});
const isSubmitting = ref(false);
const isError = ref(false);
const isSuccess = ref(false);

const submitProblem = async () => {
  isSubmitting.value = true;
  try {
    const webhookURL =
      "https://discord.com/api/webhooks/1341564235469291521/QhGA40Vg_USmD6hlJQbjMF4JpoDrgdPfyGKIZIdssYLPt9gjjVUM4Q6R8BeaDz_nur9i";

    const embed = {
      title: "Nouveau problème signalé",
      color: 0x0099ff,
      fields: [
        { name: "Nom", value: formData.value.name },
        { name: "Email", value: formData.value.email },
        { name: "Problème", value: formData.value.problem },
      ],
      timestamp: new Date().toISOString(),
    };

    await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    isSuccess.value = true;
    setTimeout(() => {
      showModal.value = false;
      isSuccess.value = false;
    }, 2000);
  } catch (error) {
    isError.value = true;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <footer class="bg-black text-white py-12 px-6">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 class="text-lg font-bold mb-4">{{ t("Footer.title") }}</h3>
        <p class="text-gray-400 text-sm">{{ t("Footer.description") }}</p>
      </div>
    </div>

    <!-- Bouton aligné en bas -->
    <div class="max-w-7xl mx-auto mt-8">
      <div class="relative inline-flex group">
        <div
          class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full blur-sm opacity-40 group-hover:opacity-60 transition-opacity duration-300"
        ></div>
        <button
          @click="showModal = true"
          class="relative flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm md:text-base font-semibold text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          <svg
            class="w-4 h-4 md:w-5 md:h-5 animate-wiggle"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M5.636 5.636l3.536 3.536m0 5.656l-3.536 3.536M13 12h-2"
            />
          </svg>
          <span>Support 7j/24h</span>
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800">
      <p class="text-center text-gray-400 text-sm">
        {{ t("Footer.copyright") }}<br />
      </p>
    </div>
    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div
        class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-100 dark:border-gray-800"
      >
        <button
          @click="showModal = false"
          class="absolute top-4 right-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-2 transition-colors"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h3 class="text-lg font-bold mb-6 text-gray-900 dark:text-white">
          {{ t("Footer.supportTitle") }}
        </h3>

        <form @submit.prevent="submitProblem" class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-300"
            >
              {{ t("Footer.fullName") }}
            </label>
            <input
              v-model="formData.name"
              required
              class="w-full bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-900"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-300"
            >
              {{ t("Footer.email") }}
            </label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="w-full bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-900"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-300"
            >
              {{ t("Footer.problemDescription") }}
            </label>
            <textarea
              v-model="formData.problem"
              required
              rows="4"
              class="w-full bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-900"
            ></textarea>
          </div>

          <div
            v-if="isError"
            class="text-red-500 dark:text-red-400 text-sm text-gray-900"
          >
            {{ t("Footer.submitError") }}
          </div>

          <button
            :disabled="isSubmitting"
            class="w-full bg-black dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white dark:text-gray-100 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <span v-if="!isSubmitting">{{ t("Footer.sendMessage") }}</span>
            <span v-else class="animate-pulse"
              >{{ t("Footer.sending") }}...</span
            >
          </button>

          <div
            v-if="isSuccess"
            class="text-green-500 dark:text-green-400 text-sm text-center text-gray-900"
          >
            {{ t("Footer.submitSuccess") }}
          </div>
        </form>
      </div>
    </div>
  </footer>
</template>
