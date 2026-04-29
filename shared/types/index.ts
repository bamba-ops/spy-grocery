import type { Database } from './database.types'

export type DbProduct = Database['public']['Tables']['products']['Row']
export type DbProductPrice = Database['public']['Tables']['product_prices']['Row']

export interface SearchProduct {
  id: string
  external_id?: string | null
  slug: string
  title_slug?: string | null
  title: string
  description?: string | null
  brand: string | null
  store: string
  store_slug?: string | null
  store_id: string | null
  image_url: string | null
  url: string | null
  uom: string | null
  price_num: number | null
  was_price_num: number | null
  price_text: string | null
  pre_price_text: string | null
  on_sale: boolean | null
  scraped_at: string | null
  valid_from: string | null
  valid_to: string | null
  is_active: boolean
}

// Temporary alias to ease migration in stores/components.
export type Product = SearchProduct

export interface StoreFacet {
  id: string
  store_id: string | null
  name: string
  slug: string
  product_count: number
}

export interface StoreOverviewResponse {
  store: {
    slug: string
    name: string
    productCount: number
    activeSpecialsCount: number
    lastUpdatedAt: string | null
  }
  latestPromos: SearchProduct[]
  bestProducts: SearchProduct[]
}
