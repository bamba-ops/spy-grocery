<script setup>
import HeroSection from "@/components/landing/HeroSection.vue";
import ProblemAgitation from "@/components/landing/ProblemAgitation.vue";
import DemoVideoSection from "@/components/landing/DemoVideoSection.vue";
import SocialProofSection from "@/components/landing/SocialProofSection.vue";
import TaskStatusIndicator from "@/components/TaskStatusIndicator.vue";
import Price from "./Price.vue";
import { useGlobalStore } from "@/stores/globalStore";
import { useRouter } from "vue-router";

const store = useGlobalStore();
const router = useRouter();
</script>

<template>
  <TaskStatusIndicator :task="store.task" />
  <HeroSection :store="store" />
  <ProblemAgitation :router="router" />
  <!-- <DemoVideoSection />-->
  <SocialProofSection />
  <Price />
</template>

<style scoped></style>
