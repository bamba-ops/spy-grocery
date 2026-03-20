import { toSlug } from '#shared/utils/toSlug'
import { fetchProductStoreRows } from '../../repositories/storesRepository'

interface StoreFacet {
  id: string
  store_id: string | null
  name: string
  slug: string
  product_count: number
}

export const listStores = async (supabase: any) => {
  const rows = await fetchProductStoreRows(supabase)

  const map = new Map<string, StoreFacet>()

  rows.forEach((row) => {
    if (!row.store) return

    const name = row.store.trim()
    if (!name) return

    const slug = toSlug(name)
    const id = row.store_id || slug
    const key = `${row.store_id || 'null'}:${name}`
    const current = map.get(key)

    if (!current) {
      map.set(key, {
        id,
        store_id: row.store_id,
        name,
        slug,
        product_count: 1
      })
      return
    }

    current.product_count += 1
  })

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}
