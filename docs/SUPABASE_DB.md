# Supabase DB Overview (SpyGrocery)

This document reflects the current production-like Supabase state inspected via MCP on **March 27, 2026**.

## Quick Summary

- Project URL: `https://thtxpbkjwabegyikrdhu.supabase.co`
- Main schema: `public`
- Active tables used by web app:
  - `products`
  - `product_prices`
  - `lists`
  - `ai_chat_sessions`
  - `onboarding`
- No public views are currently present (`latest_price` no longer exists).

Current row counts:
- `products`: `5,362`
- `product_prices`: `5,311`
- `lists`: `0`
- `ai_chat_sessions`: `0`
- `onboarding`: `0`

## Data Model

Logical model:
- `products` is the current searchable product snapshot table.
- `product_prices` is historical price tracking per product observation.
- `lists` stores authenticated user saved lists (`items_json` payload).
- `ai_chat_sessions` stores authenticated user chat sessions (`messages_json` payload).
- `onboarding` stores authenticated user onboarding progression.

Database-level relationship:
- `product_prices.product_id -> products.id` (`ON DELETE CASCADE`)
- `lists.user_id -> auth.users.id` (`ON DELETE CASCADE`)
- `ai_chat_sessions.user_id -> auth.users.id` (`ON DELETE CASCADE`)
- `onboarding.user_id -> auth.users.id` (`ON DELETE CASCADE`)
- `onboarding.first_chat_session_id -> ai_chat_sessions.id` (`ON DELETE SET NULL`)

Key uniqueness:
- `products.slug` is unique.
- `product_prices` enforces one row per product per UTC day via expression unique index:
  - `(product_id, ((observed_at AT TIME ZONE 'UTC')::date))`
- `lists` enforces one list name per user:
  - `(user_id, name)`
- `ai_chat_sessions` uses UUID PK and user/time indexes (no unique per-title constraint).
- `onboarding` enforces one row per user (`user_id` PK).

## Tables

### `public.products`

Purpose:
- Canonical searchable product rows used by the frontend.

Primary key:
- `id uuid` (default `gen_random_uuid()`)

Key columns used by web:
- `id uuid`
- `slug text`
- `title text`
- `brand text`
- `store text`
- `store_id text`
- `image_url text`
- `url text`
- `uom text`
- `price_num numeric`
- `was_price_num numeric`
- `price_text text`
- `pre_price_text text`
- `on_sale boolean`
- `scraped_at timestamptz`

Other notable columns:
- `source`, `source_url`, `external_id`, `product_key`, `raw_payload`, `search_term`, `search_results_count`, `image_urls`, etc.

Important indexes:
- `products_pkey` (PK on `id`)
- `products_slug_key` (UNIQUE on `slug`)
- `products_product_key_idx` (UNIQUE on `product_key`)
- `products_store_idx` (`store`)
- `products_scraped_at_idx` (`scraped_at desc`)
- `products_external_id_idx` (`external_id`)
- `products_created_at_price_idx` partial (`created_at desc` where `price_raw is not null`)

### `public.product_prices`

Purpose:
- Historical price facts for analytics and later historical UI.

Primary key:
- `id uuid` (default `gen_random_uuid()`)

Key columns:
- `product_id uuid` (FK -> `products.id`)
- `store text`
- `store_id text`
- `observed_at timestamptz`
- `price_num numeric`
- `was_price_num numeric`
- `price_text text`
- `pre_price_text text`
- `on_sale boolean`
- `sale_*`, `discount_*`, `pricing_units`, `unit_price_full`

Important indexes:
- `product_prices_pkey` (PK)
- `product_prices_product_observed_idx` (`product_id`, `observed_at desc`)
- `product_prices_observed_idx` (`observed_at desc`)
- `product_prices_product_day_utc_expr_uidx` (UNIQUE daily UTC)

### `public.lists`

Purpose:
- Authenticated user saved lists used by `/lists` cloud CRUD.

Primary key:
- `id uuid` (default `gen_random_uuid()`)

Key columns:
- `id uuid`
- `user_id uuid` (FK -> `auth.users.id`)
- `name text`
- `items_json jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

Important indexes:
- `lists_pkey` (PK)
- `lists_user_id_idx` (`user_id`)
- `lists_user_id_name_key` (UNIQUE on `user_id`, `name`)

Triggers:
- `set_lists_updated_at` (`BEFORE UPDATE`) -> updates `updated_at` automatically.

### `public.ai_chat_sessions`

Purpose:
- Authenticated user AI conversations with full `UIMessage[]` snapshot persistence.

Primary key:
- `id uuid` (default `gen_random_uuid()`)

Key columns:
- `id uuid`
- `user_id uuid` (FK -> `auth.users.id`)
- `title text`
- `messages_json jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`
- `last_message_at timestamptz`

Important indexes:
- `ai_chat_sessions_pkey` (PK)
- `ai_chat_sessions_user_updated_at_idx` (`user_id`, `updated_at desc`)

### `public.onboarding`

Purpose:
- Persist one onboarding state row per authenticated user.

Primary key:
- `user_id uuid` (FK -> `auth.users.id`)

Key columns:
- `user_id uuid`
- `status text` (`not_started`, `in_progress`, `completed`, `skipped`)
- `current_step integer` (`1..3`)
- `first_intent text`
- `first_chat_session_id uuid` (nullable FK -> `ai_chat_sessions.id`)
- `has_preview boolean`
- `has_added_list boolean`
- `completed_at timestamptz`
- `skipped_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

Important indexes:
- `onboarding_pkey` (PK)
- `onboarding_first_chat_session_id_idx` (`first_chat_session_id`)
- `onboarding_updated_at_idx` (`updated_at desc`)

## Views and Functions

- `public` views: none.
- `public` functions:
  - `set_lists_updated_at()` (trigger helper for `public.lists.updated_at`)

## RLS / Security Status

Supabase advisors currently report:
- `RLS Disabled in Public` on:
  - `public.products`
  - `public.product_prices`
- `Function Search Path Mutable` on:
  - `public.set_lists_updated_at`

Current `public.lists` RLS status:
- RLS: enabled
- Policy: `lists_owner_all`
  - role: `authenticated`
  - `USING (auth.uid() = user_id)`
  - `WITH CHECK (auth.uid() = user_id)`

Current `public.ai_chat_sessions` RLS status:
- RLS: enabled
- Policies (role `authenticated`):
  - `ai_chat_sessions_select_own`
  - `ai_chat_sessions_insert_own`
  - `ai_chat_sessions_update_own`
  - `ai_chat_sessions_delete_own`
  - owner rule: `auth.uid() = user_id` (with explicit null checks)

Current `public.onboarding` RLS status:
- RLS: enabled
- Policy: `onboarding_owner_all`
  - role: `authenticated`
  - `USING (auth.uid() = user_id)`
  - `WITH CHECK (auth.uid() = user_id)`

Reference:
- https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public
- https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

Performance advisory currently reported:
- `auth_rls_initplan` on `public.lists` policy `lists_owner_all`
- `auth_rls_initplan` on `public.ai_chat_sessions` policies (`select/insert/update/delete`)
- `auth_rls_initplan` on `public.onboarding` policy `onboarding_owner_all`
- `unused_index` on `onboarding_first_chat_session_id_idx`
- `unused_index` on `onboarding_updated_at_idx`
- `unused_index` on `products_created_at_price_idx`

Reference:
- https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

## Migrations Present

Applied migrations currently visible:
- `20260307085506 create_products_table_from_normalized_product`
- `20260307085609 products_id_to_uuid_primary_key`
- `20260307101542 add_product_key_and_product_prices_history`
- `20260308172700 remove_scope_key_use_product_id_only`
- `20260308211843 enforce_one_product_price_per_day_toronto`
- `20260308213848 replace_observed_day_column_with_expression_index`
- `20260308220055 add_products_created_at_partial_index`
- `20260310060741 dedupe_product_prices_utc_day_and_enforce_unique_v2`
- `20260310061128 use_utc_only_for_product_prices_daily_uniqueness`
- `20260319214807 add_pre_price_text_columns`
- `20260319215208 add_price_text_columns`
- `20260321173534 add_exec_readonly_sql_rpc_for_chat`
- `20260321174007 fix_exec_readonly_sql_select_with_regex`
- `20260321174045 fix_exec_readonly_sql_from_join_regex`
- `20260321194006 drop_exec_readonly_sql_rpc_for_chat`
- `20260321203210 recreate_execute_sql_fn_after_drop`
- `20260327214906 create_onboarding_table`
- `20260327220732 add_onboarding_first_chat_session_index`

Note:
- `public.lists` and `public.ai_chat_sessions` were created directly via SQL (MCP execute SQL), so they may not appear in `supabase_migrations.schema_migrations` history yet.

## Current Web API Contract (Aligned)

### `GET /api/products/search`

Query params:
- `q?: string`
- `store?: string` (`all` or one store id/slug)
- `sort?: 'relevance' | 'price_asc' | 'price_desc' | 'title_asc' | 'recent'`
- `limit?: number` (default `50`)
- `offset?: number` (default `0`)

Response:
- `items: SearchProduct[]`
- `total: number`
- `page: number`
- `limit: number`
- `totalPages: number`

`SearchProduct` fields:
- `id`, `slug`, `title`, `brand`, `store`, `store_id`, `image_url`, `url`, `uom`
- `price_num`, `was_price_num`, `price_text`, `pre_price_text`
- `on_sale`, `scraped_at`

### `GET /api/stores`

Source:
- Derived from `products` rows (`store`, `store_id`) and aggregated by count.

Response:
- `stores: StoreFacet[]`
- `StoreFacet = { id, store_id, name, slug, product_count }`
- `id = store_id` when present, otherwise fallback to store slug.

### `GET /api/products/[slug]`

Source:
- Primary product from `products.slug`.
- Comparable alternatives from `products` with matching heuristics in service layer.

Response:
- `product: SearchProduct`
- `otherStoreProducts: SearchProduct[]`

### Lists API (authenticated)

Storage:
- `public.lists`

Endpoints:
- `GET /api/lists` -> `{ lists: PersistedList[] }`
- `POST /api/lists` -> body `{ name: string, items: ListProduct[] }`, returns `{ list: PersistedList }`
- `PATCH /api/lists/[id]` -> body `{ name: string, items: ListProduct[] }`, returns `{ list: PersistedList }`
- `DELETE /api/lists/[id]` -> `{ success: true }`

Auth contract:
- All lists endpoints require authenticated user context.
- Owner is enforced by RLS policy (`auth.uid() = user_id`).

### AI Sessions API (authenticated)

Storage:
- `public.ai_chat_sessions`

Endpoints:
- `GET /api/ai/sessions` -> `{ sessions: ChatSession[] }`
- `POST /api/ai/sessions` -> body `{ title?: string | null }`, returns `{ session: ChatSession }`
- `GET /api/ai/sessions/[id]` -> `{ session: ChatSession }`
- `DELETE /api/ai/sessions/[id]` -> `{ success: true }`

Auth contract:
- All sessions endpoints require authenticated user context.
- Ownership is enforced in query filters (`id` + `user_id`) and by RLS.

### Onboarding API (authenticated)

Storage:
- `public.onboarding`

Endpoints:
- `GET /api/onboarding` -> `{ onboarding: OnboardingState }`
- `PATCH /api/onboarding` -> `{ onboarding: OnboardingState }`

Auth contract:
- All onboarding endpoints require authenticated user context.
- Ownership is enforced by RLS (`auth.uid() = user_id`).

### `POST /api/ai/chat`

Purpose:
- Chat orchestration endpoint using tool calling.

Data access contract:
- Tools query `products` only (chat V1 scope).
- SQL is validated server-side before execution (SELECT-only, `public.products` allowlist, no semicolons, keyword restrictions).
- Chat tools:
  - `query_products_sql` (all modes)
  - `submit_list_items` (only when `createListMode: true`)

Request body:
- `messages: UIMessage[]`
- `chatId: string`
- `createListMode?: boolean`

Auth/session contract:
- Requires authenticated user context.
- `chatId` must exist and belong to the same user.
- End-of-stream writes full message snapshot back to `ai_chat_sessions.messages_json`.

Response:
- UI message stream (SSE) for AI SDK clients.
- In list mode, stream includes a persistent data part:
  - `type: 'data-grocery-list'`
  - `data: { items: ListProduct[] }`

Operational note:
- Current `products` dataset is treated as specials-only.

## Notes for Agents

- Do not assume `stores`, `prices`, or `latest_price` exist.
- For current price display, use `products.price_num`.
- Keep `product_prices` for analytics/history workflows.
- Lists cloud persistence uses `public.lists`; frontend remains local-first with sync on authenticated sessions.
- AI conversation persistence uses `public.ai_chat_sessions` (`messages_json` snapshots).
- Onboarding progression persistence uses `public.onboarding`.
- Chatbot must not depend on `product_prices` for current V1 behavior.
- If schema is uncertain, re-check with Supabase MCP before coding.
