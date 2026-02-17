import type { Product } from '#shared/types'

export interface ListProduct {
  product: Product
  quantity: number
}

export interface ListsProduct {
  id: string
  name: string
  items: ListProduct[]
  createdAt: Date
  updatedAt: Date
}
