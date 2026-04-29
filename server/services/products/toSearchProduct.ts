import type { DbProduct, SearchProduct } from '#shared/types'
import { getIsProductActive } from '#shared/utils/productAvailability'

export const toSearchProduct = (row: DbProduct): SearchProduct => ({
  id: row.id,
  external_id: row.external_id,
  slug: row.slug,
  title_slug: row.title_slug,
  title: row.title || '',
  description: row.description ?? null,
  brand: row.brand,
  store: row.store,
  store_slug: row.store_slug,
  store_id: row.store_id,
  image_url: row.image_url,
  url: row.url,
  uom: row.uom,
  price_num: row.price_num,
  was_price_num: row.was_price_num,
  price_text: row.price_text,
  pre_price_text: row.pre_price_text,
  on_sale: row.on_sale,
  scraped_at: row.scraped_at || null,
  valid_from: row.valid_from || null,
  valid_to: row.valid_to || null,
  is_active: getIsProductActive(row.valid_from, row.valid_to)
})
