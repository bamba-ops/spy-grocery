# SpyGrocery Onboarding Contract

## Goal

Drive users to one concrete outcome as fast as possible:

1. user describes what they want to cook or buy,
2. AI generates a structured grocery list from real `products` data,
3. user adds that list to their current list.

This is the onboarding AHA moment.

## Core Flow (3 Steps)

- Step 1: input intent (`/onboarding`, guided prompt).
- Step 2: AI curation in progress.
- Step 3: structured list preview + primary action `Add to list`.

## Skip / Resume

- `Skip for now` sets onboarding status to `skipped`.
- `skipped` users are not hard-blocked, but can resume from `/search`.
- Resume sets status back to `in_progress` and returns to `/onboarding`.

## Completion Rule

Onboarding is completed only when the user adds previewed AI items to the current list.

## Data Contract

Storage table: `public.onboarding`.

Main fields:

- `status`: `not_started | in_progress | completed | skipped`
- `current_step`: `1..3`
- `first_intent`: nullable text
- `first_chat_session_id`: nullable uuid to `ai_chat_sessions.id`
- `has_preview`: boolean
- `has_added_list`: boolean
- `completed_at`, `skipped_at`, timestamps

## API Contract

- `GET /api/onboarding` -> `{ onboarding }`
- `PATCH /api/onboarding` -> `{ onboarding }`

Auth is required. Row ownership is enforced by RLS (`auth.uid() = user_id`).
