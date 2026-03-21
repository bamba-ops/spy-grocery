import type { DbProduct, SearchProduct } from '#shared/types'
import type { SearchSort } from '#shared/types/search'
import { searchProductsRows } from './productsRepository'

interface SearchChatProductsParams {
  q?: string
  store?: string
  sort?: SearchSort
  limit?: number
  offset?: number
}

const SEARCH_LIMIT_DEFAULT = 20
const SEARCH_LIMIT_MAX = 100

const toSearchProduct = (row: DbProduct): SearchProduct => ({
  id: row.id,
  slug: row.slug,
  title: row.title || '',
  brand: row.brand,
  store: row.store,
  store_id: row.store_id,
  image_url: row.image_url,
  url: row.url,
  uom: row.uom,
  price_num: row.price_num,
  was_price_num: row.was_price_num,
  price_text: row.price_text,
  pre_price_text: row.pre_price_text,
  on_sale: row.on_sale,
  scraped_at: row.scraped_at || null
})

export const searchChatProducts = async (supabase: any, params: SearchChatProductsParams) => {
  const limit = Math.min(Math.max(params.limit || SEARCH_LIMIT_DEFAULT, 1), SEARCH_LIMIT_MAX)
  const offset = Math.max(params.offset || 0, 0)

  const { rows, count } = await searchProductsRows(supabase, {
    searchQuery: params.q?.trim() || '',
    store: params.store?.trim() || 'all',
    sortBy: params.sort || 'price_asc',
    limit,
    offset
  })

  return {
    items: rows.map(toSearchProduct),
    total: count,
    page: Math.floor(offset / limit) + 1,
    limit,
    totalPages: Math.ceil(count / limit)
  }
}
