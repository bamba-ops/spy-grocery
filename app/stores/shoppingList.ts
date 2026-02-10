import { defineStore } from 'pinia'
import type { Product } from '~/types'

export interface CartItem {
    product: Product
    quantity: number
}

const STORAGE_KEY = 'spygrocery:shopping-list'
const SAVED_LISTS_KEY = 'spygrocery:saved-lists'

export interface SavedList {
    name: string
    items: CartItem[]
    savedAt: string
}

export const useShoppingListStore = defineStore('shoppingList', {
    state: () => ({
        items: [] as CartItem[],
        isOpen: false,
        justAdded: false,
        justSaved: false,
        lastSavedName: null as string | null
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
        saveList() {
            if (!process.client) return
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: this.items }))
                this.justSaved = true
                setTimeout(() => {
                    this.justSaved = false
                }, 1200)
            } catch {
                // noop
            }
        },

        saveListAs(name: string) {
            if (!process.client) return false

            const trimmed = name.trim()
            if (!trimmed) return false

            try {
                const raw = localStorage.getItem(SAVED_LISTS_KEY)
                const parsed = raw ? JSON.parse(raw) : {}
                const lists: Record<string, SavedList> = (parsed && typeof parsed === 'object') ? parsed : {}

                const savedAt = new Date().toISOString()
                lists[trimmed] = {
                    name: trimmed,
                    items: this.items,
                    savedAt
                }

                localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify(lists))

                this.lastSavedName = trimmed
                this.justSaved = true
                setTimeout(() => {
                    this.justSaved = false
                }, 1200)

                return true
            } catch {
                return false
            }
        },

        getSavedLists(): SavedList[] {
            if (!process.client) return []
            try {
                const raw = localStorage.getItem(SAVED_LISTS_KEY)
                const parsed = raw ? JSON.parse(raw) : {}
                if (!parsed || typeof parsed !== 'object') return []
                return Object.values(parsed as Record<string, SavedList>)
            } catch {
                return []
            }
        },

        loadSavedList(name: string) {
            if (!process.client) return false
            try {
                const raw = localStorage.getItem(SAVED_LISTS_KEY)
                const parsed = raw ? JSON.parse(raw) : {}
                if (!parsed || typeof parsed !== 'object') return false
                const list = (parsed as Record<string, SavedList>)[name]
                if (!list || !Array.isArray(list.items)) return false
                this.items = list.items
                return true
            } catch {
                return false
            }
        },
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
