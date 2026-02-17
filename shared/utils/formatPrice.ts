export function formatPrice(price: number | null) {
  if (price === null) return 'N/A'
  return price.toFixed(2)
} 