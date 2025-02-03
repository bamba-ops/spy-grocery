<script setup>
import Header from "@/components/layout/Header.vue";
import Footer from "@/components/layout/Footer.vue";
import UserIconFloating from "./components/UserIconFloating.vue";
import { useGlobalStore } from "@/stores/globalStore";
import { onMounted } from "vue";

const store = useGlobalStore();

onMounted(async () => {
  store.initAuthListener();
  await store.initUserLimit();
});
</script>

<template>
  <div class="bg-white min-h-screen flex flex-col">
    <Header :user_limit="store.user_limit" />

    <!-- Dynamic Content -->
    <main class="flex-1">
      <router-view />
    </main>
    <UserIconFloating />
    <Footer />
  </div>
</template>

<style>
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
