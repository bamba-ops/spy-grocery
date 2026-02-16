import type { Product } from '#shared/types'

export interface CartItem {
  product: Product
  quantity: number
}

export interface SavedList {
  name: string
  items: CartItem[]
  savedAt: string
}
