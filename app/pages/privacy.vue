<script setup lang="ts">
const lastUpdated = 'March 31, 2026'

useHead({
  title: 'Privacy Policy — SpyGrocery',
  link: [
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
    title="Privacy policy"
    intro="This page explains what personal information SpyGrocery uses, why we use it, and the choices you have."
    :last-updated="lastUpdated"
  >
    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Information we collect</h2>
      <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-white/75 sm:text-base">
        <li>Account details used for sign-in, including email and authentication identifiers.</li>
        <li>Content you create in SpyGrocery, such as saved lists and AI chat sessions.</li>
        <li>Onboarding and product usage data needed to keep your experience consistent.</li>
        <li>Technical logs and security signals required to operate and protect the service.</li>
        <li>Local browser storage used for temporary list and preference continuity.</li>
      </ul>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Why we collect it</h2>
      <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-white/75 sm:text-base">
        <li>Provide login, account security, and session continuity.</li>
        <li>Generate grocery suggestions and structured lists through the AI assistant.</li>
        <li>Save and sync your lists across sessions when you are logged in.</li>
        <li>Improve reliability, detect abuse, and resolve technical incidents.</li>
      </ul>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Service providers and sharing</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        SpyGrocery relies on trusted providers to run core features, including Supabase for authentication and
        database operations, Google when users choose Google sign-in, and AI processing providers configured by
        SpyGrocery. We only share information required to provide the service.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Retention and protection</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        We keep information only as long as needed to operate SpyGrocery, meet legal obligations, and protect the
        platform. Access is limited to authorized personnel and service providers acting on our instructions.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Your choices</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        You can request access, correction, or deletion of personal information that we control, subject to legal
        and operational requirements. You can also remove local browser data from your device settings.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Contact</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        For privacy requests or questions, contact:
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
