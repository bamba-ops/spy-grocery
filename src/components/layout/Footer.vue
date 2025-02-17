<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <footer class="bg-black text-white py-12 px-6">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 class="text-lg font-bold mb-4">{{ t("Footer.title") }}</h3>
        <p class="text-gray-400 text-sm">{{ t("Footer.description") }}</p>
      </div>
      <!--
      <div>
        <h4 class="text-sm font-bold mb-4">About</h4>
        <ul class="space-y-2">
          <li>
            <a href="#" class="text-gray-400 hover:text-white text-sm"
              >Our Story</a
            >
          </li>
          <li>
            <a href="#" class="text-gray-400 hover:text-white text-sm"
              >How it Works</a
            >
          </li>
          <li>
            <a href="#" class="text-gray-400 hover:text-white text-sm"
              >Careers</a
            >
          </li>
        </ul>
      </div>
      <div>
        <h4 class="text-sm font-bold mb-4">Support</h4>
        <ul class="space-y-2">
          <li>
            <a href="#" class="text-gray-400 hover:text-white text-sm"
              >Help Center</a
            >
          </li>
          <li>
            <a href="#" class="text-gray-400 hover:text-white text-sm"
              >Contact</a
            >
          </li>
          <li>
            <a href="#" class="text-gray-400 hover:text-white text-sm">FAQ</a>
          </li>
        </ul>
      </div>
      <div>
        <h4 class="text-sm font-bold mb-4">Legal</h4>
        <ul class="space-y-2">
          <li>
            <a href="#" class="text-gray-400 hover:text-white text-sm"
              >Terms of Use</a
            >
          </li>
          <li>
            <a href="#" class="text-gray-400 hover:text-white text-sm"
              >Privacy Policy</a
            >
          </li>
          <li>
            <a href="#" class="text-gray-400 hover:text-white text-sm"
              >Legal Notice</a
            >
          </li>
        </ul>
      </div>
      -->
    </div>

    <div class="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800">
      <p class="text-center text-gray-400 text-sm">
        {{ t("Footer.copyright") }}
      </p>
    </div>
  </footer>
</template>
