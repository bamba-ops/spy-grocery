import { fetchProductStoreIds, fetchStores } from '../../repositories/storesRepository'

export const listStores = async (supabase: any) => {
  const [stores, productStoreRows] = await Promise.all([
    fetchStores(supabase),
    fetchProductStoreIds(supabase)
  ])

  const countMap: Record<string, number> = {}
  productStoreRows.forEach((row: { store_id: string | null }) => {
    if (row.store_id) {
      countMap[row.store_id] = (countMap[row.store_id] || 0) + 1
    }
  })

  return stores.map((store: { id: string }) => ({
    ...store,
    product_count: countMap[store.id] || 0
  }))
}
