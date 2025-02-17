<script setup>
import { ref } from "vue";
const showDeleteModal = ref(false);
</script>

<template>
  <div class="mt-6 mb-8">
    <button
      @click="showDeleteModal = true"
      class="w-full text-sm text-red-600 hover:text-red-800 focus:outline-none"
    >
      Supprimer mon compte
    </button>
  </div>
</template>
