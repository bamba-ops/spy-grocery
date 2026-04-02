import type { SearchProduct } from './index'

export type SearchSort = 'relevance' | 'price_asc' | 'price_desc' | 'title_asc' | 'recent'

export interface ProductsQueryParams {
  q?: string
  store?: string
  sort?: SearchSort
  limit: number
  offset: number
}

export interface SearchParams {
  q?: string
  store?: string
  sort?: SearchSort
  limit?: number
  offset?: number
}

export interface SearchResponse {
  items: SearchProduct[]
  total: number
  page: number
  limit: number
  totalPages: number
}
