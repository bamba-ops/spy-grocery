export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped'

export interface OnboardingState {
  user_id: string
  status: OnboardingStatus
  current_step: number
  first_intent: string | null
  selected_store_slug: string | null
  first_chat_session_id: string | null
  has_preview: boolean
  has_added_list: boolean
  completed_at: string | null
  skipped_at: string | null
  created_at: string
  updated_at: string
}

export interface UpdateOnboardingPayload {
  status?: OnboardingStatus
  current_step?: number
  first_intent?: string | null
  selected_store_slug?: string | null
  first_chat_session_id?: string | null
  has_preview?: boolean
  has_added_list?: boolean
  completed_at?: string | null
  skipped_at?: string | null
}

export interface OnboardingResponse {
  onboarding: OnboardingState
}
