<script setup lang="ts">
const lastUpdated = 'March 31, 2026'

useHead({
  title: 'Terms of Service — SpyGrocery',
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
    title="Terms of service"
    intro="These terms describe the rules for using SpyGrocery and the limits of what the product guarantees."
    :last-updated="lastUpdated"
  >
    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Service scope</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        SpyGrocery helps users compare grocery products and build lists using search and AI-assisted tools. The
        service is provided as a comparison and planning tool, not as a checkout platform.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Accounts and acceptable use</h2>
      <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-white/75 sm:text-base">
        <li>You are responsible for activity performed through your account.</li>
        <li>Do not misuse the service, automate abusive traffic, or interfere with platform availability.</li>
        <li>Do not attempt unauthorized access to data, accounts, or infrastructure.</li>
      </ul>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Price and availability disclaimer</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        Prices, stock, promotions, and product availability may change at any time. SpyGrocery does not guarantee
        that every value shown in the app is current at the moment of purchase. The retailer source remains
        authoritative for final checkout details.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Suspension and termination</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        We may suspend or terminate access when needed to protect users, enforce these terms, investigate abuse, or
        comply with legal obligations.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Liability limits</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        SpyGrocery is provided on an as-available basis. To the extent permitted by law, we are not liable for
        indirect or consequential losses resulting from use of the service, including retailer pricing differences
        or unavailable products.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Updates to these terms</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        We may revise these terms as the product evolves. Material updates will be reflected by updating the date on
        this page.
      </p>
    </section>

    <section>
      <h2 class="font-display text-3xl font-semibold italic tracking-tight text-white">Contact</h2>
      <p class="mt-4 text-sm text-white/75 sm:text-base">
        Questions about these terms can be sent to:
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
