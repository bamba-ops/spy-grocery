<script setup lang="ts">
import { X, Trash2, Plus, Minus } from 'lucide-vue-next'
import { useListsStore } from '~/stores/lists'

const lists = useListsStore()

</script>

<template>
  <div class="relative z-50">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="lists.isShoppingListDrawerOpen" 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        @click="lists.setShoppingListDrawerClosed()"
      ></div>
    </Transition>

    <!-- Drawer -->
    <Transition
      enter-active-class="transition transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div 
        v-if="lists.isShoppingListDrawerOpen" 
        class="fixed inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/10 bg-black text-white shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
      >
        <div class="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p class="text-[10px] uppercase tracking-[0.35em] text-white/60">Shopping list</p>
            <p class="mt-2 font-display text-2xl font-semibold italic">Compare list</p>
          </div>
          <button
            @click="lists.setShoppingListDrawerClosed()"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4">
          <div v-if="lists.productList.length === 0" class="py-12 text-center text-xs uppercase tracking-[0.35em] text-white/40">
            No items yet
          </div>

          <div v-else class="space-y-6">
            <div v-for="(items, storeName) in lists.groupedItems" :key="storeName" class="space-y-3">
              <div class="flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-white/60">
                <div class="flex items-center gap-2">
                  <div class="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[10px] text-white/60">
                    <img
                      v-if="items[0]?.product.store.image_url"
                      :src="items[0]?.product.store.image_url"
                      :alt="items[0]?.product.store.name"
                      class="h-5 w-5 rounded-full object-contain"
                      loading="lazy"
                    />
                    <span v-else>◎</span>
                  </div>
                  <span>{{ storeName }}</span>
                </div>
                <span>${{ lists.storeTotals[storeName]?.toFixed(2) }}</span>
              </div>

              <div v-for="item in items" :key="item.product.id" class="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div class="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/10 text-white/60">
                  <img
                    v-if="item.product.image_url"
                    :src="item.product.image_url"
                    :alt="item.product.name"
                    class="h-full w-full object-contain"
                    loading="lazy"
                  />
                  <div v-else class="text-2xl">◻</div>
                  <div class="pointer-events-none absolute inset-0 bg-black/35"></div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold italic">{{ item.product.name }}</p>
                  <p class="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/60">
                    ${{ item.product.price?.toFixed(2) ?? 'N/A' }}/EA
                  </p>
                  <div class="mt-3 flex items-center gap-3">
                    <div class="flex items-center rounded-full border border-white/20">
                      <button
                        class="px-2 py-1 text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        @click="lists.setProductQuantityInCurrentList(item.product.id, item.quantity - 1)"
                      >
                        <Minus class="h-3 w-3" />
                      </button>
                      <span class="px-2 text-xs uppercase tracking-[0.3em] text-white/80">{{ item.quantity }}</span>
                      <button
                        class="px-2 py-1 text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        @click="lists.setProductInCurrentList(item.product)"
                      >
                        <Plus class="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      class="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      @click="lists.deleteProductFromCurrentList(item.product.id)"
                    >
                      <Trash2 class="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="border-t border-white/10"></div>
          </div>
        </div>

        <div class="border-t border-white/10 px-5 py-5">
          <div class="flex items-center justify-between text-sm uppercase tracking-[0.35em] text-white/70">
            <span>Total Estimate</span>
            <span class="font-display text-2xl font-semibold italic text-white">${{ lists.grandTotal.toFixed(2) }}</span>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-3">
            <button
              class="cursor-pointer w-full rounded-full border border-white/20 bg-transparent px-4 py-3 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              @click="lists.setClearConfirmModalOpen()"
              :disabled="lists.grandTotal === 0"
            >
              Clear
            </button>
            <button
              :class="[
                'w-full rounded-full border border-white/20 px-4 py-3 text-[10px] uppercase tracking-[0.35em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                lists.justSaved
                  ? 'bg-white text-black shadow-[0_0_26px_rgba(255,255,255,0.35)] animate-pulse'
                  : 'bg-white text-black hover:bg-white/90'
              ]"
              @click="lists.setSaveListModalOpen()"
              :disabled="lists.grandTotal === 0"
            >
              {{ lists.justSaved ? 'Saved' : 'Save list' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
    
    <ConfirmActionModal
      :open="lists.isClearConfirmModalOpen"
      title="Clear list"
      message="Are you sure you want to clear the current list?"
      eyebrow="Clear list"
      confirm-text="Clear"
      cancel-text="Cancel"
      destructive
      @close="lists.setClearConfirmModalClosed"
      @confirm="lists.setClearCurrentList"
    />

    <SaveListModal
      :open="lists.isSaveModalOpen"
      :initial-name="lists.setNameSeed"
      :error-text="lists.lastSaveError"
      @close="lists.setSaveListModalClosed"
      @save="lists.setSaveCurrentList"
    />
  </div>
</template>
