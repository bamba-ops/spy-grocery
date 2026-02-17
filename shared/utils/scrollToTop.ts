export function scrollToTop() {
  if (process.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
} 