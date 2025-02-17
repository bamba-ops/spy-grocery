<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-black text-white px-4 py-3">
      <div class="max-w-3xl mx-auto flex items-center">
        <h1 class="text-lg font-medium">Profil</h1>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-3xl mx-auto p-4">
      <!-- Email Section -->
      <Email :t="t" />

      <!-- Date de réinitialisation Section -->
      <Date :t="t" />

      <!-- Plan Section -->
      <Plan :t="t" />
    </div>
  </div>
</template>

<script setup>
import Email from "@/components/profile/Email.vue";
import Date from "@/components/profile/Date.vue";
import Plan from "@/components/profile/Plan.vue";
import Delete from "@/components/profile/Delete.vue";
import DeleteModal from "@/components/profile/DeleteModal.vue";

defineProps({
  t: {
    type: Function,
    required: true,
  },
});
</script>
