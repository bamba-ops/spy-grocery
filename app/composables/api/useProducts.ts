import type { SearchParams } from '#shared/types/search'
import type { Product } from '#shared/types'

const fallbackEmojis: string[] = ['🥛', '🍞', '🥚', '🍎', '🥗', '🧀', '🥩', '🍕', '🥤', '🍌']

export const useProducts = () => {
  const search = async (params: SearchParams) => {
    return $fetch('/api/products/search', {
      query: params
    })
  }

  const getFeaturedProducts = async (ids: string[]) => {
    return $fetch<{ products: Product[] }>('/api/products/featured', {
      query: {
        ids
      }
    })
  }

  const getImageDisplay = (imageUrl: string | null, productName?: string) => {
    if (imageUrl && imageUrl.trim() !== '') {
      return {
        type: 'url' as const,
        value: imageUrl
      }
    }

    let emojiIndex = 0
    if (productName) {
      const hash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
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
    getFeaturedProducts,
    getImageDisplay
  }
}
