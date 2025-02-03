<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="bg-white shadow-xl rounded-lg p-6">
        <h1
          class="text-center text-2xl md:text-3xl font-bold text-gray-800 mb-4"
        >
          Profil
        </h1>
        <button
          @click="handleSignOut"
          class="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          {{ t("Profile.button") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { computed, onMounted } from "vue";
import { useGlobalStore } from "@/stores/globalStore";
import { useI18n } from "vue-i18n";

const router = useRouter();
const store = useGlobalStore();
const { t } = useI18n();

function handleSignOut() {
  store.signOut();
  router.push("/auth");
}
</script>

<style scoped>
/* Les styles sont gérés avec Tailwind CSS pour une approche minimaliste et responsive */
</style>
