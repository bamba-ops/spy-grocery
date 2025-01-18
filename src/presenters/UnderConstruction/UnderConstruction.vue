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

        <!-- Access Button -->
        <div class="flex justify-center mb-8">
          <button
            @click="showPasswordModal = true"
            class="px-6 py-2.5 bg-black text-white text-sm rounded-full"
          >
            Access Beta Version
          </button>
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

        <!-- Newsletter -->
        <div class="bg-black/5 rounded-xl p-4 text-center">
          <h3 class="text-sm font-medium mb-3">Want to know when we launch?</h3>
          <div class="space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              class="w-full px-4 py-2 text-sm rounded-full border border-gray-200 focus:outline-none focus:border-black"
            />
            <button
              class="w-full px-6 py-2 text-sm bg-black text-white rounded-full"
            >
              Notify Me
            </button>
          </div>
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

const showPasswordModal = ref(false);

const handleAccessGranted = () => {
  showPasswordModal.value = false;
};
</script>
