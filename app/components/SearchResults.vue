<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import type { SearchProduct } from '#shared/types'
import { getProductValidityLabel } from '#shared/utils/productAvailability'
import { getProductRoutePath } from '#shared/utils/productRoute'
import { useSearchStore } from '~/stores/search'
import { useListsStore } from '~/stores/lists'
import { useAuthStore } from '~/stores/auth'

const searchStore = useSearchStore()
const lists = useListsStore()
const authStore = useAuthStore()

const getSafeProductUrl = (url: string | null) => {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (!/^https?:\/\//i.test(trimmed)) return null
  return trimmed
}

const getNotifySpecialNextPath = () => {
  const params = new URLSearchParams()
  params.set('intent', 'notify-special')

  const normalizedQuery = (searchStore.query || searchStore.searchInput || '').trim()

  if (normalizedQuery) {
    params.set('q', normalizedQuery)
  }

  if (searchStore.selectedStoreId && searchStore.selectedStoreId !== 'all') {
    params.set('store', searchStore.selectedStoreId)
  }

  return `/search?${params.toString()}`
}

const setNotifySpecialRequest = () => {
  if (authStore.user) {
    return
  }

  authStore.setOpenAuthPrompt({
    title: 'Alerte specials',
    description: 'Connectez-vous pour que nous puissions vous contacter quand ce produit est en special.',
    nextPath: getNotifySpecialNextPath(),
    ctaLabel: 'Connexion pour activer l\'alerte'
  })
}

const getProductValidityText = (product: SearchProduct) => {
  return getProductValidityLabel(product.valid_from, product.valid_to)
}
</script>

<template>
  <div>
    <div class="border-b border-white/10 pb-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Comparaison en cours</p>
          <h1 class="font-display text-4xl font-semibold italic tracking-tight sm:text-5xl">
            {{ searchStore.getActiveQuery }}
          </h1>
        </div>
        <div class="text-[10px] uppercase tracking-[0.35em] text-white/60">
          {{ searchStore.total }} resultats
        </div>
      </div>

      <div class="mt-6">
        <SearchSidebar />
      </div>
    </div>

    <div v-if="searchStore.getHasError" class="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
      {{ searchStore.error }}
    </div>

    <div
      v-else-if="searchStore.getIsLoading || (!searchStore.hasFetchedSearchResults && searchStore.getProducts.length === 0)"
      class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div v-for="i in 6" :key="i" class="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/5"></div>
    </div>

    <div v-else class="mt-6">
      <div
        v-if="searchStore.hasFetchedSearchResults && searchStore.getProducts.length === 0"
        class="border-t border-white/10 pt-6 sm:pt-8"
      >
        <div class="flex flex-col gap-5 sm:gap-6">
          <div class="max-w-2xl">
            <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Aucun resultat</p>
            <p class="mt-2 font-display text-2xl font-semibold italic tracking-tight text-white sm:text-3xl">
              On n'a rien trouve pour "{{ searchStore.query || 'votre recherche' }}"
            </p>
            <p class="mt-2 text-sm leading-relaxed text-white/80 sm:text-base">
              SpyGrocery affiche les produits en special. Ce produit n'est peut-etre pas en promo en ce moment.
            </p>
            <p class="mt-3 text-xs leading-relaxed text-white/60 sm:text-[13px]">
              Vous pouvez demander une alerte puis poursuivre vos comparaisons dans d'autres magasins.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3 sm:pt-1">
            <button
              type="button"
              class="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/20 bg-white px-5 text-center text-[10px] uppercase tracking-[0.28em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto sm:px-6"
              @click="setNotifySpecialRequest"
            >
              Notifie-moi quand c'est en special
            </button>
          </div>
        </div>
      </div>

      <div v-else class="mt-6 grid gap-4 sm:mt-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="product in searchStore.getProducts"
          :key="product.id"
          :class="[
            'flex h-full flex-col rounded-2xl border',
            product.is_active
              ? 'border-white/10 bg-white/5'
              : 'border-white/20 bg-white/[0.03]'
          ]"
        >
          <div class="relative">
            <div v-if="product.on_sale" class="absolute left-4 top-4 z-10 rounded-full border border-white/20 bg-black/80 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/80">
              En promo
            </div>
            <div
              v-else-if="!product.is_active"
              class="absolute left-4 top-4 z-10 rounded-full border border-white/20 bg-black/85 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/70"
            >
              Terminee
            </div>
            <NuxtLink
              :to="getProductRoutePath(product)"
              class="relative block aspect-[16/9] overflow-hidden rounded-t-2xl border-b border-white/10 bg-black transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:aspect-square"
            >
              <template v-if="searchStore.getProductImageDisplay(product.image_url, product.title).type === 'url'">
                <img
                  :src="searchStore.getProductImageDisplay(product.image_url, product.title).value"
                  :alt="product.title"
                  :class="[
                    'h-full w-full object-contain brightness-90 contrast-110',
                    product.is_active ? '' : 'grayscale opacity-65'
                  ]"
                  loading="lazy"
                />
              </template>
              <template v-else>
                <div :class="['flex h-full w-full items-center justify-center text-5xl', product.is_active ? 'text-white/60' : 'text-white/35']">
                  {{ searchStore.getProductImageDisplay(product.image_url, product.title).value }}
                </div>
              </template>
              <div :class="['pointer-events-none absolute inset-0 z-0', product.is_active ? 'bg-black/40' : 'bg-black/60']"></div>
            </NuxtLink>
          </div>
          <div class="flex flex-1 flex-col p-3 sm:p-5">
            <p :class="['text-sm font-semibold uppercase tracking-[0.18em] sm:text-base sm:tracking-[0.2em]', product.is_active ? 'text-white/85' : 'text-white/65']">{{ product.store }}</p>
            <NuxtLink
              :to="getProductRoutePath(product)"
              class="mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:mt-2"
            >
              <h3
                :title="product.title"
                :class="[
                  'h-[3.8rem] overflow-hidden font-display text-lg font-semibold italic leading-tight [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] transition sm:h-[5.8rem] sm:text-2xl sm:[-webkit-line-clamp:3]',
                  product.is_active ? 'hover:text-white' : 'text-white/75 hover:text-white/85'
                ]"
              >
                {{ product.title }}
              </h3>
            </NuxtLink>

            <div class="mt-2 flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.24em] text-white/70 sm:mt-3 sm:text-[10px] sm:tracking-[0.3em]">
              <span v-if="product.uom" class="rounded-full border border-white/15 px-2 py-1">{{ product.uom }}</span>
              <span class="rounded-full border border-white/15 px-2 py-1">{{ product.price_text || '$/unite' }}</span>
            </div>
            <div class="mt-auto flex items-end justify-between pt-4 sm:pt-6">
              <div class="flex flex-col items-start">
                <span
                  :class="[
                    'font-display text-xl font-semibold italic sm:text-3xl',
                    product.is_active ? 'text-white' : 'text-white/65'
                  ]"
                >
                  {{ product.is_active ? `$${searchStore.getFormattedPrice(product.price_num)}` : 'Promo terminee' }}
                </span>
                <p v-if="getProductValidityText(product)" class="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/50">
                  {{ getProductValidityText(product) }}
                </p>
                <div class="mt-2 min-h-7">
                  <a
                    v-if="getSafeProductUrl(product.url)"
                    :href="getSafeProductUrl(product.url)!"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex rounded-full border border-white/20 px-3 py-1 text-[9px] uppercase tracking-[0.28em] text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-[10px] sm:tracking-[0.32em]"
                  >
                    Voir en magasin
                  </a>
                </div>
              </div>
              <button
                :class="[
                  'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                  lists.lastAddedProductId === product.id ? 'scale-110 ring-2 ring-white/40' : 'scale-100'
                ]"
                @click="lists.setProductInCurrentList(product)"
                aria-label="Ajouter a la liste"
              >
                <Plus class="h-7 w-7" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="searchStore.totalPages > 1 && searchStore.getProducts.length > 0"
        class="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="text-[10px] uppercase tracking-[0.35em] text-white/60">
          Page {{ searchStore.page }} sur {{ searchStore.totalPages }}
        </div>

        <div class="flex items-center justify-between gap-3 sm:justify-end">
          <button
            class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!searchStore.getCanPrev"
            @click="searchStore.setPrevPageWithScroll()"
          >
            Prec
          </button>
          <button
            class="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!searchStore.getCanNext"
            @click="searchStore.setNextPageWithScroll()"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
