<script setup>
import { onMounted } from "vue";
import Error from "@/components/Error.vue";
import { useI18n } from "vue-i18n";
import Header from "@/components/compare/Header.vue";
import BestDeal from "@/components/compare/BestDeal.vue";
import OtherDeal from "@/components/compare/OtherDeal.vue";
import HomeButton from "@/components/compare/HomeButton.vue";
import VerificationModal from "@/components/compare/VerificationModal.vue";
import { useCompareStore } from "@/stores/useCompareStore";

const compareStore = useCompareStore();
const { t } = useI18n();

const props = defineProps({
  session: {
    required: true,
  },
});

onMounted(() => {
  compareStore.getBestPrice();
});
</script>

<template>
  <div
    v-if="!compareStore.isError"
    class="min-h-screen bg-white text-gray-900 px-4 py-8 md:px-6 md:py-12"
  >
    <div class="max-w-7xl mx-auto animate-fade-in">
      <!-- Header section -->
      <Header :t="t" />

      <!-- Best Deal Section -->
      <BestDeal :t="t" />

      <!-- Other Deals Section -->
      <OtherDeal :session="session" :t="t" />

      <!-- Home Button -->
      <HomeButton :t="t" />
    </div>

    <!-- Verification Modal -->
    <VerificationModal :t="t" />
  </div>
  <Error v-else />
</template>

<style scoped>
.animate-bounce-slow {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
