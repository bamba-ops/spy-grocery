export interface SitemapProductRow {
  slug: string
  store_slug: string | null
  title_slug: string | null
  external_id: string
  scraped_at: string
  price_num: number | null
  valid_from: string | null
  valid_to: string | null
}

const SITEMAP_ROWS_PAGE_SIZE = 1000

export const fetchSitemapProductRows = async (supabase: any): Promise<SitemapProductRow[]> => {
  const rows: SitemapProductRow[] = []
  let from = 0

  while (true) {
    const to = from + SITEMAP_ROWS_PAGE_SIZE - 1
    const { data, error } = await supabase
      .from('products')
      .select('slug,store_slug,title_slug,external_id,scraped_at,price_num,valid_from,valid_to')
      .order('id', { ascending: true })
      .range(from, to)

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Failed to fetch sitemap products: ${error.message}`
      })
    }

    const page = (data || []) as SitemapProductRow[]
    if (page.length === 0) {
      break
    }

    rows.push(...page)

    if (page.length < SITEMAP_ROWS_PAGE_SIZE) {
      break
    }

    from += SITEMAP_ROWS_PAGE_SIZE
  }

  return rows
}
