import type { DbProduct } from '#shared/types'

export interface ProductStoreRow {
  store: string
  store_id: string | null
}

const STORE_ROWS_PAGE_SIZE = 1000
const STORE_PRODUCTS_PAGE_SIZE = 500

const STORE_PRODUCT_FIELDS = [
  'id',
  'external_id',
  'slug',
  'title_slug',
  'title',
  'description',
  'brand',
  'store',
  'store_slug',
  'store_id',
  'image_url',
  'url',
  'uom',
  'price_num',
  'was_price_num',
  'price_text',
  'pre_price_text',
  'on_sale',
  'scraped_at',
  'valid_from',
  'valid_to'
].join(',')

export const fetchProductStoreRows = async (supabase: any): Promise<ProductStoreRow[]> => {
  const rows: ProductStoreRow[] = []
  let from = 0

  while (true) {
    const to = from + STORE_ROWS_PAGE_SIZE - 1
    const { data, error } = await supabase
      .from('products')
      .select('store, store_id')
      .order('id', { ascending: true })
      .range(from, to)

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch stores from products: ${error.message}`
      })
    }

    const page = (data || []) as ProductStoreRow[]
    if (page.length === 0) {
      break
    }

    rows.push(...page)

    if (page.length < STORE_ROWS_PAGE_SIZE) {
      break
    }

    from += STORE_ROWS_PAGE_SIZE
  }

  return rows
}

export const fetchStoreProductRowsByStoreSlug = async (
  supabase: any,
  storeSlug: string
): Promise<DbProduct[]> => {
  const rows: DbProduct[] = []
  let from = 0

  while (true) {
    const to = from + STORE_PRODUCTS_PAGE_SIZE - 1
    const { data, error } = await supabase
      .from('products')
      .select(STORE_PRODUCT_FIELDS)
      .eq('store_slug', storeSlug)
      .order('id', { ascending: true })
      .range(from, to)

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch store products: ${error.message}`
      })
    }

    const page = (data || []) as DbProduct[]
    if (page.length === 0) {
      break
    }

    rows.push(...page)

    if (page.length < STORE_PRODUCTS_PAGE_SIZE) {
      break
    }

    from += STORE_PRODUCTS_PAGE_SIZE
  }

  return rows
}
