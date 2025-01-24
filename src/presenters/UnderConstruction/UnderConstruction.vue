<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 bg-white z-10 border-b">
      <div class="px-4 py-3 flex items-center justify-between">
        <div class="flex items-center">
          <span class="text-black font-medium">Spy Grocery</span>
        </div>
        <button class="p-2">
          <span class="text-xl">≡</span>
        </button>
      </div>
    </header>

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
          We're Building Something Great
        </h1>

        <!-- Description -->
        <p class="text-sm text-gray-600 text-center mb-6">
          Our team is working hard to bring you the best grocery price
          comparison experience. Stay tuned!
        </p>

        <!-- Newsletter -->
        <div
          class="bg-black/5 rounded-xl p-6 text-center mb-8 transition-all duration-300"
        >
          <h3 class="text-base font-semibold mb-4">
            Want to know when we launch?
          </h3>
          <div class="space-y-3">
            <!-- Community -->
            <div class="text-sm text-gray-600 mb-4">
              <p class="font-medium">
                🎉 23 future savings experts have already joined us!
              </p>
              <p>Join the smart shoppers community.</p>
            </div>

            <div class="relative">
              <input
                v-model="email"
                type="email"
                placeholder="Enter your email"
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
                {{ loading ? "Subscribing..." : "Notify Me" }}
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
                <span>You're all set! We'll notify you when we launch.</span>
              </div>
            </transition>
          </div>
        </div>

        <!-- Features -->
        <div class="space-y-6 mb-8">
          <div class="bg-black/5 rounded-xl p-4 text-center">
            <div class="text-xl mb-2">💰</div>
            <h3 class="text-sm font-medium mb-1">Save Money</h3>
            <p class="text-xs text-gray-600">
              Compare prices across stores to find the best deals
            </p>
          </div>

          <div class="bg-black/5 rounded-xl p-4 text-center">
            <div class="text-xl mb-2">⚡</div>
            <h3 class="text-sm font-medium mb-1">Save Time</h3>
            <p class="text-xs text-gray-600">
              Quick and easy price comparison at your fingertips
            </p>
          </div>

          <div class="bg-black/5 rounded-xl p-4 text-center">
            <div class="text-xl mb-2">🎯</div>
            <h3 class="text-sm font-medium mb-1">Smart Shopping</h3>
            <p class="text-xs text-gray-600">
              Make informed decisions with real-time price updates
            </p>
          </div>
        </div>

        <!-- Progress -->
        <div class="mb-8">
          <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-black rounded-full w-3/4"></div>
          </div>
          <p class="text-xs text-gray-500 text-center mt-2">75% Complete</p>
        </div>

        <!-- Access Button -->
        <div class="flex justify-center mb-8">
          <button
            @click="showPasswordModal = true"
            class="px-6 py-2.5 bg-black text-white text-sm rounded-full"
          >
            Access Beta Version
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
import PasswordModal from "@/components/common/PasswordModal.vue";
import { mainModel } from "@/models/MainModel";

const showPasswordModal = ref(false);
const email = ref("");
const loading = ref(false);
const message = ref("");
const messageType = ref("");
const subscribed = ref(false);
const _mainModel = mainModel();

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
  messageType.value = "";

  // Validate email
  if (!email.value) {
    message.value = "Please enter your email address";
    messageType.value = "error";
    return;
  }

  if (!validateEmail(email.value)) {
    message.value = "Please enter a valid email address";
    messageType.value = "error";
    return;
  }

  try {
    const response = await _mainModel.subscribeToNewsletter(email.value);

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
    console.error("Newsletter subscription error:", error);

    // Handle different types of errors
    if (error.response) {
      // Server responded with an error
      if (error.response.status === 400) {
        message.value = "This email address is invalid or already subscribed.";
      } else if (error.response.status === 500) {
        message.value =
          "We're experiencing technical difficulties. Please try again later.";
      } else {
        message.value =
          error.response.data?.detail || "An error occurred. Please try again.";
      }
    } else if (error.request) {
      // Request was made but no response
      message.value =
        "Unable to reach the server. Please check your connection.";
    } else {
      // Something else went wrong
      message.value = "An unexpected error occurred. Please try again.";
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
