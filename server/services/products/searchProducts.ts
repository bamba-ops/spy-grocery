import type { DbProduct, SearchProduct } from '#shared/types'
import type { SearchSort } from '#shared/types/search'
import { searchProductsRows } from '../../repositories/productsRepository'

interface SearchProductsParams {
  supabase: any
  searchQuery: string
  store: string
  sortBy: SearchSort
  limit: number
  offset: number
}

const toPagination = (offset: number, limit: number, total: number) => ({
  page: Math.floor(offset / limit) + 1,
  limit,
  totalPages: Math.ceil(total / limit)
})

const toSearchProduct = (row: DbProduct): SearchProduct => ({
  id: row.id,
  slug: row.slug,
  title: row.title || '',
  description: row.description ?? null,
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

export const searchProducts = async ({
  supabase,
  searchQuery,
  store,
  sortBy,
  limit,
  offset
}: SearchProductsParams) => {
  const { rows, count } = await searchProductsRows(supabase, {
    searchQuery,
    store,
    sortBy,
    limit,
    offset
  })

  const items = rows.map(toSearchProduct)

  return {
    items,
    total: count,
    ...toPagination(offset, limit, count)
  }
}
