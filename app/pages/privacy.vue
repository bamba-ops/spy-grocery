<script setup lang="ts">
const lastUpdated = '31 mars 2026'
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://spygrocery.com').replace(/\/$/, '')

useHead({
  title: 'Politique de confidentialite - SpyGrocery',
  link: [
    {
      rel: 'canonical',
      href: `${siteUrl}/privacy`
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;1,600&family=Manrope:wght@400;500;600&display=swap'
    }
  ]
})
</script>

<template>
  <LegalPageShell
    title="Politique de confidentialite"
    intro="Cette page explique quelles informations personnelles SpyGrocery utilise, pourquoi nous les utilisons et quels choix vous avez."
    :last-updated="lastUpdated"
  >
    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Informations collectees</h2>
      <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-white/75 sm:text-base">
        <li>Informations de compte utilisees pour la connexion, incluant courriel et identifiants d'authentification.</li>
        <li>Contenu que vous creez dans SpyGrocery, comme les listes enregistrees et les sessions IA.</li>
        <li>Donnees de parcours de demarrage et d'usage produit pour garder une experience coherente.</li>
        <li>Journaux techniques et signaux de securite necessaires au fonctionnement et a la protection du service.</li>
        <li>Stockage local du navigateur pour la continuite temporaire des listes et preferences.</li>
      </ul>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Pourquoi nous les collectons</h2>
      <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-white/75 sm:text-base">
        <li>Fournir la connexion, la securite du compte et la continuite de session.</li>
        <li>Generer des suggestions d'epicerie et des listes structurees via l'assistant IA.</li>
        <li>Enregistrer et synchroniser vos listes entre sessions lorsque vous etes connecte.</li>
        <li>Ameliorer la fiabilite, detecter les abus et resoudre les incidents techniques.</li>
      </ul>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Fournisseurs de service et partage</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        SpyGrocery s'appuie sur des fournisseurs de confiance pour operer les fonctions principales, dont Supabase
        pour l'authentification et la base de donnees, Google lorsque les utilisateurs choisissent la connexion
        Google, et des fournisseurs IA configures par SpyGrocery. Nous ne partageons que les informations
        necessaires a la prestation du service.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Conservation et protection</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        Nous conservons les informations uniquement le temps necessaire pour operer SpyGrocery, respecter nos
        obligations legales et proteger la plateforme. L'acces est limite au personnel autorise et aux fournisseurs
        agissant sur nos instructions.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Vos choix</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        Vous pouvez demander l'acces, la correction ou la suppression des informations personnelles que nous
        controlons, sous reserve des exigences legales et operationnelles. Vous pouvez aussi supprimer les donnees
        locales du navigateur dans les reglages de votre appareil.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Contact</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        Pour toute demande ou question liee a la confidentialite, contactez :
        <a
          href="mailto:privacy@spygrocery.com"
          class="ml-1 underline underline-offset-4 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          privacy@spygrocery.com
        </a>
      </p>
    </section>
  </LegalPageShell>
</template>
