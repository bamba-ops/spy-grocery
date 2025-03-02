<script setup>
import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

const metaData = computed(() => {
  if (locale.value === "fr") {
    return {
      title:
        "Comparer les prix d'épicerie en temps réel au Québec | Spy Grocery",
      meta: [
        {
          name: "description",
          content:
            "Économisez avec les meilleurs prix dans vos magasins favoris en quelques secondes. Spy Grocery vous permet de comparer en temps réel les prix de vos courses et d’optimiser votre budget alimentaire.",
        },
        {
          name: "keywords",
          content:
            "épicerie, comparaison de prix, Québec, courses, budget, économies, Spy Grocery, inflation",
        },
        {
          property: "og:title",
          content:
            "Comparer les prix d'épicerie en temps réel au Québec | Spy Grocery",
        },
        {
          property: "og:description",
          content:
            "Spy Grocery vous aide à trouver les meilleures offres en comparant les prix de vos courses en temps réel.",
        },
        { property: "og:url", content: "https://spygrocery.com" },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: "https://spygrocery.com/path-to-your-image.jpg",
        },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content:
            "Comparer les prix d'épicerie en temps réel au Québec | Spy Grocery",
        },
        {
          name: "twitter:description",
          content:
            "Trouvez les meilleures offres et économisez sur vos courses grâce à notre comparateur de prix en temps réel.",
        },
        {
          name: "twitter:image",
          content: "https://spygrocery.com/path-to-your-image.jpg",
        },
      ],
    };
  } else {
    return {
      title: "Compare grocery prices across Quebec in real-time | Spy Grocery",
      meta: [
        {
          name: "description",
          content:
            "Save with the best prices at your favorite stores in seconds. Spy Grocery lets you compare grocery prices in real-time to optimize your food budget.",
        },
        {
          name: "keywords",
          content:
            "grocery, price comparison, Quebec, shopping, budget, savings, Spy Grocery, inflation",
        },
        {
          property: "og:title",
          content:
            "Compare grocery prices across Quebec in real-time | Spy Grocery",
        },
        {
          property: "og:description",
          content:
            "Spy Grocery helps you find the best deals by comparing grocery prices in real-time.",
        },
        { property: "og:url", content: "https://spygrocery.com" },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content:
            "https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg",
        },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content:
            "Compare grocery prices across Quebec in real-time | Spy Grocery",
        },
        {
          name: "twitter:description",
          content:
            "Discover the best deals and save money with our real-time grocery price comparator.",
        },
        {
          name: "twitter:image",
          content:
            "https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg",
        },
      ],
    };
  }
});

useHead(metaData.value);

import HeroSection from "@/components/landing/HeroSection.vue";
import ProblemAgitation from "@/components/landing/ProblemAgitation.vue";
import SocialProofSection from "@/components/landing/SocialProofSection.vue";
import Price from "@/components/landing/Price.vue";
import { onMounted } from "vue";
import { useLandingStore } from "@/stores/useLandingStore";

const landingStore = useLandingStore();

onMounted(async () => {
  await landingStore.getTaskByIsTest();
});

defineProps({
  t: {
    type: Function,
    required: true,
  },
});
</script>

<template>
  <div>
    <HeroSection :t="t" />
    <ProblemAgitation :t="t" />
    <SocialProofSection :t="t" />
    <Price :t="t" />
  </div>
</template>

<style scoped></style>
