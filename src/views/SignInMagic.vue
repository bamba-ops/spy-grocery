<template>
  <div class="min-h-screen bg-white flex items-center justify-center px-4">
    <div class="w-full max-w-xs">
      <!-- Formulaire minimaliste -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <input
          id="email"
          type="email"
          v-model="email"
          required
          placeholder="Adresse email"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="submit"
          class="w-full py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition"
        >
          Envoyer le Magic Link
        </button>
      </form>
      <!-- Feedback utilisateur -->
      <div v-if="message" class="mt-4 text-sm text-center text-green-600">
        {{ message }}
      </div>
      <div v-if="error" class="mt-4 text-sm text-center text-red-600">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { supabase } from "@/api/supabase.js";
import { useGlobalStore } from "@/stores/globalStore";
import { useRouter } from "vue-router";

const store = useGlobalStore();
const email = ref("");
const message = ref("");
const error = ref("");
const router = useRouter();

async function handleSubmit() {
  message.value = "";
  error.value = "";
  try {
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: { emailRedirectTo: window.location.origin },
    });
    if (signInError) {
      error.value = signInError.message;
    } else {
      message.value = "Un lien magique a été envoyé !";
    }
  } catch (err) {
    error.value = "Une erreur s'est produite. Veuillez réessayer.";
  }
}
</script>

<style scoped>
/* La responsivité et le style minimaliste reposent sur Tailwind CSS */
</style>
