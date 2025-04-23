<script setup>
import HeroSection from "@/components/landing/HeroSection.vue";
import ProblemAgitation from "@/components/landing/ProblemAgitation.vue";
import SocialProofSection from "@/components/landing/SocialProofSection.vue";
import { onMounted } from "vue";

onMounted(async () => {
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
  </div>
</template>

<style scoped></style>
