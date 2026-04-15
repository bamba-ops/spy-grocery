import type { Database } from '#shared/types/database.types'

type OnboardingRow = Database['public']['Tables']['onboarding']['Row']

interface SetOnboardingRowByUserIdParams {
  status?: string
  current_step?: number
  first_intent?: string | null
  selected_store_slug?: string | null
  first_chat_session_id?: string | null
  has_preview?: boolean
  has_added_list?: boolean
  completed_at?: string | null
  skipped_at?: string | null
  updated_at: string
}

const ONBOARDING_SELECT_FIELDS = [
  'user_id',
  'status',
  'current_step',
  'first_intent',
  'selected_store_slug',
  'first_chat_session_id',
  'has_preview',
  'has_added_list',
  'completed_at',
  'skipped_at',
  'created_at',
  'updated_at'
].join(',')

export const getOnboardingRowByUserId = async (
  supabase: any,
  userId: string
): Promise<OnboardingRow | null> => {
  const { data, error } = await supabase
    .from('onboarding')
    .select(ONBOARDING_SELECT_FIELDS)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Could not load onboarding state: ${error.message}`
    })
  }

  return (data as OnboardingRow | null) ?? null
}

export const upsertOnboardingRowByUserId = async (
  supabase: any,
  userId: string
): Promise<OnboardingRow> => {
  const { data, error } = await supabase
    .from('onboarding')
    .upsert({
      user_id: userId
    }, {
      onConflict: 'user_id'
    })
    .select(ONBOARDING_SELECT_FIELDS)
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Could not initialize onboarding state: ${error.message}`
    })
  }

  return data as OnboardingRow
}

export const setOnboardingRowByUserId = async (
  supabase: any,
  userId: string,
  params: SetOnboardingRowByUserIdParams
): Promise<OnboardingRow | null> => {
  const patch: Record<string, unknown> = {
    updated_at: params.updated_at
  }

  if (params.status !== undefined) {
    patch.status = params.status
  }

  if (params.current_step !== undefined) {
    patch.current_step = params.current_step
  }

  if (params.first_intent !== undefined) {
    patch.first_intent = params.first_intent
  }

  if (params.selected_store_slug !== undefined) {
    patch.selected_store_slug = params.selected_store_slug
  }

  if (params.first_chat_session_id !== undefined) {
    patch.first_chat_session_id = params.first_chat_session_id
  }

  if (params.has_preview !== undefined) {
    patch.has_preview = params.has_preview
  }

  if (params.has_added_list !== undefined) {
    patch.has_added_list = params.has_added_list
  }

  if (params.completed_at !== undefined) {
    patch.completed_at = params.completed_at
  }

  if (params.skipped_at !== undefined) {
    patch.skipped_at = params.skipped_at
  }

  const { data, error } = await supabase
    .from('onboarding')
    .update(patch)
    .eq('user_id', userId)
    .select(ONBOARDING_SELECT_FIELDS)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Could not update onboarding state: ${error.message}`
    })
  }

  return (data as OnboardingRow | null) ?? null
}
