<template>
  <div v-if="show">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/40 z-40" @click="$emit('close')"></div>

    <!-- Bottom Sheet Modal -->
    <div
      class="fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300"
    >
      <div class="bg-white rounded-t-3xl px-6 pt-6 pb-10">
        <!-- Handle/Pill -->
        <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>

        <!-- Content -->
        <div class="max-w-sm mx-auto">
          <h3 class="text-xl font-semibold mb-2 text-center">Welcome Back</h3>
          <p class="text-gray-500 text-sm text-center mb-6">
            Enter your access code to continue
          </p>

          <input
            v-model="password"
            type="password"
            placeholder="Enter access code"
            class="w-full bg-gray-50 px-4 py-3.5 rounded-2xl mb-4 focus:outline-none focus:ring-2 focus:ring-black/10"
            @keyup.enter="checkPassword"
          />

          <button
            @click="checkPassword"
            class="w-full bg-black text-white py-3.5 rounded-2xl font-medium mb-4"
          >
            Continue
          </button>

          <button
            @click="$emit('close')"
            class="w-full text-gray-500 py-2 font-medium"
          >
            Cancel
          </button>

          <p v-if="error" class="text-red-500 text-sm text-center mt-4">
            {{ error }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(["close", "access-granted"]);

const router = useRouter();
const password = ref("");
const error = ref("");

const checkPassword = () => {
  if (password.value === "spy2024") {
    localStorage.setItem("site-access", "granted");
    emit("access-granted");
    router.push("/listing");
  } else {
    error.value = "Invalid access code";
    password.value = "";
  }
};
</script>
