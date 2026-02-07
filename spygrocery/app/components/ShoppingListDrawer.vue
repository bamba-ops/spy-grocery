<script setup lang="ts">
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-vue-next'
import { useShoppingListStore } from '~/stores/shoppingList'

const store = useShoppingListStore()
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
        v-if="store.isOpen" 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        @click="store.closeDrawer()"
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
        v-if="store.isOpen" 
        class="fixed inset-y-0 right-0 flex w-full max-w-md flex-col border-l-4 border-black bg-white shadow-[-6px_0_0_#000] sm:max-w-lg"
      >
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b-4 border-black bg-[#39FF14] p-4">
          <div class="flex items-center gap-2">
            <ShoppingBag :size="24" :stroke-width="3" />
            <h2 class="text-xl font-black uppercase italic tracking-tighter text-black">Your List</h2>
            <span class="rounded-full border-2 border-black bg-white px-2 py-0.5 text-xs font-black">{{ store.itemCount }}</span>
          </div>
          <button 
            @click="store.closeDrawer()"
            class="flex h-10 w-10 items-center justify-center border-2 border-black bg-white transition hover:bg-black hover:text-white"
          >
            <X :size="24" :stroke-width="3" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <div v-if="store.items.length === 0" class="flex h-full flex-col items-center justify-center text-center opacity-50">
            <ShoppingBag :size="64" :stroke-width="2" class="mb-4" />
            <p class="text-xl font-black uppercase">Your list is empty</p>
            <p class="mt-2 text-sm font-bold uppercase">Start adding products to build your cart</p>
          </div>

          <div v-else class="space-y-8">
            <!-- Store Group -->
            <div v-for="(items, storeName) in store.groupedItems" :key="storeName" class="border-4 border-black bg-white shadow-[6px_6px_0_#000]">
              <!-- Store Header -->
              <div class="border-b-4 border-black bg-[#E5E5DC] p-3">
                <h3 class="flex items-center justify-between text-lg font-black uppercase tracking-wide">
                  <span>{{ storeName }}</span>
                  <span class="text-base">${{ store.storeTotals[storeName]?.toFixed(2) }}</span>
                </h3>
              </div>

              <!-- Items -->
              <div class="divide-y-2 divide-black">
                <div v-for="item in items" :key="item.product.id" class="flex gap-4 p-3">
                  <!-- Image -->
                  <div class="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-black bg-white">
                    <span class="text-2xl">🥛</span>
                  </div>

                  <!-- Info -->
                  <div class="flex flex-1 flex-col justify-between">
                    <div>
                      <h4 class="text-sm font-black uppercase leading-tight">{{ item.product.name }}</h4>
                      <p class="text-[10px] font-bold uppercase text-gray-500">{{ item.product.brand }} • {{ item.product.unit }}</p>
                    </div>
                    
                    <div class="flex items-center justify-between mt-2">
                      <div class="font-black text-black">${{ (item.product.price * item.quantity).toFixed(2) }}</div>
                      
                      <!-- Controls -->
                      <div class="flex items-center border-2 border-black bg-white">
                        <button 
                          @click="store.updateQuantity(item.product.id, item.quantity - 1)"
                          class="px-2 py-1 hover:bg-gray-100"
                        >
                          <Minus :size="12" :stroke-width="4" />
                        </button>
                        <span class="px-2 text-xs font-black">{{ item.quantity }}</span>
                        <button 
                          @click="store.addItem(item.product)"
                          class="px-2 py-1 hover:bg-gray-100"
                        >
                          <Plus :size="12" :stroke-width="4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t-4 border-black bg-white p-4 sm:p-6">
          <div class="mb-4 flex items-center justify-between text-xl font-black uppercase italic tracking-tighter">
            <span>Total Estimate</span>
            <span>${{ store.grandTotal.toFixed(2) }}</span>
          </div>
          <button class="w-full border-4 border-black bg-black py-4 text-center text-sm font-black uppercase tracking-wider text-[#39FF14] shadow-[4px_4px_0_#39FF14] transition hover:-translate-y-1 hover:shadow-[6px_6px_0_#39FF14]">
            Checkout Strategy
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
