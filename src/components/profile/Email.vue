<script setup>
import { onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";

const authStore = useAuthStore();

defineProps({
  t: {
    type: Function,
    required: true,
  },
});

/*
const isEditingEmail = ref(false);
const newEmail = ref("");
const emailError = ref("");

async function startEditEmail() {
  if (await authStore.session) {
    newEmail.value = session.user.email;
    isEditingEmail.value = true;
    emailError.value = "";
  }
}

function cancelEditEmail() {
  isEditingEmail.value = false;
  emailError.value = "";
}

function saveEmail() {
  if (!newEmail.value) {
    emailError.value = t("Profile.validation.empty_email");
    return;
  }

  if (!newEmail.value.includes("@") || !newEmail.value.includes(".")) {
    emailError.value = t("Profile.validation.invalid_email");
    return;
  }

  isEditingEmail.value = false;
  emailError.value = "";
}
  */
</script>
<template>
  <div class="bg-white rounded-lg mb-4 overflow-hidden shadow-sm">
    <div class="p-4 border-b">
      <h2 class="text-base font-medium text-gray-900">
        {{ $t("Profile.email_section") }}
      </h2>
    </div>

    <div class="p-4">
      <!-- Utilisation de authStore.isEditing pour vérifier l'état d'édition -->
      <div
        v-if="!authStore.isEditing"
        class="flex justify-between items-center"
      >
        <p class="text-sm text-gray-900">
          {{ authStore.session?.user?.email }}
        </p>
        <!-- On passe l'email de la session pour démarrer l'édition -->
        <button
          @click="authStore.startEditEmail(authStore.session.user.email)"
          class="text-sm font-medium text-black hover:text-gray-700"
        >
          {{ $t("Profile.edit_button") }}
        </button>
      </div>

      <div v-else class="space-y-3">
        <input
          v-model="authStore.newEmail"
          type="email"
          class="w-full border border-gray-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
          :placeholder="$t('Profile.email_placeholder')"
        />
        <p v-if="authStore.emailError" class="text-xs text-red-600">
          {{ authStore.emailError }}
        </p>
        <div class="flex space-x-3">
          <button
            @click="authStore.updateEmailUser()"
            class="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 focus:outline-none"
          >
            {{ $t("Profile.save_button") }}
          </button>
          <button
            @click="authStore.cancelEditEmail()"
            class="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
          >
            {{ $t("Profile.cancel_button") }}
          </button>
        </div>
      </div>

      <p class="mt-2 text-xs text-gray-500">
        {{ $t("Profile.magic_link_message") }}
      </p>
    </div>
  </div>
</template>
