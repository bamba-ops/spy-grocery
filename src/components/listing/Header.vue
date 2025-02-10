<script setup>
defineProps({
  t: {
    type: Function,
    required: true,
  },
});
</script>

<template>
  <!-- Header section -->
  <div class="flex flex-col items-center mb-12">
    <div class="text-6xl md:text-7xl mb-4">🍀</div>
    <h2 class="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
      {{ t("Listing.title") }}
    </h2>
    <p class="text-base md:text-lg text-gray-600 text-center max-w-lg">
      {{ t("Listing.description") }}
    </p>
  </div>
</template>
