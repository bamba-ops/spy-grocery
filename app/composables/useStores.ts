import type { Store } from '~/types'

export const useStores = () => {
  const fetchStores = async () => {
    const response = await $fetch('/api/stores')
    const stores = (response?.stores || []).map((store: Store) => ({
      id: store.id,
      name: store.name,
      slug: store.slug,
      image_url: store.image_url
    }))

    return stores
  }

  return {
    fetchStores
  }
}
