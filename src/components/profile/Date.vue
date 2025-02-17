<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";

const authStore = useAuthStore();
let formattedResetDate = ref("");
onMounted(async () => {
  if (await authStore.session) {
    const createdDate = new Date(authStore.session.user.created_at);
    createdDate.setMonth(createdDate.getMonth() + 1);
    formattedResetDate.value = createdDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  }
});

defineProps({
  t: {
    type: Function,
    required: true,
  },
});
</script>

<template>
  <div class="bg-white rounded-lg mb-4 overflow-hidden shadow-sm">
    <div class="p-4 border-b">
      <h2 class="text-base font-medium text-gray-900">
        {{ t("monthlyUsageLimit.title") }}
      </h2>
    </div>

    <div class="p-4">
      <p class="text-sm text-gray-900">
        {{ t("monthlyUsageLimit.resetDateLabel") }}
        <span class="font-medium">{{ formattedResetDate }}</span>
      </p>
      <p class="mt-2 text-xs text-gray-500">
        {{ t("monthlyUsageLimit.description") }}
      </p>
    </div>
  </div>
</template>
