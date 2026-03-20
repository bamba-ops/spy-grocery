export interface ProductStoreRow {
  store: string
  store_id: string | null
}

const STORE_ROWS_PAGE_SIZE = 1000

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
