export type AiReferralSource =
  | 'chatgpt'
  | 'openai'
  | 'copilot'
  | 'perplexity'
  | 'claude'
  | 'gemini'
  | 'poe'
  | 'you'
  | 'phind'
  | 'grok'

export interface AiReferralContext {
  isAiReferral: boolean
  aiSource: AiReferralSource | null
  referrerDomain: string | null
  referrerUrl: string | null
  landingPath: string | null
  landingUrl: string | null
  utmSource: string | null
  utmMedium: string | null
}

interface DetectAiReferralParams {
  referrer?: string | null
  currentUrl?: string | null
}

const AI_SOURCE_PATTERNS: Array<{ source: AiReferralSource, patterns: string[] }> = [
  { source: 'chatgpt', patterns: ['chatgpt', 'chat.openai.com'] },
  { source: 'openai', patterns: ['openai'] },
  { source: 'copilot', patterns: ['copilot', 'bing.com/chat', 'microsoft.com/copilot'] },
  { source: 'perplexity', patterns: ['perplexity'] },
  { source: 'claude', patterns: ['claude', 'anthropic'] },
  { source: 'gemini', patterns: ['gemini', 'bard.google', 'google_ai', 'google-ai'] },
  { source: 'poe', patterns: ['poe.com', 'poe'] },
  { source: 'you', patterns: ['you.com'] },
  { source: 'phind', patterns: ['phind'] },
  { source: 'grok', patterns: ['grok', 'x.ai'] }
]

const getSafeUrl = (value: string | null | undefined) => {
  const trimmed = value?.trim()

  if (!trimmed) {
    return null
  }

  try {
    return new URL(trimmed)
  } catch {
    return null
  }
}

const getSafeDomain = (value: string | null | undefined) => {
  const parsedUrl = getSafeUrl(value)
  return parsedUrl?.hostname.replace(/^www\./, '').toLowerCase() || null
}

const getNormalizedText = (value: string | null | undefined) => {
  return (value || '').trim().toLowerCase()
}

const detectAiSource = (...values: Array<string | null | undefined>): AiReferralSource | null => {
  const haystack = values.map(getNormalizedText).filter(Boolean).join(' ')

  if (!haystack) {
    return null
  }

  const match = AI_SOURCE_PATTERNS.find(({ patterns }) =>
    patterns.some((pattern) => haystack.includes(pattern))
  )

  return match?.source || null
}

export const detectAiReferral = ({
  referrer,
  currentUrl
}: DetectAiReferralParams): AiReferralContext => {
  const current = getSafeUrl(currentUrl)
  const referrerDomain = getSafeDomain(referrer)
  const utmSource = current?.searchParams.get('utm_source')?.trim() || null
  const utmMedium = current?.searchParams.get('utm_medium')?.trim() || null
  const source = detectAiSource(referrerDomain, referrer, utmSource, utmMedium)

  return {
    isAiReferral: Boolean(source),
    aiSource: source,
    referrerDomain,
    referrerUrl: referrer?.trim() || null,
    landingPath: current ? `${current.pathname}${current.search}` : null,
    landingUrl: current?.toString() || currentUrl?.trim() || null,
    utmSource,
    utmMedium
  }
}
