import type { Product } from './index'

export type SearchSort = 'price-low' | 'price-high' | 'name'

export interface ProductsQueryParams {
  q: string
  stores?: string
  sort?: SearchSort
  promos?: 'true' | 'false'
  dedupe?: 'true' | 'false'
  limit: number
  offset: number
}

export interface SearchParams {
  q?: string
  stores?: string
  sort?: SearchSort
  promos?: 'true' | 'false'
  dedupe?: 'true' | 'false'
  limit?: number
  offset?: number
}

export interface SearchResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}
