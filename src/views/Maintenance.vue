<script setup></script>
<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-center">
    <div class="text-center px-4">
      <h1 class="text-black text-5xl font-bold mb-4">Site en maintenance</h1>
      <p class="text-gray-400 text-lg mb-8">
        Nous travaillons pour améliorer votre expérience. Merci de revenir plus
        tard.
      </p>
      <!-- Animation : trois points rebondissants -->
      <div class="flex justify-center space-x-2">
        <div
          class="w-4 h-4 bg-black rounded-full animate-bounce"
          style="animation-delay: 0s"
        ></div>
        <div
          class="w-4 h-4 bg-black rounded-full animate-bounce"
          style="animation-delay: 0.2s"
        ></div>
        <div
          class="w-4 h-4 bg-black rounded-full animate-bounce"
          style="animation-delay: 0.4s"
        ></div>
      </div>
    </div>
  </div>
</template>
