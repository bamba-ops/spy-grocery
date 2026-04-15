import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  OnboardingState,
  OnboardingStatus,
  UpdateOnboardingPayload
} from '#shared/types/onboarding'
import {
  getCanResumeOnboardingStatus,
  getIsBlockingOnboardingState,
  ONBOARDING_DEFAULT_STEP,
  ONBOARDING_MAX_INTENT_LENGTH,
  ONBOARDING_MAX_STEP
} from '#shared/utils/onboarding'
import { toSlug } from '#shared/utils/toSlug'
import { useOnboardingStorage } from '~/composables/local/useOnboardingStorage'
import { useOnboarding } from '~/composables/api/useOnboarding'
import { useAuthStore } from '~/stores/auth'

export const useOnboardingStore = defineStore('onboarding', () => {
  const onboardingApi = useOnboarding()
  const onboardingStorage = useOnboardingStorage()
  const authStore = useAuthStore()

  const quickPrompts = [
    'lait 2%',
    'oeufs',
    'pain complet',
    'fromage cheddar',
    'yogourt grec'
  ]

  const loading = ref(false)
  const isReady = ref(false)
  const isSaving = ref(false)
  const isGenerating = ref(false)
  const error = ref<string | null>(null)

  const status = ref<OnboardingStatus>('not_started')
  const currentStep = ref(ONBOARDING_DEFAULT_STEP)
  const firstIntent = ref('')
  const selectedStoreSlug = ref<string | null>(null)
  const firstChatSessionId = ref<string | null>(null)
  const hasPreview = ref(false)
  const hasAddedList = ref(false)
  const completedAt = ref<string | null>(null)
  const skippedAt = ref<string | null>(null)

  const getProgressPercent = computed(() => {
    return Math.round((currentStep.value / ONBOARDING_MAX_STEP) * 100)
  })

  const getCanSubmitIntent = computed(() => {
    return firstIntent.value.trim().length > 0 && !isSaving.value && !isGenerating.value
  })

  const getIsBlocking = computed(() => {
    return getIsBlockingOnboardingState(status.value, currentStep.value)
  })

  const getCanResume = computed(() => {
    return getCanResumeOnboardingStatus(status.value)
  })

  const getClampedStep = (value: number) => {
    if (!Number.isInteger(value)) {
      return ONBOARDING_DEFAULT_STEP
    }

    return Math.max(ONBOARDING_DEFAULT_STEP, Math.min(ONBOARDING_MAX_STEP, value))
  }

  const setApplyServerState = (nextState: OnboardingState) => {
    status.value = nextState.status
    currentStep.value = getClampedStep(nextState.current_step)
    firstIntent.value = nextState.first_intent || ''
    selectedStoreSlug.value = nextState.selected_store_slug || null
    firstChatSessionId.value = nextState.first_chat_session_id
    hasPreview.value = nextState.has_preview
    hasAddedList.value = nextState.has_added_list
    completedAt.value = nextState.completed_at
    skippedAt.value = nextState.skipped_at
  }

  const setPersistOnboardingPatch = async (payload: UpdateOnboardingPayload) => {
    if (!authStore.user) {
      return null
    }

    isSaving.value = true

    try {
      // Debug log intentionally kept for onboarding v2 rollout.
      console.log('[onboarding] persist patch:', payload)

      const nextState = await onboardingApi.setOnboardingState(payload)
      setApplyServerState(nextState)
      return nextState
    } catch (persistError) {
      console.error('[onboarding] persist failed:', persistError)
      error.value = 'Impossible d\'enregistrer votre progression pour le moment.'
      return null
    } finally {
      isSaving.value = false
    }
  }

  const setLoadOnboardingState = async (options?: { force?: boolean }) => {
    const force = options?.force === true

    if (loading.value && !force) {
      return
    }

    if (!authStore.isReady) {
      await authStore.initAuth()
    }

    if (!authStore.user) {
      isReady.value = true
      return
    }

    loading.value = true
    error.value = null

    try {
      const nextState = await onboardingApi.getOnboardingState()
      setApplyServerState(nextState)
      console.log('[onboarding] state loaded:', {
        status: nextState.status,
        currentStep: nextState.current_step,
        selectedStoreSlug: nextState.selected_store_slug
      })
    } catch (loadError) {
      console.error('[onboarding] load failed:', loadError)
      error.value = 'Impossible de charger votre parcours de demarrage.'
    } finally {
      loading.value = false
      isReady.value = true
    }
  }

  const setIntent = (value: string) => {
    firstIntent.value = value
  }

  const setUseQuickPrompt = (prompt: string) => {
    firstIntent.value = prompt
  }

  const setConsumeHeroPrompt = () => {
    const heroPrompt = onboardingStorage.getOnboardingHeroPrompt()
    onboardingStorage.deleteOnboardingHeroPrompt()

    if (!heroPrompt) {
      return false
    }

    if (!firstIntent.value.trim()) {
      firstIntent.value = heroPrompt
      return true
    }

    return false
  }

  const setStartOnboardingStep = async (intent: string) => {
    const normalizedIntent = intent.trim().slice(0, ONBOARDING_MAX_INTENT_LENGTH)
    firstIntent.value = normalizedIntent
    status.value = 'in_progress'
    currentStep.value = ONBOARDING_DEFAULT_STEP
    selectedStoreSlug.value = null
    error.value = null

    await setPersistOnboardingPatch({
      status: 'in_progress',
      current_step: ONBOARDING_DEFAULT_STEP,
      first_intent: normalizedIntent,
      selected_store_slug: null,
      skipped_at: null
    })
  }

  const setMoveToStoreStep = async (storeSlug: string, firstIntentOverride?: string | null) => {
    const normalizedStoreSlug = toSlug(storeSlug)
    const normalizedFirstIntent = typeof firstIntentOverride === 'string'
      ? firstIntentOverride.trim().slice(0, ONBOARDING_MAX_INTENT_LENGTH)
      : ''

    if (!normalizedStoreSlug) {
      error.value = 'Impossible de determiner le magasin pour poursuivre le parcours.'
      return false
    }

    status.value = 'in_progress'
    currentStep.value = 2
    selectedStoreSlug.value = normalizedStoreSlug

    // When step 1 ends on a selected product, keep its title as canonical first intent.
    if (normalizedFirstIntent) {
      firstIntent.value = normalizedFirstIntent
    }

    error.value = null

    console.log('[onboarding] step 2 reached for store:', {
      storeSlug: normalizedStoreSlug,
      firstIntent: normalizedFirstIntent || firstIntent.value || null
    })

    const patchPayload: UpdateOnboardingPayload = {
      status: 'in_progress',
      current_step: 2,
      selected_store_slug: normalizedStoreSlug,
      skipped_at: null
    }

    if (normalizedFirstIntent) {
      patchPayload.first_intent = normalizedFirstIntent
    }

    await setPersistOnboardingPatch(patchPayload)

    return true
  }

  const setAdvanceToStepThree = async () => {
    status.value = 'in_progress'
    currentStep.value = ONBOARDING_MAX_STEP
    error.value = null

    console.log('[onboarding] step 3 reached')

    await setPersistOnboardingPatch({
      status: 'in_progress',
      current_step: ONBOARDING_MAX_STEP,
      skipped_at: null
    })
  }

  const setCompleteOnboarding = async () => {
    const completedAtIso = new Date().toISOString()

    status.value = 'completed'
    currentStep.value = ONBOARDING_MAX_STEP
    completedAt.value = completedAtIso
    skippedAt.value = null
    error.value = null

    console.log('[onboarding] completed')

    await setPersistOnboardingPatch({
      status: 'completed',
      current_step: ONBOARDING_MAX_STEP,
      completed_at: completedAtIso,
      skipped_at: null
    })
  }

  const setSkipForNow = async () => {
    const skippedAtIso = new Date().toISOString()

    status.value = 'skipped'
    skippedAt.value = skippedAtIso
    error.value = null

    console.log('[onboarding] skipped by user')

    await setPersistOnboardingPatch({
      status: 'skipped',
      skipped_at: skippedAtIso
    })

    await navigateTo('/search')
  }

  const setResumeOnboarding = async () => {
    status.value = 'in_progress'
    currentStep.value = ONBOARDING_DEFAULT_STEP
    skippedAt.value = null
    completedAt.value = null
    selectedStoreSlug.value = null
    error.value = null

    console.log('[onboarding] resumed from skipped')

    await setPersistOnboardingPatch({
      status: 'in_progress',
      current_step: ONBOARDING_DEFAULT_STEP,
      skipped_at: null,
      completed_at: null,
      selected_store_slug: null
    })

    await navigateTo('/onboarding')
  }

  const setContinueToSearch = async () => {
    await navigateTo('/search')
  }

  // Compatibility method kept while frontend AI component is still in codebase.
  const setCompleteFromChatSession = async (_chatId: string | null) => {
    return false
  }

  return {
    quickPrompts,
    loading,
    isReady,
    isSaving,
    isGenerating,
    error,
    status,
    currentStep,
    firstIntent,
    selectedStoreSlug,
    firstChatSessionId,
    hasPreview,
    hasAddedList,
    completedAt,
    skippedAt,
    getProgressPercent,
    getCanSubmitIntent,
    getIsBlocking,
    getCanResume,
    setLoadOnboardingState,
    setIntent,
    setUseQuickPrompt,
    setConsumeHeroPrompt,
    setStartOnboardingStep,
    setMoveToStoreStep,
    setAdvanceToStepThree,
    setCompleteOnboarding,
    setSkipForNow,
    setResumeOnboarding,
    setContinueToSearch,
    setCompleteFromChatSession
  }
})
