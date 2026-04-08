import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ListProduct } from '#shared/types/lists'
import type {
  OnboardingState,
  OnboardingStatus,
  UpdateOnboardingPayload
} from '#shared/types/onboarding'
import {
  getCanResumeOnboardingStatus,
  getIsBlockingOnboardingState,
  ONBOARDING_DEFAULT_STEP,
  ONBOARDING_FIRST_SESSION_TITLE,
  ONBOARDING_MAX_INTENT_LENGTH,
  ONBOARDING_MAX_STEP
} from '#shared/utils/onboarding'
import { useOnboardingStorage } from '~/composables/local/useOnboardingStorage'
import { useChat } from '~/composables/api/useChat'
import { useChatSessions } from '~/composables/api/useChatSessions'
import { useOnboarding } from '~/composables/api/useOnboarding'
import { useAuthStore } from '~/stores/auth'
import { useListsStore } from '~/stores/lists'

export const useOnboardingStore = defineStore('onboarding', () => {
  const onboardingApi = useOnboarding()
  const onboardingStorage = useOnboardingStorage()
  const { chat, sendMessage, getLatestAssistantListPayload } = useChat()
  const chatSessionsApi = useChatSessions()
  const authStore = useAuthStore()
  const listsStore = useListsStore()

  const quickPrompts = [
    'Un souper sain pour deux sous 40$',
    'Preparation de repas proteines pour la semaine',
    'Collations sans gluten pour la route'
  ]

  const loading = ref(false)
  const isReady = ref(false)
  const isSaving = ref(false)
  const isGenerating = ref(false)
  const error = ref<string | null>(null)

  const status = ref<OnboardingStatus>('not_started')
  const currentStep = ref(ONBOARDING_DEFAULT_STEP)
  const firstIntent = ref('')
  const firstChatSessionId = ref<string | null>(null)
  const hasPreview = ref(false)
  const hasAddedList = ref(false)
  const completedAt = ref<string | null>(null)
  const skippedAt = ref<string | null>(null)
  const generatedItems = ref<ListProduct[]>([])

  const getProgressPercent = computed(() => {
    return Math.round((currentStep.value / ONBOARDING_MAX_STEP) * 100)
  })

  const getCanSubmitIntent = computed(() => {
    return firstIntent.value.trim().length > 0 && !isGenerating.value && !isSaving.value
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

    try {
      const nextState = await onboardingApi.setOnboardingState(payload)
      setApplyServerState(nextState)
      return nextState
    } catch (persistError) {
      console.error('[onboarding] save failed:', persistError)
      error.value = 'Impossible d\'enregistrer la progression du parcours de demarrage.'
      return null
    }
  }

  const setHydratePreviewFromSession = async () => {
    if (!firstChatSessionId.value) {
      return
    }

    try {
      const session = await chatSessionsApi.getChatSessionById(firstChatSessionId.value)
      chat.messages = Array.isArray(session.messages_json) ? session.messages_json : []

      const latestPayload = getLatestAssistantListPayload(chat.messages)

      if (!latestPayload || latestPayload.items.length === 0) {
        return
      }

      generatedItems.value = latestPayload.items
      hasPreview.value = true

      if (currentStep.value < ONBOARDING_MAX_STEP) {
        currentStep.value = ONBOARDING_MAX_STEP
      }
    } catch (hydrateError) {
      console.error('[onboarding] hydrate session failed:', hydrateError)
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
      const onboardingState = await onboardingApi.getOnboardingState()
      setApplyServerState(onboardingState)
      await setHydratePreviewFromSession()
    } catch (loadError) {
      console.error('[onboarding] load failed:', loadError)
      error.value = 'Impossible de charger le parcours de demarrage.'
    } finally {
      loading.value = false
      isReady.value = true
    }
  }

  const setEnsureChatSessionId = async () => {
    if (firstChatSessionId.value) {
      return firstChatSessionId.value
    }

    try {
      const session = await chatSessionsApi.createChatSession({
        title: ONBOARDING_FIRST_SESSION_TITLE
      })

      firstChatSessionId.value = session.id
      await setPersistOnboardingPatch({
        first_chat_session_id: session.id
      })

      return session.id
    } catch (sessionError) {
      console.error('[onboarding] chat session creation failed:', sessionError)
      error.value = 'Impossible de demarrer la session de clavardage du parcours de demarrage.'
      return null
    }
  }

  const setSubmitIntent = async () => {
    const intent = firstIntent.value.trim()

    if (!intent || isGenerating.value || isSaving.value) {
      return false
    }

    if (intent.length > ONBOARDING_MAX_INTENT_LENGTH) {
      error.value = `Veuillez garder votre demande sous ${ONBOARDING_MAX_INTENT_LENGTH} caracteres.`
      return false
    }

    error.value = null
    isGenerating.value = true
    status.value = 'in_progress'
    currentStep.value = 2
    generatedItems.value = []
    hasPreview.value = false

    const initialPatchState = await setPersistOnboardingPatch({
      status: 'in_progress',
      current_step: 2,
      first_intent: intent,
      skipped_at: null
    })

    if (!initialPatchState) {
      isGenerating.value = false
      return false
    }

    const chatId = await setEnsureChatSessionId()

    if (!chatId) {
      isGenerating.value = false
      return false
    }

    const previousPayloadKey = getLatestAssistantListPayload(chat.messages)?.key || null

    try {
      await sendMessage({
        text: intent,
        createListMode: true,
        chatId
      })

      const latestPayload = getLatestAssistantListPayload(chat.messages)

      if (!latestPayload || latestPayload.items.length === 0 || latestPayload.key === previousPayloadKey) {
        throw new Error('Aucune liste d\'epicerie trouvee dans la reponse.')
      }

      generatedItems.value = latestPayload.items
      hasPreview.value = true
      currentStep.value = ONBOARDING_MAX_STEP

      await setPersistOnboardingPatch({
        status: 'in_progress',
        current_step: ONBOARDING_MAX_STEP,
        first_intent: intent,
        has_preview: true
      })

      return true
    } catch (submitError) {
      console.error('[onboarding] generate list failed:', submitError)
      generatedItems.value = []
      hasPreview.value = false
      currentStep.value = 2
      error.value = 'Impossible de generer votre premiere liste. Reessayez.'

      await setPersistOnboardingPatch({
        status: 'in_progress',
        current_step: 2,
        has_preview: false
      })

      return false
    } finally {
      isGenerating.value = false
    }
  }

  const setBackToIntentStep = async () => {
    error.value = null
    currentStep.value = 1
    generatedItems.value = []
    hasPreview.value = false

    await setPersistOnboardingPatch({
      status: 'in_progress',
      current_step: 1,
      has_preview: false
    })
  }

  const setSkipForNow = async () => {
    if (isSaving.value) {
      return
    }

    isSaving.value = true
    error.value = null

    const skippedAtIso = new Date().toISOString()

    status.value = 'skipped'
    skippedAt.value = skippedAtIso

    await setPersistOnboardingPatch({
      status: 'skipped',
      skipped_at: skippedAtIso
    })

    isSaving.value = false
    await navigateTo('/search')
  }

  const setContinueToSearch = async () => {
    await navigateTo('/search')
  }

  const setResumeOnboarding = async () => {
    error.value = null
    status.value = 'in_progress'
    currentStep.value = 1
    skippedAt.value = null

    await setPersistOnboardingPatch({
      status: 'in_progress',
      current_step: 1,
      skipped_at: null
    })

    await navigateTo('/onboarding')
  }

  const setAddPreviewToCurrentList = async () => {
    if (generatedItems.value.length === 0 || isSaving.value) {
      return false
    }

    isSaving.value = true
    error.value = null

    for (const item of generatedItems.value) {
      for (let index = 0; index < item.quantity; index += 1) {
        listsStore.setProductInCurrentList(item.product)
      }
    }

    listsStore.setShoppingListDrawerOpen()

    const completedAtIso = new Date().toISOString()

    status.value = 'completed'
    hasAddedList.value = true
    completedAt.value = completedAtIso
    currentStep.value = ONBOARDING_MAX_STEP

    await setPersistOnboardingPatch({
      status: 'completed',
      current_step: ONBOARDING_MAX_STEP,
      has_preview: true,
      has_added_list: true,
      completed_at: completedAtIso,
      skipped_at: null
    })

    isSaving.value = false
    await navigateTo('/search')
    return true
  }

  const setCompleteFromChatSession = async (chatId: string | null) => {
    const normalizedChatId = typeof chatId === 'string' ? chatId.trim() : ''
    const onboardingSessionId = typeof firstChatSessionId.value === 'string'
      ? firstChatSessionId.value.trim()
      : ''

    if (!normalizedChatId || !onboardingSessionId || normalizedChatId !== onboardingSessionId) {
      return false
    }

    if (status.value === 'completed' && hasAddedList.value) {
      return true
    }

    const completedAtIso = new Date().toISOString()

    status.value = 'completed'
    currentStep.value = ONBOARDING_MAX_STEP
    hasPreview.value = true
    hasAddedList.value = true
    completedAt.value = completedAtIso
    skippedAt.value = null

    await setPersistOnboardingPatch({
      status: 'completed',
      current_step: ONBOARDING_MAX_STEP,
      has_preview: true,
      has_added_list: true,
      completed_at: completedAtIso,
      skipped_at: null
    })

    return true
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

    const canHydrateIntent = currentStep.value === ONBOARDING_DEFAULT_STEP
      && !hasPreview.value
      && !hasAddedList.value
      && status.value !== 'completed'
      && firstIntent.value.trim().length === 0

    if (!canHydrateIntent) {
      return false
    }

    firstIntent.value = heroPrompt
    return true
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
    firstChatSessionId,
    hasPreview,
    hasAddedList,
    completedAt,
    skippedAt,
    generatedItems,
    getProgressPercent,
    getCanSubmitIntent,
    getIsBlocking,
    getCanResume,
    setIntent,
    setUseQuickPrompt,
    setConsumeHeroPrompt,
    setLoadOnboardingState,
    setSubmitIntent,
    setBackToIntentStep,
    setSkipForNow,
    setContinueToSearch,
    setResumeOnboarding,
    setAddPreviewToCurrentList,
    setCompleteFromChatSession
  }
})
