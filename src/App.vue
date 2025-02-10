<script setup>
import Header from "@/components/layout/Header.vue";
import Footer from "@/components/layout/Footer.vue";
import AuthIconFloating from "./components/auth/AuthIconFloating.vue";
import { useI18n } from "vue-i18n";
import { onMounted } from "vue";
import { useAuthStore } from "./stores/useAuthStore";
import { useRoute } from "vue-router";

const authStore = useAuthStore();
const { t } = useI18n();
const route = useRoute();

onMounted(async () => {
  await authStore.initUserSession();
});
</script>

<template>
  <div class="bg-white min-h-screen flex flex-col">
    <Header :session="authStore.session" />

    <main class="flex-1">
      <router-view :t="t" :session="authStore.session" />
    </main>
    <AuthIconFloating v-if="route.name !== 'Auth'" />
    <Footer />
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

body {
  font-family: "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  scroll-behavior: smooth;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
