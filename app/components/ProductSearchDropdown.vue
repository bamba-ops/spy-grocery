<script setup lang="ts">
import { ArrowRight, Plus, Search } from 'lucide-vue-next'
import type { SearchProduct } from '#shared/types'

const props = withDefaults(defineProps<{
  modelValue: string
  products: SearchProduct[]
  loading: boolean
  error: string | null
  getFormattedPrice: (value: number | null) => string
  maxLength?: number
  placeholder?: string
  submitLabel?: string
  actionLabel?: string
  emptyStateText?: string
  logPrefix?: string
  // Feature flag for rollout: show inline quick-add button in dropdown rows.
  enableQuickAdd?: boolean
}>(), {
  maxLength: 2000,
  placeholder: 'Ex: lait 2%, oeufs, pain complet...',
  submitLabel: 'Rechercher',
  actionLabel: 'Choisir',
  emptyStateText: 'Aucun produit trouve pour cette recherche. Essayez un autre mot-cle.',
  logPrefix: 'search',
  enableQuickAdd: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
  'select-product': [product: SearchProduct]
  'quick-add-product': [product: SearchProduct]
}>()

const { getImageDisplay } = useProducts()
const dropdownContainerRef = ref<HTMLElement | null>(null)
const isDropdownOpen = ref(false)

const hasInput = computed(() => props.modelValue.trim().length > 0)
const hasResults = computed(() => props.products.length > 0)

const showDropdown = computed(() => {
  return isDropdownOpen.value && hasInput.value
})

const showEmptyState = computed(() => {
  return hasInput.value && !props.loading && !props.error && !hasResults.value
})

const getProductImageDisplay = (product: SearchProduct) => {
  return getImageDisplay(product.image_url, product.title)
}

const getPrefixedLog = (message: string) => {
  return `[${props.logPrefix}] ${message}`
}

const setOpenDropdown = (reason: string) => {
  if (isDropdownOpen.value) {
    return
  }

  isDropdownOpen.value = true

  // Debug log intentionally kept while search dropdown behavior is monitored.
  console.log(getPrefixedLog('dropdown opened'), { reason })
}

const setCloseDropdown = (reason: string) => {
  if (!isDropdownOpen.value) {
    return
  }

  isDropdownOpen.value = false

  // Debug log intentionally kept while search dropdown behavior is monitored.
  console.log(getPrefixedLog('dropdown closed'), { reason })
}

const setHandleOutsidePointerDown = (event: PointerEvent) => {
  const target = event.target

  if (!(target instanceof Node)) {
    return
  }

  if (!dropdownContainerRef.value?.contains(target)) {
    setCloseDropdown('outside-click')
  }
}

const setUpdateInput = (value: string) => {
  emit('update:modelValue', value)
}

const setSubmit = () => {
  if (!hasInput.value) {
    return
  }

  setOpenDropdown('submit-search')
  emit('submit')
}

const setSelectProduct = (product: SearchProduct) => {
  setCloseDropdown('result-selected')
  emit('select-product', product)
}

const setQuickAddProduct = (product: SearchProduct) => {
  // Debug log intentionally kept while quick-add behavior is monitored on store pages.
  console.log(getPrefixedLog('quick add triggered'), {
    productId: product.id,
    store: product.store
  })

  emit('quick-add-product', product)
}

watch(
  () => props.modelValue,
  (nextValue) => {
    if (nextValue.trim()) {
      setOpenDropdown('input-change')
      return
    }

    setCloseDropdown('empty-query')
  }
)

onMounted(() => {
  if (!import.meta.client) {
    return
  }

  window.addEventListener('pointerdown', setHandleOutsidePointerDown)
})

onBeforeUnmount(() => {
  if (!import.meta.client) {
    return
  }

  window.removeEventListener('pointerdown', setHandleOutsidePointerDown)
})
</script>

<template>
  <div ref="dropdownContainerRef" class="relative mt-8 max-w-4xl sm:mt-10">
    <form @submit.prevent="setSubmit">
      <div class="rounded-[28px] border border-white/15 bg-black/80 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:flex sm:items-center sm:gap-2 sm:rounded-full">
        <div class="flex items-center gap-2 sm:flex-1">
          <div class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70">
            <Search class="h-4 w-4" />
          </div>

          <input
            :value="modelValue"
            type="text"
            :maxlength="maxLength"
            :placeholder="placeholder"
            class="h-11 min-w-0 w-full bg-transparent px-2 text-sm text-white placeholder:text-white/40 focus:outline-none sm:h-12 sm:text-base"
            @focus="setOpenDropdown('input-focus')"
            @keydown.esc.prevent="setCloseDropdown('escape-key')"
            @input="setUpdateInput(($event.target as HTMLInputElement).value)"
          >
        </div>

        <button
          type="submit"
          class="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40 sm:mt-0 sm:h-12 sm:w-auto sm:px-6"
          :disabled="!hasInput"
        >
          {{ submitLabel }}
          <ArrowRight class="h-4 w-4" />
        </button>
      </div>
    </form>

    <div
      v-if="showDropdown"
      class="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-black/95 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
    >
      <div v-if="loading" class="space-y-2 p-3 sm:p-4">
        <div
          v-for="item in 4"
          :key="`search-skeleton-${item}`"
          class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 animate-pulse"
        >
          <div class="h-12 w-12 shrink-0 rounded-xl bg-white/10"></div>
          <div class="min-w-0 flex-1 space-y-2">
            <div class="h-4 w-3/4 rounded bg-white/10"></div>
            <div class="h-3 w-1/3 rounded bg-white/10"></div>
          </div>
          <div class="h-5 w-14 shrink-0 rounded bg-white/10"></div>
        </div>
      </div>

      <div v-else-if="error" class="px-4 py-5 text-sm text-white/75">
        {{ error }}
      </div>

      <ul v-else-if="hasResults" class="max-h-[56vh] divide-y divide-white/10 overflow-y-auto sm:max-h-[420px]">
        <li v-for="product in products" :key="product.id">
          <div class="flex items-center gap-2 px-2 py-2 sm:px-3">
            <button
              type="button"
              class="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-inset"
              @click="setSelectProduct(product)"
            >
              <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/60">
                <img
                  v-if="getProductImageDisplay(product).type === 'url'"
                  :src="getProductImageDisplay(product).value"
                  :alt="product.title"
                  class="h-full w-full object-contain"
                  loading="lazy"
                >
                <span v-else class="text-xl text-white/70">{{ getProductImageDisplay(product).value }}</span>
              </div>

              <div class="min-w-0 flex-1">
                <p class="truncate font-display text-lg font-semibold italic text-white sm:text-xl">{{ product.title }}</p>
                <p class="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/65">{{ product.store }}</p>
              </div>

              <div class="text-right">
                <p class="font-display text-base font-semibold italic text-white sm:text-lg">${{ getFormattedPrice(product.price_num) }}</p>
                <p class="text-[10px] uppercase tracking-[0.3em] text-white/55">{{ actionLabel }}</p>
              </div>
            </button>

            <button
              v-if="enableQuickAdd"
              type="button"
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              :aria-label="`Ajouter ${product.title} a la liste`"
              @click="setQuickAddProduct(product)"
            >
              <Plus class="h-5 w-5" />
            </button>
          </div>
        </li>
      </ul>

      <div v-else-if="showEmptyState" class="px-4 py-5 text-sm text-white/75">
        {{ emptyStateText }}
      </div>
    </div>
  </div>
</template>
