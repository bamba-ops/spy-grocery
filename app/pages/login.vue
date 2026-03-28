<script setup lang="ts">
import { ArrowRight, Chrome, Loader2, Mail } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

definePageMeta({
  middleware: 'guest'
})

onMounted(() => {
  authStore.setInitializeLoginPage()
})

onBeforeUnmount(() => {
  authStore.setDisposeLoginPage()
})

useHead({
  title: 'Login — SpyGrocery',
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
  <div class="relative min-h-screen overflow-hidden bg-black font-sans text-white">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),rgba(0,0,0,0)_48%)]" />
    <div class="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04] sm:h-[44rem] sm:w-[44rem]" />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black via-black/80 to-transparent" />

    <main class="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
      <NuxtLink
        to="/"
        class="font-display text-4xl italic tracking-tight text-white transition hover:text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-5xl"
      >
        SpyGrocery
      </NuxtLink>

      <h1 class="mt-8 text-center font-display text-5xl font-semibold italic leading-[0.95] tracking-tight text-white sm:mt-10 sm:text-7xl">
        Welcome back
      </h1>
      <p class="mt-4 max-w-xl text-center text-sm text-white/70 sm:text-lg">
        Your curated kitchen, precisely managed.
      </p>

      <section class="mt-8 w-full max-w-[560px] rounded-[36px] border border-white/10 bg-black/60 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:mt-10 sm:p-6">
        <div
          v-if="authStore.loginMagicLinkSent"
          class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center sm:px-6 sm:py-8"
        >
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Email sent</p>
          <h2 class="mt-3 font-display text-3xl font-semibold italic tracking-tight text-white sm:text-4xl">
            Check your inbox.
          </h2>
          <p class="mt-3 text-sm text-white/70 sm:text-base">
            We sent a magic link to
            <span class="break-all font-semibold text-white">{{ authStore.loginEmail.trim() }}</span>.
          </p>
          <button
            type="button"
            class="mt-6 inline-flex rounded-full border border-white/20 px-5 py-2 text-[10px] uppercase tracking-[0.35em] text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click="authStore.setResetLoginMagicLinkState"
          >
            Use another email
          </button>
        </div>

        <form v-else class="space-y-4 sm:space-y-5" @submit.prevent="authStore.setSubmitLoginMagicLink">
          <label class="block">
            <span class="text-[10px] uppercase tracking-[0.35em] text-white/60">Account Identifier</span>
            <div class="mt-2 flex h-12 items-center gap-3 rounded-full border border-white/15 bg-black px-4 focus-within:ring-2 focus-within:ring-white/70 focus-within:ring-offset-2 focus-within:ring-offset-black sm:h-14 sm:px-5">
              <Mail class="h-4 w-4 shrink-0 text-white/45" />
              <input
                v-model="authStore.loginEmail"
                type="email"
                autocomplete="email"
                placeholder="name@domain.com"
                class="h-full w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none sm:text-base"
              >
            </div>
          </label>

          <button
            type="submit"
            :disabled="!authStore.getCanSubmitLoginEmail"
            class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white px-6 text-sm font-medium text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40 sm:h-14 sm:text-base"
          >
            <Loader2 v-if="authStore.isLoading" class="h-4 w-4 animate-spin" />
            <template v-else>Continue with Email</template>
          </button>

          <div class="mt-8 flex items-center gap-4">
            <span class="h-px flex-1 bg-white/10" />
            <span class="text-[10px] uppercase tracking-[0.35em] text-white/40">Or navigate via</span>
            <span class="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            :disabled="authStore.isLoading"
            class="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-transparent px-6 text-sm text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40 sm:h-14 sm:text-base"
            @click="authStore.setContinueLoginWithGoogle"
          >
            <Chrome class="h-5 w-5" />
            Continue with Google
          </button>
        </form>

        <!--<p class="mt-7 text-center text-xs text-white/45 sm:mt-8">
          By continuing, you agree to our
          <NuxtLink to="/" class="underline underline-offset-4 transition hover:text-white">Terms of Service</NuxtLink>
          and
          <NuxtLink to="/" class="underline underline-offset-4 transition hover:text-white">Privacy Policy</NuxtLink>.
        </p>-->

        <p
          v-if="authStore.loginHasAuthFailed"
          class="mt-6 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80"
        >
          We could not confirm your session. Please try again.
        </p>

        <p
          v-if="authStore.error"
          class="mt-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80"
        >
          {{ authStore.error }}
        </p>
      </section>

      <!--<p class="mt-8 text-center text-xs text-white/45 sm:mt-10 sm:text-sm">
        New here?
        <NuxtLink
          to="/"
          class="ml-1 inline-flex items-center gap-1 text-white/80 underline underline-offset-4 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Explore the methodology
          <ArrowRight class="h-4 w-4" />
        </NuxtLink>
      </p>-->
    </main>
  </div>
</template>
