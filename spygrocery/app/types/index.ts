import type { Database } from './database.types'

// Database table types
export type DbProduct = Database['public']['Tables']['products']['Row']
export type DbStore = Database['public']['Tables']['stores']['Row']
export type DbPrice = Database['public']['Tables']['prices']['Row']
export type DbLatestPrice = Database['public']['Views']['latest_price']['Row']

// Simple UI types for products with store and price info
export interface Product {
  id: string
  name: string
  brand: string | null
  slug: string
  unit: string | null
  image_url: string | null
  link: string | null
  store: {
    id: string
    name: string
    slug: string
    image_url: string | null
  }
  price: number | null
  price_un: number | null
  price_unit: string | null
  is_promo: boolean | null
}

// Store with selection state
export interface StoreWithSelection extends DbStore {
  selected?: boolean
}

// Search params
export interface SearchParams {
  q?: string
  stores?: string
  sort?: 'price-low' | 'price-high' | 'name'
  limit?: number
  offset?: number
}

// Search response
export interface SearchResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}
