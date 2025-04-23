<script setup>
import { defineEmits, defineProps, onMounted, ref } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

onMounted(() => {
    console.log(props.show)
})

const emit = defineEmits(['close']);

const doNotShow = ref(false);

function handleClose() {
  emit('close', doNotShow.value);
}
</script>

<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white rounded-xl shadow-lg max-w-sm w-full mx-4 p-6 animate-fadeIn">
        <h2 class="text-lg font-semibold mb-4">Note</h2>
        <p class="text-sm text-gray-700 mb-4">
          Certains produits n’ont pas de prix au kg/L ; seul leur prix à l’unité est affiché.
        </p>
        <label class="flex items-center mb-4 cursor-pointer">
          <input
            type="checkbox"
            v-model="doNotShow"
            class="form-checkbox h-4 w-4 text-black focus:ring-0"
          />
          <span class="ml-2 text-sm text-gray-600">Ne plus afficher ce message</span>
        </label>
        <button
          @click="handleClose"
          class="w-full py-2 rounded-lg bg-black hover:bg-gray-800 text-white font-medium transition-all"
        >
          Fermer
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
