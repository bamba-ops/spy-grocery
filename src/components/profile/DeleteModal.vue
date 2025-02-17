<script setup>
// Méthode pour supprimer le compte
function deleteAccount() {
  // Ici vous appelleriez votre API pour supprimer le compte
  console.log("Compte supprimé");

  // Rediriger vers la page d'accueil ou de déconnexion
  // window.location.href = '/'

  // Pour la démo, on ferme juste la modal
  showDeleteModal.value = false;
}
</script>

<template>
  <div
    v-if="showDeleteModal"
    class="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center"
  >
    <div
      class="bg-white rounded-lg mx-4 overflow-hidden shadow-xl max-w-sm w-full"
    >
      <div class="p-4">
        <h3 class="text-lg font-medium text-gray-900">
          Supprimer votre compte?
        </h3>
        <p class="mt-2 text-sm text-gray-500">
          Toutes vos données seront définitivement supprimées. Cette action ne
          peut pas être annulée.
        </p>
      </div>
      <div class="px-4 py-3 flex flex-col sm:flex-row gap-2 border-t">
        <button
          @click="showDeleteModal = false"
          class="w-full sm:w-auto text-sm font-medium text-black bg-white border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 focus:outline-none"
        >
          Annuler
        </button>
        <button
          @click="deleteAccount"
          class="w-full sm:w-auto text-sm font-medium text-white bg-black rounded-md py-2 px-4 hover:bg-gray-800 focus:outline-none"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>
