import { ONBOARDING_MAX_INTENT_LENGTH } from '#shared/utils/onboarding'

const ONBOARDING_HERO_PROMPT_STORAGE_KEY = 'spygrocery:onboarding:hero-prompt'

const getNormalizedPrompt = (value: string) => {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  return trimmed.slice(0, ONBOARDING_MAX_INTENT_LENGTH)
}

export const useOnboardingStorage = () => {
  const getOnboardingHeroPrompt = () => {
    if (!import.meta.client) {
      return null
    }

    const storedPrompt = window.sessionStorage.getItem(ONBOARDING_HERO_PROMPT_STORAGE_KEY)

    if (!storedPrompt) {
      return null
    }

    const normalizedPrompt = getNormalizedPrompt(storedPrompt)

    return normalizedPrompt || null
  }

  const setOnboardingHeroPrompt = (value: string) => {
    if (!import.meta.client) {
      return false
    }

    const normalizedPrompt = getNormalizedPrompt(value)

    if (!normalizedPrompt) {
      window.sessionStorage.removeItem(ONBOARDING_HERO_PROMPT_STORAGE_KEY)
      return false
    }

    window.sessionStorage.setItem(ONBOARDING_HERO_PROMPT_STORAGE_KEY, normalizedPrompt)
    return true
  }

  const deleteOnboardingHeroPrompt = () => {
    if (!import.meta.client) {
      return false
    }

    window.sessionStorage.removeItem(ONBOARDING_HERO_PROMPT_STORAGE_KEY)
    return true
  }

  return {
    getOnboardingHeroPrompt,
    setOnboardingHeroPrompt,
    deleteOnboardingHeroPrompt
  }
}
