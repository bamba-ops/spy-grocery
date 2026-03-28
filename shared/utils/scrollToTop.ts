export function scrollToTop() {
  if (import.meta.client) {
    const maybeWindow = (globalThis as { window?: unknown }).window

    if (!maybeWindow || typeof maybeWindow !== 'object') {
      return
    }

    const candidate = maybeWindow as {
      scrollTo?: (options: { top: number; behavior: string }) => void
    }

    if (typeof candidate.scrollTo === 'function') {
      candidate.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}
