<template>
  <div class="min-h-screen bg-white">
    <!-- Main Content -->
    <div class="px-4 pt-16 pb-8">
      <div class="max-w-md mx-auto">
        <!-- Icon -->
        <div class="flex justify-center mb-6">
          <div
            class="w-16 h-16 bg-black rounded-full flex items-center justify-center"
          >
            <span class="text-2xl">🚧</span>
          </div>
        </div>

        <!-- Title -->
        <h1 class="text-xl font-bold text-center mb-3">
          {{ t("UnderConstruction.main.title") }}
        </h1>

        <!-- Description -->
        <p class="text-sm text-gray-600 text-center mb-6">
          {{ t("UnderConstruction.main.description") }}
        </p>

        <!-- Newsletter -->
        <div
          class="bg-black/5 rounded-xl p-6 text-center mb-8 transition-all duration-300"
        >
          <h3 class="text-base font-semibold mb-4">
            {{ t("UnderConstruction.main.newsletter.title") }}
          </h3>
          <div class="space-y-3">
            <!-- Community -->
            <div class="text-sm text-gray-600 mb-4">
              <p class="font-medium">
                {{
                  t("UnderConstruction.main.newsletter.community", {
                    count: 36,
                  })
                }}
              </p>
              <p>{{ t("UnderConstruction.main.newsletter.join") }}</p>
            </div>

            <div class="relative">
              <input
                v-model="email"
                type="email"
                :placeholder="
                  t('UnderConstruction.main.newsletter.placeholder')
                "
                :disabled="loading || subscribed"
                :class="{
                  'opacity-50 cursor-not-allowed': loading || subscribed,
                  'focus:ring-2 focus:ring-black': !loading && !subscribed,
                }"
                class="w-full px-4 py-3 text-sm rounded-lg border border-gray-200 focus:outline-none transition-all duration-300 placeholder:text-gray-400"
              />
              <div
                v-if="loading"
                class="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <div
                  class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"
                ></div>
              </div>
            </div>

            <transition name="fade">
              <button
                v-if="!subscribed"
                @click="subscribeToNewsletter"
                :disabled="loading || !email"
                :class="{
                  'opacity-50 cursor-not-allowed': loading || !email,
                  'hover:bg-gray-900 active:scale-95': !loading && email,
                }"
                class="w-full px-6 py-3 text-sm bg-black text-white rounded-lg font-medium transition-all duration-300 transform"
              >
                {{
                  loading
                    ? t("UnderConstruction.main.newsletter.loading")
                    : t("UnderConstruction.main.newsletter.button")
                }}
              </button>
            </transition>

            <transition name="fade">
              <div
                v-if="message"
                class="rounded-lg p-4 text-sm transition-all duration-300"
                :class="{
                  'bg-green-50 text-green-700': messageType === 'success',
                  'bg-red-50 text-red-700': messageType === 'error',
                }"
              >
                <div class="flex items-center justify-center space-x-2">
                  <span v-if="messageType === 'success'" class="text-lg"
                    >✓</span
                  >
                  <span v-else class="text-lg">⚠</span>
                  <span>{{ message }}</span>
                </div>
              </div>
            </transition>

            <transition name="fade">
              <div
                v-if="subscribed"
                class="bg-green-50 rounded-lg p-4 text-sm text-green-700 flex items-center justify-center space-x-2"
              >
                <span class="text-lg">✓</span>
                <span>{{
                  t("UnderConstruction.main.newsletter.success")
                }}</span>
              </div>
            </transition>
          </div>
        </div>

        <!-- Features -->
        <div class="space-y-6 mb-8">
          <div class="bg-black/5 rounded-xl p-4 text-center">
            <div class="text-xl mb-2">💰</div>
            <h3 class="text-sm font-medium mb-1">
              {{ t("UnderConstruction.main.features.save_money.title") }}
            </h3>
            <p class="text-xs text-gray-600">
              {{ t("UnderConstruction.main.features.save_money.description") }}
            </p>
          </div>

          <div class="bg-black/5 rounded-xl p-4 text-center">
            <div class="text-xl mb-2">⚡</div>
            <h3 class="text-sm font-medium mb-1">
              {{ t("UnderConstruction.main.features.save_time.title") }}
            </h3>
            <p class="text-xs text-gray-600">
              {{ t("UnderConstruction.main.features.save_time.description") }}
            </p>
          </div>

          <div class="bg-black/5 rounded-xl p-4 text-center">
            <div class="text-xl mb-2">🎯</div>
            <h3 class="text-sm font-medium mb-1">
              {{ t("UnderConstruction.main.features.smart_shopping.title") }}
            </h3>
            <p class="text-xs text-gray-600">
              {{
                t("UnderConstruction.main.features.smart_shopping.description")
              }}
            </p>
          </div>
        </div>

        <!-- Progress -->
        <div class="mb-8">
          <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-black rounded-full w-3/4"></div>
          </div>
          <p class="text-xs text-gray-500 text-center mt-2">
            {{ t("UnderConstruction.main.progress.label", { percent: 75 }) }}
          </p>
        </div>

        <!-- Access Button -->
        <div class="flex justify-center mb-8">
          <button
            @click="showPasswordModal = true"
            class="px-6 py-2.5 bg-black text-white text-sm rounded-full"
          >
            {{ t("UnderConstruction.main.beta.button") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Password Modal -->
    <PasswordModal
      :show="showPasswordModal"
      @close="showPasswordModal = false"
      @access-granted="handleAccessGranted"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import PasswordModal from "@/components/common/PasswordModal.vue";
import { useGlobalStore } from "@/stores/globalStore";

const { t } = useI18n();

const showPasswordModal = ref(false);
const email = ref("");
const loading = ref(false);
const message = ref("");
const messageType = ref("");
const subscribed = ref(false);
const store = useGlobalStore();

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const handleAccessGranted = () => {
  showPasswordModal.value = false;
};

const subscribeToNewsletter = async () => {
  // Reset previous messages
  message.value = "";

  try {
    const response = await store.subscribeToNewsletter(email.value);

    if (response?.status === "success") {
      messageType.value = "success";
      subscribed.value = true;
      email.value = "";

      // Clear success message after 5 seconds
      setTimeout(() => {
        message.value = "";
      }, 5000);
    } else {
      throw new Error("Unexpected response format");
    }
  } catch (error) {
    // Handle different types of errors
    if (error.response) {
      // Server responded with an error
      if (error.response.status === 400) {
        message.value = t("UnderConstruction.errors.already_subscribed");
      } else if (error.response.status === 500) {
        message.value = t("UnderConstruction.errors.server_error");
      } else {
        message.value =
          error.response.data?.detail ||
          t("UnderConstruction.errors.generic_error");
      }
    } else if (error.request) {
      // Request was made but no response
      message.value = t("UnderConstruction.errors.connection_error");
    } else {
      // Something else went wrong
      message.value = t("UnderConstruction.errors.generic_error");
    }
    messageType.value = "error";
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
