<template>
  <div class="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h1 class="text-4xl font-extrabold text-black sm:text-5xl md:text-6xl">
          Choisissez votre plan
        </h1>
        <p class="mt-4 text-xl text-gray-600">
          Optimisez votre expérience avec nos offres adaptées
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-2 lg:gap-12">
        <!-- Plan Gratuit -->
        <div
          class="relative bg-white rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-105"
        >
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Basique</h2>
            <p class="text-gray-600">Parfait pour commencer</p>
          </div>

          <div class="mb-8">
            <p class="text-5xl font-bold text-gray-900 mb-2">Gratuit</p>
            <p class="text-gray-600">10 recherches/mois</p>
          </div>

          <ul class="space-y-4 mb-8">
            <li class="flex items-center">
              <svg
                class="w-6 h-6 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span class="text-gray-700">10 recherches mensuelles</span>
            </li>
            <li class="flex items-center">
              <svg
                class="w-6 h-6 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span class="text-gray-700"
                >Accès aux fonctionnalités de base</span
              >
            </li>
          </ul>

          <button
            @click="navToAuth"
            :disabled="store.user_limit.is_registered"
            class="w-full py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            S'inscrire
          </button>
        </div>

        <!-- Plan Premium -->
        <div
          class="relative bg-white rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-105 border-4 border-indigo-500"
        >
          <div
            class="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm font-semibold"
          >
            Le plus populaire
          </div>

          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Premium</h2>
            <p class="text-gray-600">Pour les utilisateurs exigeants</p>
          </div>

          <div class="mb-8">
            <p class="text-5xl font-bold text-gray-900 mb-2">$5.75</p>
            <p class="text-gray-600">par mois</p>
          </div>

          <ul class="space-y-4 mb-8">
            <li class="flex items-center">
              <svg
                class="w-6 h-6 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span class="text-gray-700">Recherches illimitées</span>
            </li>
            <li class="flex items-center">
              <svg
                class="w-6 h-6 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span class="text-gray-700">Support prioritaire 24/7</span>
            </li>
            <li class="flex items-center">
              <svg
                class="w-6 h-6 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span class="text-gray-700"
                >Accès VIP aux nouvelles fonctionnalités</span
              >
            </li>
            <li class="flex items-center">
              <svg
                class="w-6 h-6 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span class="text-gray-700">Statistiques avancées</span>
            </li>
          </ul>

          <button
            @click="handleSubscription"
            :disabled="store.user_limit.is_prenium"
            class="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Obtenir
          </button>
        </div>
      </div>

      <p class="mt-12 text-center text-gray-400 text-sm">
        Annulation possible à tout moment. Garantie satisfait ou remboursé 30
        jours.
      </p>
    </div>
  </div>
</template>

<script setup>
import { useGlobalStore } from "@/stores/globalStore";
import { useRouter } from "vue-router";
const router = useRouter();
// test
// https://buy.stripe.com/test_9AQ4k08XJ6AA53i4gg
// Production
// https://buy.stripe.com/fZe8yW3O2gTy02QfZ0

const store = useGlobalStore();

function navToAuth() {
  if (!store.session) {
    // Redirige vers la page de connexion
    router.push("/auth");
    return;
  }

  router.push("/profile");
}

async function handleSubscription() {
  if (!store.session) {
    // Redirige vers la page de connexion
    router.push("/auth");
    return;
  }

  if (store.user_limit.is_prenium) {
    router.push("/listing");
    return;
  }

  await createStripeSession();
}

async function createStripeSession() {
  window.location.href = "https://buy.stripe.com/test_9AQ4k08XJ6AA53i4gg";
}
</script>

<style scoped>
/* Les animations sont gérées par les classes Tailwind */
</style>
