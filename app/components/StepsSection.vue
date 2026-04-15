<script setup lang="ts">
const steps = [
  {
    number: '01.',
    title: 'Trouvez votre premier produit',
    description: 'Cherchez un produit, ouvrez sa fiche et ajoutez-le a votre liste en un clic.'
  },
  {
    number: '02.',
    title: 'Continuez dans un magasin',
    description: 'Poursuivez vos achats sur la page magasin du produit choisi, avec les memes filtres et cartes.'
  },
  {
    number: '03.',
    title: 'Finalisez votre liste',
    description: 'Enregistrez votre liste ou poursuivez la comparaison dans d\'autres magasins.'
  }
]
</script>

<template>
  <section id="process" class="bg-white text-black">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div class="grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <h2 class="font-display text-4xl font-semibold italic leading-tight sm:text-5xl">
          Comment SpyGrocery
          <br />
          fonctionne vraiment.
        </h2>
        <p class="max-w-md text-sm font-medium text-black/70 sm:text-base">
          Trois etapes claires pour passer de votre premier produit a une vraie liste enregistrable.
        </p>
      </div>

      <div class="mt-8 rounded-2xl border border-black/10 p-8 sm:mt-10 sm:pt-10">
        <div class="grid gap-8 md:grid-cols-3">
          <div v-for="step in steps" :key="step.number">
            <p class="text-sm font-semibold italic text-black/40">{{ step.number }}</p>
            <h3 class="mt-3 text-base font-semibold uppercase tracking-[0.25em]">{{ step.title }}</h3>
            <p class="mt-3 text-sm text-black/70">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
