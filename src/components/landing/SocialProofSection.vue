<template>
  <section class="bg-white py-20 md:py-28 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-14 md:mb-20">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {{ t("SocialProofSection.title") }}
        </h2>
        <p class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          {{ t("SocialProofSection.subtitle") }}
        </p>
      </div>

      <!-- Témoignages -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16">
        <div
          class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all group"
        >
          <a
            href="https://www.tiktok.com/@bambalerequin/video/7463203868734672134"
            target="_blank"
            rel="noopener noreferrer"
            class="block hover:ring-2 hover:ring-blue-100 rounded-xl transition-all p-1 -m-1"
          >
            <div class="flex items-center mb-6">
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span class="font-semibold text-gray-900">@fckicavedin</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                </div>
                <div class="text-sm text-gray-500 mt-1">
                  868 abonnés sur TikTok
                </div>
              </div>
            </div>
            <p class="text-gray-600 mb-6">
              "<span dir="">ça sauve 🔥🔥🔥</span>"
            </p>
          </a>
        </div>

        <div
          class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all group"
        >
          <a
            href="https://www.tiktok.com/@bambalerequin/video/7463203868734672134"
            target="_blank"
            rel="noopener noreferrer"
            class="block hover:ring-2 hover:ring-blue-100 rounded-xl transition-all p-1 -m-1"
          >
            <div class="flex items-center mb-6">
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span class="font-semibold text-gray-900">@n_angee</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                </div>
                <div class="text-sm text-gray-500 mt-1">
                  258 abonnés sur TikTok
                </div>
              </div>
            </div>
            <p class="text-gray-600 mb-6">
              "Woow in this economy, this is Genius!!💯 the name please"
            </p>
          </a>
        </div>

        <!-- Nouveau témoignage @surunebeuj -->
        <div
          class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all group"
        >
          <a
            href="https://www.tiktok.com/@surunebeuj"
            target="_blank"
            rel="noopener noreferrer"
            class="block hover:ring-2 hover:ring-blue-100 rounded-xl transition-all p-1 -m-1"
          >
            <div class="flex items-center mb-6">
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span class="font-semibold text-gray-900">@surunebeuj</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                </div>
                <div class="text-sm text-gray-500 mt-1">
                  6 580 abonnés sur TikTok
                </div>
              </div>
            </div>
            <p class="text-gray-600 mb-6">"C fort !!"</p>
          </a>
        </div>
      </div>

      <!-- Intégration TikTok -->
      <div class="mt-16 md:mt-20 max-w-2xl mx-auto px-4">
        <div
          ref="tiktokEmbed"
          class="tiktok-embed-container rounded-2xl shadow-lg overflow-hidden"
        >
          <blockquote
            class="tiktok-embed"
            cite="https://www.tiktok.com/@bambalerequin/video/7463203868734672134"
            data-video-id="7463203868734672134"
          >
            <section>
              <a
                target="_blank"
                title="@bambalerequin"
                href="https://www.tiktok.com/@bambalerequin"
                >@bambalerequin</a
              >
            </section>
          </blockquote>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
defineProps({
  t: {
    type: Function,
    required: true,
  },
});

const tiktokEmbed = ref(null);

onMounted(() => {
  // Chargement dynamique du script TikTok
  if (
    !document.querySelector('script[src="https://www.tiktok.com/embed.js"]')
  ) {
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.head.appendChild(script);
  }
});
</script>

<style scoped>
/* Effet de survol personnalisé pour les cartes */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tiktok-embed-container {
  margin: 0 auto;
  background: #fff;
  padding: 20px;
  border-radius: 16px;
}

.tiktok-embed {
  display: block;
  margin: 0 auto;
  width: 100%;
  min-width: 325px;
  max-width: 605px;
}
</style>
