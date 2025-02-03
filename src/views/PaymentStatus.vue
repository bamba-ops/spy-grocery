<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center">
      <!-- État de chargement -->
      <div v-if="loading" class="space-y-4">
        <div
          class="animate-spin mx-auto w-12 h-12 border-4 border-black border-t-transparent rounded-full"
        ></div>
        <p class="text-gray-600">Vérification du paiement en cours...</p>
      </div>

      <!-- État d'erreur -->
      <div v-else-if="status === 'error'">
        <div class="mb-6">
          <div
            class="mx-auto flex items-center justify-center h-16 w-16 bg-red-100 rounded-full"
          >
            <svg
              class="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-4">
          Erreur de vérification
        </h1>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <router-link
          to="/"
          class="inline-block w-full py-3 px-6 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Contacter le support
        </router-link>
      </div>

      <!-- Succès -->
      <div v-else-if="status === 'success'">
        <div class="mb-6">
          <div
            class="mx-auto flex items-center justify-center h-16 w-16 bg-green-100 rounded-full"
          >
            <svg
              class="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          🎉 Abonnement activé !
        </h1>
        <p class="text-gray-600 mb-8">
          Merci pour votre confiance. Vous avez maintenant accès à toutes les
          fonctionnalités Premium.
        </p>

        <router-link
          to="/listing"
          class="inline-block w-full py-3 px-6 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Commencer à explorer
        </router-link>
      </div>

      <!-- Annulation -->
      <div v-else-if="status === 'cancel'">
        <div class="mb-6">
          <div
            class="mx-auto flex items-center justify-center h-16 w-16 bg-red-100 rounded-full"
          >
            <svg
              class="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Paiement interrompu
        </h1>
        <p class="text-gray-600 mb-8">
          Le processus de paiement a été annulé. Aucun montant n'a été débité.
        </p>

        <router-link
          to="/price"
          class="inline-block w-full py-3 px-6 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Réessayer
        </router-link>
      </div>

      <!-- État inconnu -->
      <div v-else>
        <div class="mb-6">
          <div
            class="mx-auto flex items-center justify-center h-16 w-16 bg-yellow-100 rounded-full"
          >
            <svg
              class="h-8 w-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-4">État inconnu</h1>
        <p class="text-gray-600 mb-8">
          Nous n'avons pas pu déterminer le statut de votre transaction.
        </p>

        <router-link
          to="/price"
          class="inline-block w-full py-3 px-6 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Retour aux offres
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import { supabase } from "@/api/supabase"; // Adaptez le chemin selon votre structure
import { useGlobalStore } from "@/stores/globalStore";

const store = useGlobalStore();
const route = useRoute();
const status = ref("success");
const sessionId = ref(route.query.session_id);
const loading = ref(true);
const error = ref(null);

async function verifyPaymentSession() {
  try {
    if (!sessionId.value) {
      throw new Error("Session ID manquant");
    }

    // Vérification côté serveur de la session Stripe
    const { data, error: supabaseError } = await supabase
      .from("user_limit")
      .update({ is_prenium: true })
      .eq("user_id", store.session.user.id)
      .single();

    if (supabaseError) throw supabaseError;
  } catch (err) {
    error.value = err.message;
    status.value = "error";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (sessionId.value) {
    verifyPaymentSession();
  } else {
    loading.value = false;
  }
});
</script>
