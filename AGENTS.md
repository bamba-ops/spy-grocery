# AGENTS.md
# Repo guide for agentic coding (SpyGrocery / Nuxt 4)

This file is for autonomous coding agents. It aims to be concrete, repo-specific, and safe.

## Quick Context
- SpyGrocery is a grocery price-comparison web app (search once, compare across stores).
- Active frontend is Nuxt 4 + Vue 3 (NOT the legacy app).
- Visual direction: black/white editorial, big typographic hierarchy; Manrope body + Fraunces headlines.
- Styling rule: Tailwind utility classes only (no custom CSS files).

## Commands (Current)
- Install: `npm install`
- Dev server: `npm run dev`
- Dev server (custom port): `npm run dev -- --port 3001`
- Dev server (LAN access / phone testing): `npm run dev -- --host 0.0.0.0 --port 3000`
- Build: `npm run build`
- Preview build: `npm run preview`
- Static generate: `npm run generate`

## Lint / Test / Typecheck
- Linting: not configured (no ESLint/Prettier in this repo today).
- Unit tests: not configured (no Vitest/Jest in this repo today).
- Typecheck (works with Nuxt TS projects; optional): `npx nuxi typecheck`

Single-test notes (because agents need this)
- There is no test runner configured yet.
- If/when Vitest is added, typical patterns are:
  - Run all tests: `npx vitest run`
  - Run a single file: `npx vitest run path/to/file.test.ts`
  - Run a single test by name: `npx vitest run -t "my test name"`

## Cursor / Copilot Rules
- No `.cursorrules`, `.cursor/rules/`, or `.github/copilot-instructions.md` found in this repo.

## Stack & Key Libraries
- Nuxt 4, Vue 3, Nitro server routes
- Tailwind: `@nuxtjs/tailwindcss`
- State: Pinia via `app/plugins/pinia.ts`
- Data: `@nuxtjs/supabase` (server-side uses `serverSupabaseClient`)
- Icons: `lucide-vue-next`

## Project Layout
- `app/pages/`:
  - `app/pages/index.vue` landing
  - `app/pages/search.vue` search experience
  - `app/pages/login.vue` placeholder (no redirects)
  - `app/pages/stores/[storeSlug]/products/[slug].vue` mock product detail
- `app/components/`: landing + search components
- `app/stores/`: Pinia stores (search, stores list, shopping list)
- `app/composables/`: `$fetch` wrappers + UI utilities
- `app/types/`:
  - `app/types/database.types.ts` generated Supabase types
  - `app/types/index.ts` domain + API types (import from here in app code)
- `server/api/`: Nitro API routes (file-based routing)
- `public/`: hero background media

Legacy app
- If `docs/frontend/` exists, treat it as legacy and do not edit for Nuxt work.

## Runtime Configuration / Secrets
- Supabase config lives in `nuxt.config.ts`:
  - `supabase.url = process.env.SUPABASE_URL`
  - `supabase.key = process.env.SUPABASE_PUBLISHABLE_KEY`
  - `supabase.redirect = false`
- Never commit `.env` or secret keys. Use publishable keys only in the app.

## Data Model Notes (DB)
- Tables: `products`, `prices`, `stores`
- View: `public.latest_price` (latest per product/store)
- Product routes are store-scoped: `/stores/[storeSlug]/products/[slug]`
- No global canonical product mapping yet.

## Code Style & Conventions

General formatting
- Prefer 2-space indentation.
- Prefer single quotes in TS/JS.
- Avoid non-ASCII in code unless the file already uses it or it is user-facing copy.

Vue components
- Use `<script setup lang="ts">`.
- Prefer `const x = ref(...)`, `computed(...)`, `watch(...)` patterns.
- Keep components modular; pages compose sections.
- Don’t introduce custom CSS files; use Tailwind classes.
- Fonts:
  - Use `font-sans` for body/UI (Manrope).
  - Use `font-display` for headlines (Fraunces).

Naming
- Components: `PascalCase.vue` (e.g. `SearchResults.vue`).
- Composables: `useX.ts` (e.g. `app/composables/useProducts.ts`).
- Stores: `camelCase.ts` exporting `useXStore`.
- Variables/functions: `camelCase`, constants: `SCREAMING_SNAKE_CASE`.

Imports
- Prefer type-only imports: `import type { Product } from '~/types'`.
- Import order guideline:
  1) Vue/Nuxt imports
  2) third-party libs
  3) `~/` app imports (types/composables/stores)
  4) relative imports

Types
- Prefer domain types from `app/types/index.ts`.
- Avoid `any`; if unavoidable, narrow it quickly (`unknown` + type guard) and keep scope small.

Error handling
- Server routes: throw with `createError({ statusCode, message })`.
- Client: store actions should catch and set `error` state; keep UI resilient.
- Always guard browser-only APIs with `process.client` (e.g. `localStorage`).

## API / Server Route Guidelines (Nitro)
- Routes live in `server/api/` and use file-based naming:
  - `server/api/stores/index.get.ts` -> `GET /api/stores`
  - `server/api/products/search.get.ts` -> `GET /api/products/search`
- Use `getQuery(event)` for query params; coerce + validate (strings, ints).
- When querying Supabase:
  - Prefer selecting only needed fields.
  - Handle empty results consistently.
  - Avoid unbounded selects for large tables.

## State Management (Pinia)
- Cross-page/shared state belongs in `app/stores/*`.
- Prefer stores calling composables (e.g. search store calls `useProducts().search()`) to avoid duplicated fetch logic.
- Keep store state serializable.

## UI/UX Notes (Search + List)
- Search results and list panels are separate components.
- Shopping list is grouped by store with totals.
- Save operations are localStorage-backed; always guard with `process.client`.

## Common Gotchas
- Tailwind config changes may require restarting `npm run dev`.
- Supabase redirect issues: keep `supabase.redirect: false` unless you intentionally change auth flow.
- If enabling mobile testing, run dev server with `--host 0.0.0.0` and access via your Mac’s LAN IP.
