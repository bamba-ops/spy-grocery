<script setup>
import HeroSection from "@/components/landing/HeroSection.vue";
import ProblemAgitation from "@/components/landing/ProblemAgitation.vue";
import SocialProofSection from "@/components/landing/SocialProofSection.vue";
import Price from "@/components/landing/Price.vue";
import { useRouter } from "vue-router";
import { onMounted } from "vue";
import { useLandingStore } from "@/stores/useLandingStore";

const landingStore = useLandingStore();

onMounted(async () => {
  await landingStore.getTaskByIsTest();
});

defineProps({
  t: {
    type: Function,
    required: true,
  },
});
</script>

<template>
  <div>
    <HeroSection :t="t" />
    <ProblemAgitation :t="t" />
    <SocialProofSection :t="t" />
    <Price :t="t" />
  </div>
</template>

<style scoped></style>
