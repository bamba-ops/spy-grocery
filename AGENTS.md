# AGENTS.md
# Repo guide for agentic coding (Nuxt 4)

## Goal
- SpyGrocery is a grocery price-comparison web app.
- Current app is Nuxt 4 (not the legacy Vue app).
- Landing page is being rebuilt; keep it modular and easy to extend.

## Commands
- Install: npm install
- Dev: npm run dev (use -- --port 3001 if needed)
- Build: npm run build
- Preview: npm run preview
- Lint/Test: not configured

## Stack
- Nuxt 4
- Vue 3
- Tailwind CSS (classes only, no custom CSS)
- Pinia (manual plugin in app/plugins/pinia.ts)
- Supabase module (@nuxtjs/supabase)
- Icons: lucide-vue-next

## Project layout (current)
- app/
  - components/
    - AppNavBar.vue
    - HeroSection.vue
  - pages/
    - index.vue (renders AppNavBar + HeroSection)
    - stores/[storeSlug]/products/[slug].vue (mock product detail)
    - login.vue (static placeholder, no redirects)
  - plugins/
    - pinia.ts (manual Pinia setup)
  - types/
    - database.types.ts (stub)
- public/
  - hero-bg.png
  - hero-bg-3.mp4 (hero background video)
- nuxt.config.ts
- package.json

## Nuxt config notes
- supabase.redirect: false (prevents auto /login redirect)
- Tailwind module enabled in nuxt.config.ts

## Legacy app
- The old Vue 3 + Vite app was moved to docs/frontend/ (do not edit for Nuxt work).

## Routes (current Nuxt)
- / (landing)
- /stores/[storeSlug]/products/[slug] (mock product detail)
- /login (static placeholder page)

## Data model decisions
- Store-scoped product routes are the chosen strategy:
  - /stores/[storeSlug]/products/[slug]
- No global canonical product table for now.

## Supabase DB changes already applied
- View: public.latest_price (distinct per product_id + store_id, ordered by created_at desc)
- Indexes:
  - prices(product_id, store_id, created_at desc)
  - products(store_id)
  - products(store_id, slug)
  - unique index on products(store_id, slug)
- Slugs:
  - slugify() function added
  - backfilled missing slugs from name
  - per-store slug dedupe by appending -<id>
- Cleanup:
  - dropped stores_with_access view
  - dropped functions: get_products_page, get_products_by_store_name, get_products_by_ids,
    search_products_v4, increment_limit_usage

## Supabase data status (audit highlights)
- products: 200,932
- prices: 200,932
- stores: 6
- no orphan prices/products
- many missing slugs before backfill (now fixed with unique constraint)

## UX flow (planned)
- Search once -> user picks product -> product detail shows similar products grouped by store.
- No canonical product matching yet; similarity is user-driven.

## UI direction
- Big editorial typography + soft mesh gradients (Marc Lou playbook).
- CTA in navbar and hero. Demo preview in hero.

## Media
- Hero uses background video: /hero-bg-3.mp4
- Poster fallback: /hero-bg.png

## Known issues / gotchas
- Some users experienced /login redirect from Supabase module; fixed with supabase.redirect: false.
- No tests/lint configured.

## When editing
- Use Tailwind classes only (no custom CSS files).
- Keep hero/nav in separate components.
- Use Nuxt composables and script setup.
