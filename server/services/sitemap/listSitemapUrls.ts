import type { SitemapUrlInput } from '#sitemap/types'
import type { SitemapProductRow } from '../../repositories/sitemapRepository'
import { fetchSitemapProductRows } from '../../repositories/sitemapRepository'

const STATIC_PATHS = ['/', '/privacy', '/terms', '/licenses']

const getTimestamp = (value: string | null | undefined) => {
  if (!value) {
    return 0
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const getCanonicalProductPath = (row: SitemapProductRow) => {
  if (row.store_slug && row.title_slug && row.external_id) {
    const productSlug = `${row.title_slug}-${row.external_id}`
    return `/produits/${encodeURIComponent(row.store_slug)}/${encodeURIComponent(productSlug)}`
  }

  return `/products/${encodeURIComponent(row.slug)}`
}

const getGlobalLastmod = (rows: SitemapProductRow[]) => {
  let lastmod: string | null = null
  let latestTimestamp = 0

  rows.forEach((row) => {
    const timestamp = getTimestamp(row.scraped_at)
    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp
      lastmod = row.scraped_at
    }
  })

  return lastmod
}

const getStoreLastmodEntries = (rows: SitemapProductRow[]) => {
  const storeMap = new Map<string, { loc: string, lastmod: string | null }>()

  rows.forEach((row) => {
    const storeSlug = row.store_slug?.trim()
    if (!storeSlug) {
      return
    }

    const loc = `/magasins/${encodeURIComponent(storeSlug)}`
    const existing = storeMap.get(storeSlug)

    if (!existing) {
      storeMap.set(storeSlug, {
        loc,
        lastmod: row.scraped_at || null
      })
      return
    }

    const incomingTimestamp = getTimestamp(row.scraped_at)
    const existingTimestamp = getTimestamp(existing.lastmod)

    if (incomingTimestamp > existingTimestamp) {
      existing.lastmod = row.scraped_at || null
    }
  })

  return Array.from(storeMap.values())
    .sort((a, b) => a.loc.localeCompare(b.loc))
    .map((entry) => ({
      loc: entry.loc,
      lastmod: entry.lastmod || undefined
    }))
}

const getProductEntries = (rows: SitemapProductRow[]) => {
  const productMap = new Map<string, string | undefined>()

  rows.forEach((row) => {
    const loc = getCanonicalProductPath(row)
    const lastmod = row.scraped_at || undefined
    const existing = productMap.get(loc)

    if (!existing) {
      productMap.set(loc, lastmod)
      return
    }

    if (getTimestamp(lastmod) > getTimestamp(existing)) {
      productMap.set(loc, lastmod)
    }
  })

  return Array.from(productMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([loc, lastmod]) => ({ loc, lastmod }))
}

export const listSitemapUrls = async (supabase: any): Promise<SitemapUrlInput[]> => {
  const productRows = await fetchSitemapProductRows(supabase)
  const globalLastmod = getGlobalLastmod(productRows)

  const staticEntries: SitemapUrlInput[] = STATIC_PATHS.map((loc) => ({
    loc,
    lastmod: loc === '/' ? globalLastmod || undefined : undefined
  }))

  const storeEntries = getStoreLastmodEntries(productRows)
  const productEntries = getProductEntries(productRows)

  return [
    ...staticEntries,
    ...storeEntries,
    ...productEntries
  ]
}
