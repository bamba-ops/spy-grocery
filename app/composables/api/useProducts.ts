import type { SearchParams, SearchResponse } from '#shared/types/search'
import type { ProductDetailsByRouteResponse, ProductDetailsResponse } from '#shared/types/product-details'

const fallbackEmojis: string[] = ['🥛', '🍞', '🥚', '🍎', '🥗', '🧀', '🥩', '🍕', '🥤', '🍌']

export const useProducts = () => {
  const search = async (params: SearchParams): Promise<SearchResponse> => {
    return $fetch<SearchResponse>('/api/products/search' as string, {
      query: params
    })
  }

  const getBySlug = async (slug: string): Promise<ProductDetailsResponse> => {
    return $fetch<ProductDetailsResponse>(`/api/products/${encodeURIComponent(slug)}` as string)
  }

  const getByRoute = async (
    storeSlug: string,
    productSlug: string
  ): Promise<ProductDetailsByRouteResponse> => {
    return $fetch<ProductDetailsByRouteResponse>(
      `/api/products/route/${encodeURIComponent(storeSlug)}/${encodeURIComponent(productSlug)}` as string
    )
  }

  const getImageDisplay = (imageUrl: string | null, productTitle?: string) => {
    if (imageUrl && imageUrl.trim() !== '') {
      return {
        type: 'url' as const,
        value: imageUrl
      }
    }

    let emojiIndex = 0
    if (productTitle) {
      const hash = productTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      emojiIndex = hash % fallbackEmojis.length
    } else {
      emojiIndex = Math.floor(Math.random() * fallbackEmojis.length)
    }

    return {
      type: 'emoji' as const,
      value: fallbackEmojis[emojiIndex] || '🍽️'
    }
  }

  return {
    search,
    getBySlug,
    getByRoute,
    getImageDisplay
  }
}
