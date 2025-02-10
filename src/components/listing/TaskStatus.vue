<script setup>
import { useI18n } from "vue-i18n";
import { useListingStore } from "@/stores/useListingStore";
import { ref } from "vue";

const listingStore = useListingStore();
const showConfirmDialog = ref(false);

const { t } = useI18n();

const props = defineProps({
  t: {
    type: Function,
    required: true,
  },
});

const confirmDelete = () => {
  showConfirmDialog.value = true;
};

const handleConfirm = () => {
  listingStore.clearExpiredTask();
  showConfirmDialog.value = false;
};
</script>

<template>
  <div>
    <!-- Single root element wrapper -->
    <!-- Mobile version -->
    <div
      v-if="listingStore.task"
      :class="{
        'bg-black': listingStore.task.status === 'pending',
        'bg-black': listingStore.task.status === 'processing',
        'bg-black cursor-pointer': listingStore.task.status === 'completed',
        'bg-black': listingStore.task.status === 'failed',
      }"
      class="fixed bottom-4 right-4 z-30 bg-black text-white px-8 py-8 rounded-lg shadow-xl transition-all duration-300 hover:shadow-2xl sm:hidden"
    >
      <button
        v-if="
          listingStore.task.status === 'completed' ||
          listingStore.task.status === 'failed'
        "
        @click="confirmDelete"
        class="absolute top-2 right-2 text-white/50 hover:text-white transition-colors"
      >
        &times;
      </button>
      <div class="flex items-center space-x-3">
        <!-- Animation selon le statut -->
        <template v-if="listingStore.task.status === 'pending'">
          <div class="flex space-x-1.5">
            <span
              class="w-2 h-2 bg-white rounded-full animate-pulse-dot delay-100"
            ></span>
            <span
              class="w-2 h-2 bg-white rounded-full animate-pulse-dot delay-200"
            ></span>
            <span
              class="w-2 h-2 bg-white rounded-full animate-pulse-dot delay-300"
            ></span>
          </div>
        </template>

        <template v-else-if="listingStore.task.status === 'processing'">
          <div class="flex space-x-1.5">
            <span class="w-3 h-3 bg-white rounded-full animate-bounce"></span>
          </div>
        </template>

        <template v-else-if="listingStore.task.status === 'completed'">
          <svg
            class="w-5 h-5 animate-checkmark"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </template>

        <template v-else-if="listingStore.task.status === 'failed'">
          <div class="relative w-5 h-5 animate-shake">
            <span
              class="absolute top-1/2 left-1/2 w-3/4 h-0.5 bg-white transform -translate-x-1/2 -translate-y-1/2 rotate-45"
            ></span>
            <span
              class="absolute top-1/2 left-1/2 w-3/4 h-0.5 bg-white transform -translate-x-1/2 -translate-y-1/2 -rotate-45"
            ></span>
          </div>
        </template>

        <span class="text-sm font-medium uppercase tracking-wide">
          {{ t(`Listing.task_status.${listingStore.task.status}`) }}
        </span>
      </div>
    </div>

    <!-- Desktop version -->
    <div
      v-if="listingStore.task"
      :class="{
        'bg-black': listingStore.task.status === 'pending',
        'bg-blue-600': listingStore.task.status === 'processing',
        'bg-green-600': listingStore.task.status === 'completed',
        'bg-red-600': listingStore.task.status === 'failed',
      }"
      class="fixed top-16 right-6 z-30 bg-black text-white px-8 py-8 rounded-lg shadow-xl transition-all duration-300 hover:shadow-2xl hidden sm:flex"
    >
      <button
        v-if="
          listingStore.task.status === 'completed' ||
          listingStore.task.status === 'failed'
        "
        @click="confirmDelete"
        class="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <svg
          class="w-4 h-4 text-white/50 hover:text-white"
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
      <div class="flex items-center space-x-3">
        <!-- Animation selon le statut -->
        <span v-if="listingStore.task.status === 'pending'">
          <div class="flex space-x-1.5">
            <span
              class="w-2 h-2 bg-white rounded-full animate-pulse-dot delay-100"
            ></span>
            <span
              class="w-2 h-2 bg-white rounded-full animate-pulse-dot delay-200"
            ></span>
            <span
              class="w-2 h-2 bg-white rounded-full animate-pulse-dot delay-300"
            ></span>
          </div>
        </span>

        <span v-else-if="listingStore.task.status === 'processing'">
          <div class="flex space-x-1.5">
            <span class="w-3 h-3 bg-white rounded-full animate-bounce"></span>
          </div>
        </span>

        <span v-else-if="listingStore.task.status === 'completed'">
          <svg
            class="w-5 h-5 animate-checkmark"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>

        <span v-else-if="listingStore.task.status === 'failed'">
          <div class="relative w-5 h-5 animate-shake">
            <span
              class="absolute top-1/2 left-1/2 w-3/4 h-0.5 bg-white transform -translate-x-1/2 -translate-y-1/2 rotate-45"
            ></span>
            <span
              class="absolute top-1/2 left-1/2 w-3/4 h-0.5 bg-white transform -translate-x-1/2 -translate-y-1/2 -rotate-45"
            ></span>
          </div>
        </span>

        <span class="text-sm font-medium uppercase tracking-wide">
          {{ t(`Listing.task_status.${listingStore.task.status}`) }}
        </span>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <teleport to="body">
      <div
        v-if="showConfirmDialog"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
          <h3 class="text-lg font-medium mb-4">
            {{ $t("Listing.confirm_delete_title") }}
          </h3>
          <p class="text-gray-600 mb-6">
            {{ $t("Listing.confirm_delete_message") }}
          </p>
          <div class="flex justify-end space-x-3">
            <button
              @click="showConfirmDialog = false"
              class="px-4 py-2 text-gray-600 hover:text-black transition-colors"
            >
              {{ $t("General.cancel") }}
            </button>
            <button
              @click="handleConfirm"
              class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              {{ $t("General.confirm") }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes checkmark {
  from {
    stroke-dashoffset: 20;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-3px);
  }
  75% {
    transform: translateX(3px);
  }
}

.animate-pulse-dot {
  animation: pulse-dot 1.5s infinite;
}

.delay-100 {
  animation-delay: 0.1s;
}
.delay-200 {
  animation-delay: 0.2s;
}
.delay-300 {
  animation-delay: 0.3s;
}

.animate-bounce {
  animation: bounce 0.6s infinite;
}

.animate-checkmark {
  animation: checkmark 0.5s ease-out forwards;
}

.animate-shake {
  animation: shake 0.4s ease-in-out infinite;
}
</style>
