<script setup>
import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import Price from "@/components/landing/Price.vue";

const { locale } = useI18n();

const metaData = computed(() => {
  if (locale.value === "fr") {
    return {
      title: "Tarification des abonnements | Spy Grocery",
      meta: [
        {
          name: "description",
          content:
            "Découvrez nos plans d'abonnement pour économiser sur vos courses. Choisissez l'offre qui vous convient pour accéder aux meilleures offres en temps réel.",
        },
        {
          name: "keywords",
          content:
            "tarification, abonnement, économies, courses, Spy Grocery, offres",
        },
        {
          property: "og:title",
          content: "Tarification des abonnements | Spy Grocery",
        },
        {
          property: "og:description",
          content:
            "Explorez nos différents plans d'abonnement pour optimiser vos dépenses en courses grâce à Spy Grocery.",
        },
        { property: "og:url", content: "https://spygrocery.com/pricing" },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: "https://spygrocery.com/path-to-pricing-image.jpg", // Remplacez par l'URL de votre image
        },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Tarification des abonnements | Spy Grocery",
        },
        {
          name: "twitter:description",
          content:
            "Découvrez nos offres d'abonnement et économisez sur vos courses grâce à Spy Grocery.",
        },
        {
          name: "twitter:image",
          content: "https://spygrocery.com/path-to-pricing-image.jpg", // Remplacez par l'URL de votre image
        },
      ],
    };
  } else {
    return {
      title: "Pricing Plans | Spy Grocery",
      meta: [
        {
          name: "description",
          content:
            "Explore our subscription plans to save on your groceries. Choose the right plan to access real-time best deals.",
        },
        {
          name: "keywords",
          content:
            "pricing, subscription, savings, groceries, Spy Grocery, deals",
        },
        {
          property: "og:title",
          content: "Pricing Plans | Spy Grocery",
        },
        {
          property: "og:description",
          content:
            "Discover our subscription plans designed to help you save on grocery shopping with Spy Grocery.",
        },
        { property: "og:url", content: "https://spygrocery.com/pricing" },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: "https://spygrocery.com/path-to-pricing-image.jpg", // Remplacez par l'URL de votre image
        },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Pricing Plans | Spy Grocery",
        },
        {
          name: "twitter:description",
          content:
            "Explore our pricing plans and save on your grocery shopping with Spy Grocery.",
        },
        {
          name: "twitter:image",
          content: "https://spygrocery.com/path-to-pricing-image.jpg", // Remplacez par l'URL de votre image
        },
      ],
    };
  }
});

useHead(metaData.value);
</script>

<template>
  <Price />
</template>
