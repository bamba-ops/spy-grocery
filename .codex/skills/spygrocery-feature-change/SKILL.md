---
name: spygrocery-feature-change
description: Implement or modify a user-facing SpyGrocery web feature in the Nuxt app while preserving the layered architecture, current API/data contracts, and editorial Tailwind styling. Use when work touches pages/components, Pinia stores, composables, Nitro API routes, services, repositories, or shared types. Do not use for auth-only work, schema-only migration work, or generic debugging with no feature change.
---

# SpyGrocery Feature Change

## Start Sequence
1. Read `web/AGENTS.md` first and follow it.
2. Read `web/docs/STRUCTURE.md` for layering rules.
3. Read `web/docs/STYLING.md` for UI and interaction rules.
4. Read `web/docs/SUPABASE_DB.md` when backend/data facts matter.
5. If docs diverge from implementation, prioritize current server/API code plus `web/docs/SUPABASE_DB.md` as source of truth.

## Architecture Constraints (Mandatory)
- Preserve the flow `UI -> Store -> Composable -> API -> Service -> Repository -> Supabase`.
- Keep pages/components focused on UI and wiring.
- Keep shared feature state and user actions in Pinia stores.
- Keep data-access wrappers and adapters in composables.
- Keep Nitro API routes as thin HTTP controllers (parse/validate/delegate/return).
- Keep business logic in services.
- Keep Supabase/SQL access in repositories.

## Hard Prohibitions
- Do not call Supabase directly from pages/components.
- Do not place business logic in Nitro controllers.
- Do not bypass layers for quick fixes.
- Do not add custom CSS files; use Tailwind utility classes only.

## UI/Design Guardrails
- Preserve the editorial black/white direction.
- Preserve Manrope/Fraunces usage (`font-sans`, `font-display`).
- Keep visible interactive states: hover, focus-visible, and disabled.
- Verify mobile and desktop behavior for touched UI.

## Data and Contract Guardrails
- Respect current data model: `products` + `product_prices` + `lists` + `ai_chat_sessions` + `onboarding`, with stores derived from `products`.
- Avoid reintroducing legacy assumptions (`latest_price`, legacy featured/promo flows, direct `stores` table dependency) unless explicitly requested.
- Keep current endpoint contracts aligned when touched:
  - `GET /api/products/search`
  - `GET /api/products/[slug]`
  - `GET /api/products/route/[store]/[product]`
  - `GET /api/stores`
  - `GET/POST /api/lists`
  - `PATCH/DELETE /api/lists/[id]`
  - `GET/PATCH /api/onboarding`
  - `GET/POST /api/ai/sessions`
  - `GET/DELETE /api/ai/sessions/[id]`
  - `POST /api/ai/chat`
- Keep shared types synchronized with API responses.

## Implementation Workflow
1. Identify impacted layers and files before editing.
2. Apply smallest coherent cross-layer change.
3. Update types/contracts when behavior changes.
4. Keep naming and style conventions from `web/AGENTS.md`.
5. Validate behavior and regression surface after edits.

## Explainability and Debug Rules (Mandatory)
- For each feature implementation, add short code comments in touched files to explain intent and flow.
- Comments must explain **why** and expected behavior, not restate obvious syntax.
- Add frontend and backend `console.log` traces at important checkpoints:
  - page/component entry actions,
  - store actions and state transitions,
  - API handler start + validation branch,
  - service decision points,
  - repository query result summaries.
- Keep logs simple: no mandatory layer prefix like `[frontend]` or `[backend]`.
- Always use a feature prefix on logs so traces stay searchable (example: `[onboarding] ...`).
- Log structured context (route, ids, step, counts) but never secrets or sensitive payloads.
- Avoid noisy logs in tight loops; prefer one summary log with counts/status.
- If debug logs are intentionally kept for rollout monitoring, add an explicit code comment near the log.

## Required Validation
- Run `npm run build` at minimum after code changes.
- Run `npx nuxi typecheck` when touching shared types/contracts, if available.
- If validation cannot run, report the blocker and residual risk explicitly.

## Final Output Contract
Always finish with:
- Touched files summary (grouped by layer).
- Commands run and key outcomes.
- Remaining risks, assumptions, or follow-up checks.

## Hard Rules
- Every non-trivial implementation must include explanatory comments and debug logs across relevant layers.
- Never log secrets, tokens, auth headers, raw personal data, or full unredacted payloads.
