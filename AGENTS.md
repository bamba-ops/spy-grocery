# AGENTS.md
# SpyGrocery (Nuxt 4) - Agent Operating Guide

This guide is for autonomous coding agents working in `web/`.
It documents practical conventions, commands, and architecture constraints for the current implementation.

## Quick Context
- Product: SpyGrocery, a grocery price-comparison web app.
- Frontend stack: Nuxt 4 + Vue 3 + Tailwind.
- State layer: Pinia (`app/stores/*`).
- Backend layer: Nitro routes (`server/api/*`) with service/repository split.
- Data access: Supabase via `serverSupabaseClient(event)`.
- Visual direction: editorial black/white, strong typography, low-color UI.
- AI chat transport: Vercel AI SDK UI stream (`/api/ai/chat`) with optional grocery-list data parts.
- Auth flow: Supabase magic link + Google (`/login` -> `/auth/confirm`).

Current runtime data model (important):
- Search/read model uses `public.products`.
- Historical prices live in `public.product_prices`.
- Saved user lists live in `public.lists`.
- Store list for UI is derived from `products` rows (`store`, `store_id`) in backend.
- Current operational dataset in `products` is treated as specials-only.

## Cursor / Copilot Rules
- Checked and currently not present:
  - `.cursor/rules/**`
  - `.cursorrules`
  - `.github/copilot-instructions.md`
- If these files are added later, treat them as higher-priority repo rules.

## Canonical Docs to Follow
- `docs/STRUCTURE.md` for architecture/layering intent.
- `docs/STYLING.md` for visual/UI rules.
- `docs/SUPABASE_DB.md` for DB facts and Supabase workflow notes.

Practical priority rule:
- If `docs/STRUCTURE.md` diverges from current implementation, trust the current server/API code and `docs/SUPABASE_DB.md` as source of truth.

## Build / Dev Commands
- Install deps: `npm install`
- Dev server: `npm run dev`
- Dev server custom port: `npm run dev -- --port 3001`
- Dev LAN testing: `npm run dev -- --host 0.0.0.0 --port 3000`
- Production build: `npm run build`
- Preview build: `npm run preview`
- Static generation: `npm run generate`

## Lint / Typecheck / Test Commands
- Lint: not configured in this repo today.
- Typecheck (optional): `npx nuxi typecheck`
- Unit tests: not configured in this repo today.

Typecheck caveat:
- `npx nuxi typecheck` may require `vue-tsc` availability in the current environment/network.

Single-test guidance:
- There is no test runner configured right now.
- If Vitest is added later, use:
  - Run all tests: `npx vitest run`
  - Run one file: `npx vitest run path/to/file.test.ts`
  - Run one test name: `npx vitest run -t "test name"`

## Project Layout (Working Mental Map)
- `app/pages/*`: route-level composition.
- `app/components/*`: UI components.
- `app/stores/*`: Pinia feature state/actions.
- `app/composables/*`: API wrappers + domain/data access helpers.
- `app/layouts/*`: shared page layouts.
- `server/api/*`: HTTP controllers (Nitro file-based routes).
- `server/services/*`: business orchestration/use-cases.
- `server/repositories/*`: DB access queries/mapping.
- `shared/types/*`: shared domain + DB types.
- `shared/utils/*`: reusable constants and helper functions.

## Architecture Contract (Do Not Break)
Preferred flow:
- Component/Page -> Store -> Composable -> Server API -> Service -> Repository -> Supabase

Current concrete API flows:
- Product search:
  - Component/Page -> `useSearchStore` -> `useProducts().search()` -> `GET /api/products/search` -> `searchProducts` service -> `searchProductsRows` repository -> Supabase `products`
- Product details:
  - Component/Page -> `useProductDetailsStore` -> `useProducts().getProductDetails()` -> `GET /api/products/[slug]` -> `getProductDetails` service -> `getProductRowBySlug/getSimilarProductsRows` repository -> Supabase `products`
- Stores filter list:
  - Component/Page -> `useSearchStore` -> `useStores().fetchStores()` -> `GET /api/stores` -> `listStores` service -> `fetchProductStoreRows` repository -> Supabase `products`
- Saved lists (local-first + cloud sync):
  - Component/Page -> `useListsStore` -> `useListsStorage` (local keys) + `useLists` (API transport) -> `GET/POST/PATCH/DELETE /api/lists*` -> `listsService` -> `listsRepository` -> Supabase `lists`
- Auth:
  - `app/pages/login.vue` / `app/components/BottomNavAuthAction.vue` -> `useAuthStore` -> `useAuth` -> Supabase Auth SDK (`signInWithOtp`, `signInWithOAuth`, `signOut`, `getUser`)
- AI chat (normal mode):
  - `app/components/ai/AiChatbot.vue` -> `useChatStore` -> `useChat` -> `POST /api/ai/chat` -> `streamChatWithProductsDb` -> `query_products_sql` tool -> `executeProductsSelectSql` repository -> Supabase `products`
- AI chat (list mode):
  - `app/components/ai/AiChatbot.vue` toggle (`createListMode`) -> `useChatStore` -> `useChat` -> `POST /api/ai/chat` -> same SQL tool flow + `submit_list_items` tool -> server emits `data-grocery-list` stream part (`items: ListProduct[]`)

Rules:
- Avoid skipping layers (for example, component calling DB logic directly).
- Keep UI concerns out of services/repositories.
- Keep HTTP concerns out of services.
- Backend code in `server/*` must never import from `app/*`.

## Current Internal API Surface (for Agents)

### `GET /api/products/search`
Query params:
- `q?: string`
- `store?: string` (`all` or one store id/slug)
- `sort?: 'price_asc' | 'price_desc' | 'title_asc' | 'recent'`
- `limit?: number` (default 50, max 100)
- `offset?: number` (default 0)

Response shape:
- `items: SearchProduct[]`
- `total: number`
- `page: number`
- `limit: number`
- `totalPages: number`

### `GET /api/stores`
- Returns `stores: StoreFacet[]`
- Stores are derived from `products`, aggregated by name/id.

### `GET /api/products/[slug]`
- Returns:
  - `product: SearchProduct`
  - `otherStoreProducts: SearchProduct[]`

### Lists API (authenticated)
- `GET /api/lists`
  - Returns `lists: PersistedList[]`
- `POST /api/lists`
  - Body: `{ name: string, items: ListProduct[] }`
  - Returns `list: PersistedList`
- `PATCH /api/lists/[id]`
  - Body: `{ name: string, items: ListProduct[] }`
  - Returns `list: PersistedList`
- `DELETE /api/lists/[id]`
  - Returns `{ success: true }`

### `POST /api/ai/chat`
Request body:
- `messages: UIMessage[]`
- `createListMode?: boolean`

Response:
- UI message stream (SSE) for AI SDK clients.
- In list mode (`createListMode: true`), stream also includes a data part:
  - `type: 'data-grocery-list'`
  - `data: { items: ListProduct[] }`

Tooling contract:
- SQL tool: `query_products_sql` (read-only `SELECT`, `public.products` only, server-side validation + limit wrapping).
- List submit tool (list mode only): `submit_list_items` (validated product payload + quantity).

Type anchors:
- `SearchProduct` (`shared/types/index.ts`)
- `StoreFacet` (`shared/types/index.ts`)
- `SearchResponse` (`shared/types/search.ts`)
- `ListProduct` (`shared/types/lists.ts`)
- `PersistedList` (`shared/types/lists.ts`)

## Code Style and Formatting
- Use 2-space indentation.
- Prefer single quotes in TS/JS.
- Keep code ASCII unless user-facing copy needs Unicode.
- Keep components focused and small.
- Avoid unnecessary comments; only explain non-obvious logic.

## Vue / Nuxt Conventions
- Use `<script setup lang="ts">` in Vue SFCs.
- Prefer explicit actions over watcher-heavy hidden flows.
- Guard browser-only APIs with `process.client`.
- Keep page files for composition/wiring, not business logic.
- Tailwind utility classes only; do not add custom CSS files.

## Imports
- Prefer type-only imports where possible.
- Import order guideline:
  1) Vue/Nuxt
  2) third-party libs
  3) `~/` imports
  4) relative imports
- For shared helpers/constants, prefer `shared/utils/*` (Nuxt auto-import support).

## Types
- Prefer domain types from `shared/types/index.ts` and related shared type files.
- Avoid `any`; use `unknown` + narrowing/type guards when needed.
- Keep API response shapes explicit and narrow.

## Naming Conventions
- Components: `PascalCase.vue`
- Stores: `camelCase.ts`, export `useXStore`
- Composables: `useX.ts`
- Variables/functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Team convention for function prefixes:
  - Read/access: `get...`
  - Write/mutation: `set...`
  - Delete/remove: `delete...`

## Error Handling
- Server/API: throw `createError({ statusCode, message })`.
- Client/store actions: catch errors, set `error` state, keep UI resilient.
- Avoid swallowing errors silently.
- Validate/coerce query params in API handlers.

## Supabase and Data Access Rules
- In server routes, use `serverSupabaseClient(event)`.
- For authenticated routes, extract auth user id from claims (`serverSupabaseUser(event)` -> `sub`) via shared helper.
- Keep DB access in repositories.
- Keep query/business orchestration in services.
- Select only needed fields.
- Chat V1 is products-only: do not use `product_prices` in chatbot tools/services.

Do not assume legacy entities:
- No `latest_price` view in current web contract.
- No direct dependency on a `stores` table for UI store filters.
- Store list is currently derived from `products` rows.

Repository note for large scans:
- When deriving stores from `products`, keep pagination/ranging logic in repository to avoid missing stores due to query row limits.

## Shared Utils Rule (Repo-Specific)
- Put reusable constants and helper functions in `shared/utils/*`.
- If a constant/helper is declared outside a feature's base exported function,
  move it into `shared/utils`.
- Prefer auto-imported shared utils in Nuxt when applicable.

## UI/UX Notes
- Keep editorial black/white direction consistent.
- Typography: Manrope for body/UI, Fraunces for display/headlines.
- Ensure visible hover/focus/disabled states.
- Mobile-first layouts; verify desktop and mobile behavior.

## Common Gotchas
- Tailwind config changes may require restarting dev server.
- Store list is derived from `products`; backend paging is required to avoid missing stores.
- Local list storage normalizes legacy payloads to current product shape and tracks deleted names for cloud sync.
- Chat list mode is stream-based: UI reads `data-grocery-list` from assistant `message.parts`.
- Lists are local-first; authenticated sessions sync local state to cloud (`local wins` by list name).
- No formal lint/test safety net exists yet; run build/typecheck frequently.

## Agent Workflow Checklist
- Before coding: identify touched files and layer boundaries.
- During coding: keep changes scoped to one intention.
- After coding (minimum): run `npm run build`.
- Optional safety: run `npx nuxi typecheck`.
- Before commit: inspect `git diff` for scope and accidental files.

## Git and Change Hygiene
- Do not revert user-authored unrelated changes unless explicitly asked.
- Avoid broad refactors when implementing a focused request.
- Keep commits small and intention-revealing.
- Never commit secrets (`.env`, private keys, credentials).

## What to Avoid
- No direct Supabase calls from components/pages.
- No business logic embedded in Nitro controllers.
- No imports from `app/*` inside `server/*` files.
- No new custom CSS files or ad-hoc visual themes.
- No implicit side-effect chains driven by many watchers.
- Do not reintroduce deprecated query patterns/flows (legacy promo-only contract, removed featured endpoint assumptions).
- Do not bypass layered flow for quick DB access in components.
