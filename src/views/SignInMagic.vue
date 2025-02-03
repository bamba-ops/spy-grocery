<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-8">
      <!-- Logo -->
      <div class="text-center">
        <div
          class="mx-auto h-12 w-12 bg-black rounded-full flex items-center justify-center mb-6"
        >
          <div
            class="w-10 h-10 bg-black rounded-full flex items-center justify-center"
          >
            <span class="text-white text-xl font-bold">S</span>
          </div>
        </div>
        <h2 class="text-3xl font-bold text-gray-900">Connexion</h2>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div>
          <input
            id="email"
            type="email"
            v-model="email"
            required
            placeholder="Adresse email"
            class="w-full px-4 py-3 bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center items-center py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50"
        >
          <svg
            v-if="loading"
            class="animate-spin h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{{
            loading ? "Envoi en cours..." : "Envoyer le Magic Link"
          }}</span>
        </button>
      </form>

      <!-- Messages de feedback -->
      <div
        v-if="message"
        class="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl animate-fade-in"
      >
        {{ message }}
      </div>
      <div
        v-if="error"
        class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-fade-in"
      >
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { supabase } from "@/api/supabase.js";
import { useGlobalStore } from "@/stores/globalStore";
import { useRouter } from "vue-router";

const store = useGlobalStore();
const email = ref("");
const message = ref("");
const error = ref("");
const router = useRouter();
const loading = ref(false);

async function handleSubmit() {
  loading.value = true;
  message.value = "";
  error.value = "";

  try {
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: { emailRedirectTo: window.location.origin },
    });

    if (signInError) throw signInError;

    message.value = "Lien magique envoyé ! Vérifiez vos emails.";
    email.value = "";
  } catch (err) {
    error.value = err.message || "Erreur lors de l'envoi du lien";
  } finally {
    loading.value = false;
  }
}
</script>

<style>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
