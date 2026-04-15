import type { Database } from '#shared/types/database.types'
import type {
  OnboardingState,
  OnboardingStatus,
  UpdateOnboardingPayload
} from '#shared/types/onboarding'
import {
  ONBOARDING_DEFAULT_STEP,
  ONBOARDING_MAX_INTENT_LENGTH,
  ONBOARDING_MAX_STEP
} from '#shared/utils/onboarding'
import {
  getOnboardingRowByUserId,
  setOnboardingRowByUserId,
  upsertOnboardingRowByUserId
} from '../../repositories/onboardingRepository'

type OnboardingRow = Database['public']['Tables']['onboarding']['Row']

interface OnboardingParams {
  supabase: any
  userId: string
}

interface UpdateOnboardingParams extends OnboardingParams {
  payload?: UpdateOnboardingPayload | null
}

const ONBOARDING_STATUSES: OnboardingStatus[] = ['not_started', 'in_progress', 'completed', 'skipped']

const getStatusFromUnknown = (value: unknown): OnboardingStatus | undefined => {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Invalid onboarding status.'
    })
  }

  if (!ONBOARDING_STATUSES.includes(value as OnboardingStatus)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid onboarding status.'
    })
  }

  return value as OnboardingStatus
}

const getCurrentStepFromUnknown = (value: unknown): number | undefined => {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid onboarding step.'
    })
  }

  if (value < ONBOARDING_DEFAULT_STEP || value > ONBOARDING_MAX_STEP) {
    throw createError({
      statusCode: 400,
      message: 'Invalid onboarding step.'
    })
  }

  return value
}

const getFirstIntentFromUnknown = (value: unknown): string | null | undefined => {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Invalid onboarding intent.'
    })
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  if (trimmed.length > ONBOARDING_MAX_INTENT_LENGTH) {
    throw createError({
      statusCode: 400,
      message: `Onboarding intent must be ${ONBOARDING_MAX_INTENT_LENGTH} characters or fewer.`
    })
  }

  return trimmed
}

const getStoreSlugFromUnknown = (value: unknown): string | null | undefined => {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Invalid onboarding selected store slug.'
    })
  }

  const trimmed = value.trim().toLowerCase()

  if (!trimmed) {
    return null
  }

  return trimmed
}

const getChatSessionIdFromUnknown = (value: unknown): string | null | undefined => {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Invalid onboarding chat session id.'
    })
  }

  const trimmed = value.trim()

  return trimmed || null
}

const getBooleanFromUnknown = (value: unknown, field: string): boolean | undefined => {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'boolean') {
    throw createError({
      statusCode: 400,
      message: `Invalid onboarding field: ${field}.`
    })
  }

  return value
}

const getIsoDateFromUnknown = (value: unknown, field: string): string | null | undefined => {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      message: `Invalid onboarding field: ${field}.`
    })
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  const parsed = Date.parse(trimmed)

  if (Number.isNaN(parsed)) {
    throw createError({
      statusCode: 400,
      message: `Invalid onboarding field: ${field}.`
    })
  }

  return new Date(parsed).toISOString()
}

const toOnboardingState = (row: OnboardingRow): OnboardingState => {
  return {
    user_id: row.user_id,
    status: row.status as OnboardingStatus,
    current_step: row.current_step,
    first_intent: row.first_intent,
    selected_store_slug: row.selected_store_slug,
    first_chat_session_id: row.first_chat_session_id,
    has_preview: row.has_preview,
    has_added_list: row.has_added_list,
    completed_at: row.completed_at,
    skipped_at: row.skipped_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

const getOrCreateOnboardingRow = async ({ supabase, userId }: OnboardingParams): Promise<OnboardingRow> => {
  const existing = await getOnboardingRowByUserId(supabase, userId)

  if (existing) {
    return existing
  }

  return upsertOnboardingRowByUserId(supabase, userId)
}

export const getOnboarding = async ({ supabase, userId }: OnboardingParams): Promise<OnboardingState> => {
  const row = await getOrCreateOnboardingRow({ supabase, userId })
  return toOnboardingState(row)
}

export const updateOnboarding = async ({
  supabase,
  userId,
  payload
}: UpdateOnboardingParams): Promise<OnboardingState> => {
  // Debug log kept intentionally while onboarding v2 is being rolled out.
  console.log('[onboarding] update payload received:', {
    userId,
    payload
  })

  const currentRow = await getOrCreateOnboardingRow({ supabase, userId })
  const nextPayload = payload || {}

  const status = getStatusFromUnknown(nextPayload.status)
  const currentStep = getCurrentStepFromUnknown(nextPayload.current_step)
  const firstIntent = getFirstIntentFromUnknown(nextPayload.first_intent)
  const selectedStoreSlug = getStoreSlugFromUnknown(nextPayload.selected_store_slug)
  const firstChatSessionId = getChatSessionIdFromUnknown(nextPayload.first_chat_session_id)
  const hasPreview = getBooleanFromUnknown(nextPayload.has_preview, 'has_preview')
  const hasAddedList = getBooleanFromUnknown(nextPayload.has_added_list, 'has_added_list')
  const completedAt = getIsoDateFromUnknown(nextPayload.completed_at, 'completed_at')
  const skippedAt = getIsoDateFromUnknown(nextPayload.skipped_at, 'skipped_at')

  const now = new Date().toISOString()

  const patch: Parameters<typeof setOnboardingRowByUserId>[2] = {
    updated_at: now
  }

  if (status !== undefined) {
    patch.status = status

    if (status === 'completed' && completedAt === undefined) {
      patch.completed_at = now
      patch.skipped_at = null
    }

    if (status === 'skipped' && skippedAt === undefined) {
      patch.skipped_at = now
    }

    if (status === 'in_progress') {
      patch.skipped_at = null
    }
  }

  if (currentStep !== undefined) {
    patch.current_step = currentStep
  }

  if (firstIntent !== undefined) {
    patch.first_intent = firstIntent
  }

  if (selectedStoreSlug !== undefined) {
    patch.selected_store_slug = selectedStoreSlug
  }

  if (firstChatSessionId !== undefined) {
    patch.first_chat_session_id = firstChatSessionId
  }

  if (hasPreview !== undefined) {
    patch.has_preview = hasPreview
  }

  if (hasAddedList !== undefined) {
    patch.has_added_list = hasAddedList

    if (hasAddedList && status === undefined) {
      patch.status = 'completed'
      patch.completed_at = now
      patch.skipped_at = null
    }
  }

  if (completedAt !== undefined) {
    patch.completed_at = completedAt
  }

  if (skippedAt !== undefined) {
    patch.skipped_at = skippedAt
  }

  if (status === 'completed' && currentStep === undefined) {
    patch.current_step = ONBOARDING_MAX_STEP
  }

  const shouldUpdate = Object.keys(patch).length > 1

  if (!shouldUpdate) {
    return toOnboardingState(currentRow)
  }

  const nextRow = await setOnboardingRowByUserId(supabase, userId, patch)

  if (!nextRow) {
    throw createError({
      statusCode: 404,
      message: 'Onboarding state not found.'
    })
  }

  return toOnboardingState(nextRow)
}
