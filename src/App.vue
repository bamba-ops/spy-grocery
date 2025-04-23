<script setup>
import Header from "@/components/layout/Header.vue";
import Footer from "@/components/layout/Footer.vue";
import NavBar from "@/components/layout/NavBar.vue";
import { useI18n } from "vue-i18n";
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "@/api/supabase";

const { t } = useI18n();
const route = useRoute();
const session = ref(null)

// On garde la référence pour pouvoir se désabonner
let authSubscription = null;

onMounted(async () => {
  const { data: { session: initial } } = await supabase.auth.getSession()
  session.value = initial

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
      const { id: user_id, email } = session.user;
      supabase
        .from("client")
        .upsert({ user_id, email }, { onConflict: "user_id" })
        .then(({ error }) => {
          if (error) console.error("Erreur création client :", error);
        });
    }
  });
  authSubscription = data.subscription;
});

onUnmounted(() => {
  authSubscription?.unsubscribe();
});
</script>

<template>
  <div class="bg-white min-h-screen flex flex-col">
    <Header />

    <main class="flex-1">
      <router-view :t="t" :session="session" />
    </main>

    <!-- NavBar (bas en mobile, gauche desktop) -->
    <NavBar v-if="route.name !== 'Landing'" />

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
