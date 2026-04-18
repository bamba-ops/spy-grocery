<script setup lang="ts">
const lastUpdated = '31 mars 2026'
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public.siteUrl || 'https://www.spygrocery.com').replace(/\/$/, '')

useHead({
  title: 'Conditions de service - SpyGrocery',
  link: [
    {
      rel: 'canonical',
      href: `${siteUrl}/terms`
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
    title="Conditions de service"
    intro="Ces conditions decrivent les regles d'utilisation de SpyGrocery et les limites des garanties du produit."
    :last-updated="lastUpdated"
  >
    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Portee du service</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        SpyGrocery aide les utilisateurs a comparer des produits d'epicerie et a creer des listes avec la recherche
        et des outils assistes par l'IA. Le service est fourni comme outil de comparaison et de planification,
        et non comme plateforme de paiement.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Comptes et usage acceptable</h2>
      <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-white/75 sm:text-base">
        <li>Vous etes responsable des activites effectuees avec votre compte.</li>
        <li>N'abusez pas du service, n'automatisez pas un trafic abusif et n'interrompez pas la disponibilite.</li>
        <li>Ne tentez aucun acces non autorise aux donnees, comptes ou infrastructures.</li>
      </ul>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Avis sur les prix et la disponibilite</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        Les prix, stocks, promotions et disponibilites peuvent changer a tout moment. SpyGrocery ne garantit pas que
        chaque valeur affichee dans l'application soit a jour au moment de l'achat. La source du detaillant reste
        la reference pour les details finaux de paiement.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Suspension et resiliation</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        Nous pouvons suspendre ou resilier l'acces lorsque c'est necessaire pour proteger les utilisateurs, faire
        respecter ces conditions, enqueter sur des abus ou respecter des obligations legales.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Limites de responsabilite</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        SpyGrocery est fourni selon disponibilite. Dans les limites autorisees par la loi, nous ne sommes pas
        responsables des pertes indirectes ou consecutives liees a l'utilisation du service, y compris les
        differences de prix chez les detaillants ou les produits indisponibles.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Mises a jour des conditions</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        Nous pouvons mettre a jour ces conditions au fil de l'evolution du produit. Les changements importants seront
        indiques en mettant a jour la date de cette page.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Contact</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        Les questions sur ces conditions peuvent etre envoyees a :
        <a
          href="mailto:legal@spygrocery.com"
          class="ml-1 underline underline-offset-4 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          legal@spygrocery.com
        </a>
      </p>
    </section>
  </LegalPageShell>
</template>
