<template>
  <!-- Overlay with semi-transparent background -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
  >
    <!-- Modal content styled in a modern, Uber-like way -->
    <div
      class="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 max-w-md w-full mx-4"
    >
      <h2 class="text-2xl font-bold text-gray-900 mb-4">
        {{ $t("TaskWarningModal.title") }}
      </h2>
      <p class="text-gray-700 text-base sm:text-lg mb-6">
        {{ $t("TaskWarningModal.description") }}
      </p>
      <div class="flex justify-end">
        <button
          @click="closeModal"
          class="px-5 py-2 bg-blue-600 hover:bg-blue-700 transition-colors duration-300 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {{ $t("TaskWarningModal.button") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["close"]);

function closeModal() {
  emit("close");
}
</script>
