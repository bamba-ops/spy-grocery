# AGENTS.md
# SpyGrocery (Nuxt 4) - Agent Operating Guide

This file is for autonomous coding agents working in this repository.
It documents the practical rules, commands, and conventions used in this codebase.

## Quick Context
- Product: SpyGrocery, a grocery price-comparison web app.
- Frontend stack: Nuxt 4 + Vue 3 + Tailwind.
- State: Pinia.
- Backend: Nitro server routes in `server/api/*`.
- Data: Supabase (`@nuxtjs/supabase`, server uses `serverSupabaseClient(event)`).
- Visual direction: black/white editorial, strong typography, low-color UI.

## Cursor / Copilot Rules
- Checked and currently not present:
  - `.cursor/rules/**`
  - `.cursorrules`
  - `.github/copilot-instructions.md`
- If these files are added later, treat them as higher-priority repo rules.

## Canonical Docs to Follow
- `docs/STRUCTURE.md` for architecture/layering.
- `docs/STYLING.md` for visual/UI rules.
- `docs/SUPABASE_DB.md` for DB facts and Supabase workflow notes.

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
- Typecheck (optional Nuxt TS check): `npx nuxi typecheck`
- Unit tests: not configured in this repo today.

Single-test guidance (important for agents):
- There is no test runner configured right now, so no real single-test command exists.
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
- Preferred flow:
  - Component/Page -> Store -> Composable -> Server API -> Service -> Repository -> Supabase.
- Avoid skipping layers (e.g., component calling DB logic directly).
- Keep UI concerns out of services/repositories.
- Keep HTTP concerns out of services.

## Code Style and Formatting
- Use 2-space indentation.
- Prefer single quotes in TS/JS.
- Keep code ASCII unless file/user-facing copy needs Unicode.
- Keep components focused and small.
- Avoid unnecessary comments; only explain non-obvious logic.

## Vue / Nuxt Conventions
- Use `<script setup lang="ts">` in Vue SFCs.
- Prefer explicit actions over watcher-heavy hidden flows.
- Guard browser-only APIs with `process.client`.
- Keep page files for composition and wiring, not business logic.
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
- Stores: `camelCase.ts`, exporting `useXStore`
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
- Select only needed fields; avoid unbounded selects.
- Keep DB access in repositories.
- Keep query/business orchestration in services.
- If DB state is uncertain and MCP is available, verify instead of guessing.

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
- Supabase auth redirect behavior depends on `nuxt.config.ts` settings.
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
- No new custom CSS files or ad-hoc visual themes.
- No implicit side-effect chains driven by many watchers.
