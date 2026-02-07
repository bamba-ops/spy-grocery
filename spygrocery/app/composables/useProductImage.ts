export const useProductImage = () => {
  const fallbackEmojis = ['🥛', '🍞', '🥚', '🍎', '🥗', '🧀', '🥩', '🍕', '🥤', '🍌']

  const getImageDisplay = (imageUrl: string | null, productName?: string) => {
    // If we have a valid image URL, use it
    if (imageUrl && imageUrl.trim() !== '') {
      return {
        type: 'url' as const,
        value: imageUrl
      }
    }

    // Pick emoji based on product name hash for consistency
    let emojiIndex = 0
    if (productName) {
      const hash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      emojiIndex = hash % fallbackEmojis.length
    } else {
      emojiIndex = Math.floor(Math.random() * fallbackEmojis.length)
    }

    return {
      type: 'emoji' as const,
      value: fallbackEmojis[emojiIndex]
    }
  }

  return {
    getImageDisplay
  }
}
