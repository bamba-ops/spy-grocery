import { defineStore } from 'pinia'
import type { Product } from '~/types'

export interface CartItem {
    product: Product
    quantity: number
}

export const useShoppingListStore = defineStore('shoppingList', {
    state: () => ({
        items: [] as CartItem[],
        isOpen: false,
        justAdded: false
    }),

    getters: {
        // Group items by store name
        groupedItems: (state) => {
            const groups: Record<string, CartItem[]> = {}
            state.items.forEach(item => {
                const store = item.product.store.name
                if (!groups[store]) {
                    groups[store] = []
                }
                groups[store].push(item)
            })
            return groups
        },

        // Calculate total cost per store
        storeTotals: (state) => {
            const totals: Record<string, number> = {}
            state.items.forEach(item => {
                const store = item.product.store.name
                if (!totals[store]) {
                    totals[store] = 0
                }
                const price = item.product.price || 0
                totals[store] += price * item.quantity
            })
            return totals
        },

        // Total cost of all items
        grandTotal: (state) => {
            return state.items.reduce((total, item) => {
                const price = item.product.price || 0
                return total + (price * item.quantity)
            }, 0)
        },

        // Total item count
        itemCount: (state) => {
            return state.items.reduce((total, item) => total + item.quantity, 0)
        }
    },

    actions: {
        addItem(product: Product) {
            const existingItem = this.items.find(item => item.product.id === product.id)
            if (existingItem) {
                existingItem.quantity++
            } else {
                this.items.push({ product, quantity: 1 })
            }

            // Trigger animation state
            this.justAdded = true
            setTimeout(() => {
                this.justAdded = false
            }, 300)
        },

        removeItem(productId: string) {
            const index = this.items.findIndex(item => item.product.id === productId)
            if (index !== -1) {
                this.items.splice(index, 1)
            }
        },

        updateQuantity(productId: string, quantity: number) {
            const item = this.items.find(item => item.product.id === productId)
            if (item) {
                item.quantity = quantity
                if (item.quantity <= 0) {
                    this.removeItem(productId)
                }
            }
        },

        toggleDrawer() {
            this.isOpen = !this.isOpen
        },

        closeDrawer() {
            this.isOpen = false
        },

        clearList() {
            this.items = []
        }
    }
})
