<script setup>
import { watch, onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/stores/globalStore";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const store = useGlobalStore();

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const removeTaskTimeout = ref(null);

function handleCompletedClick() {
  store.initCheapest();
  router.push("/cheapest");
}

const taskStatusHandlers = {
  completed: () => {
    setTimeout(() => {
      handleCompletedClick();
    }, 3000);
  },
  failed: () => {
    if (!removeTaskTimeout.value) {
      removeTaskTimeout.value = setTimeout(() => {
        store.removeTask();
        removeTaskTimeout.value = null;
      }, 5000);
    }
  },
};

watch(
  () => props.task?.status,
  (newStatus) => {
    if (newStatus && taskStatusHandlers[newStatus]) {
      taskStatusHandlers[newStatus]();
    }
  }
);

onBeforeUnmount(() => {
  if (removeTaskTimeout.value) {
    clearTimeout(removeTaskTimeout.value);
    removeTaskTimeout.value = null;
  }
});
</script>

<template>
  <!-- Version mobile - visible en dessous de 640px (sm) -->
  <div
    v-if="task"
    :class="{
      'bg-black': task.status === 'pending',
      'bg-black': task.status === 'processing',
      'bg-black cursor-pointer': task.status === 'completed',
      'bg-black': task.status === 'failed',
    }"
    class="fixed bottom-4 right-4 z-30 bg-black text-white px-8 py-8 rounded-lg shadow-xl transition-all duration-300 hover:shadow-2xl sm:hidden"
  >
    <div class="flex items-center space-x-3">
      <!-- Animation selon le statut -->
      <template v-if="task.status === 'pending'">
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

      <template v-else-if="task.status === 'processing'">
        <div class="flex space-x-1.5">
          <span class="w-3 h-3 bg-white rounded-full animate-bounce"></span>
        </div>
      </template>

      <template v-else-if="task.status === 'completed'">
        <svg class="w-5 h-5 animate-checkmark" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17L4 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </template>

      <template v-else-if="task.status === 'failed'">
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
        {{ t(`Listing.task_status.${task.status}`) }}
      </span>
    </div>
  </div>

  <!-- Version desktop - cachée en dessous de 640px -->
  <div
    v-if="task"
    :class="{
      'bg-black': task.status === 'pending',
      'bg-blue-600': task.status === 'processing',
      'bg-green-600': task.status === 'completed',
      'bg-red-600': task.status === 'failed',
    }"
    class="fixed top-16 right-6 z-30 bg-black text-white px-8 py-8 rounded-lg shadow-xl transition-all duration-300 hover:shadow-2xl hidden sm:flex"
  >
    <div class="flex items-center space-x-3">
      <!-- Animation selon le statut -->
      <template v-if="task.status === 'pending'">
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

      <template v-else-if="task.status === 'processing'">
        <div class="flex space-x-1.5">
          <span class="w-3 h-3 bg-white rounded-full animate-bounce"></span>
        </div>
      </template>

      <template v-else-if="task.status === 'completed'">
        <svg class="w-5 h-5 animate-checkmark" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17L4 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </template>

      <template v-else-if="task.status === 'failed'">
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
        {{ t(`Listing.task_status.${task.status}`) }}
      </span>
    </div>
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
