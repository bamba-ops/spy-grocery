# Supabase DB Overview (SpyGrocery)

This document explains the current database structure in Supabase for the SpyGrocery project.
Data below was collected via Supabase MCP (project `rsaahxavonavatcsntcf`).

## Quick Summary

- Project: `spygrocery_v2` (ref: `rsaahxavonavatcsntcf`)
- Main schema: `public`
- Core tables:
  - `products`
  - `prices`
  - `stores`
  - `client`
- Core view:
  - `latest_price`

Current row counts:
- `products`: 184,288
- `prices`: 193,029
- `stores`: 6
- `client`: 50

## Data Model (Mental Map)

Logical relationships (used by app):
- `stores (1)` -> `products (many)` via `products.store_id`
- `products (1)` -> `prices (many)` via `prices.product_id`
- `stores (1)` -> `prices (many)` via `prices.store_id`

Important note:
- These links exist logically and in app code, but there are currently no DB-level foreign key constraints on `products.store_id`, `prices.product_id`, or `prices.store_id`.

## Tables

### `public.products`
Purpose:
- Product catalog rows scoped by store.

Primary key:
- `id uuid` (default `gen_random_uuid()`)

Key columns:
- `store_id uuid`
- `name varchar`
- `brand varchar`
- `slug text`
- `unit varchar`
- `image_url varchar`
- `link text`
- `created_at timestamptz` (default `now()`)
- `created_date date` (default `CURRENT_DATE`)

Important indexes:
- `products_store_id_idx` on `(store_id)`
- `products_store_slug_idx` on `(store_id, slug)`
- `products_store_slug_key` UNIQUE on `(store_id, slug)`
- trigram/full-text search indexes:
  - `products_name_trgm_idx`
  - `products_name_brand_trgm_idx`
  - `idx_products_brand_trgm`
  - `products_name_tsv_idx`

### `public.prices`
Purpose:
- Price snapshots over time per product/store.

Primary key:
- `id uuid` (default `gen_random_uuid()`)

Key columns:
- `product_id uuid`
- `store_id uuid`
- `price numeric` (check `price >= 0`)
- `unit varchar`
- `price_un numeric`
- `quantity numeric`
- `is_promo boolean`
- `created_at timestamptz` (default `now()`)
- `created_date date` (default `CURRENT_DATE`)

Important indexes:
- `prices_product_store_created_idx` on `(product_id, store_id, created_at desc)`
- `unique_price_today` UNIQUE on `(store_id, product_id, created_date)`

Why `unique_price_today` matters:
- It guarantees one price row per day per `(store, product)`.
- Any dedupe/relink operation must respect this (delete collisions before relinking IDs).

### `public.stores`
Purpose:
- Store metadata and scraping/config fields.

Primary key:
- `id uuid` (default `gen_random_uuid()`)

Unique:
- `name` unique

Key columns:
- `name varchar`
- `slug text`
- `image_url varchar`
- `cookies text`
- `api_url text`
- `cookies_json jsonb`
- `wait_for_selector text`
- `created_at timestamptz` (default `now()`)

Known stores:
- iga
- Maxi
- Metro
- provigo
- superc
- walmart

### `public.client`
Purpose:
- App client/user profile mapping.

Primary key:
- `id uuid` (default `gen_random_uuid()`)

Unique:
- `email`
- `user_id` (default `auth.uid()`)

Key columns:
- `email text`
- `user_id uuid`
- `created_at timestamptz` (default `now()`)

## Views

### `public.latest_price`
Definition logic:
- `DISTINCT ON (product_id, store_id)`
- ordered by `created_at DESC`
- returns latest known price row for each `(product, store)` pair.

Columns exposed:
- `product_id`, `store_id`
- `price`, `price_un`, `unit`, `quantity`, `is_promo`
- `created_at`, `created_date`

Used by app:
- `/api/products/search` uses this view to attach current price/promo data to products.

Other small views present:
- `public.product_slugs`
- `public.store_slugs`

## Functions

### `public.slugify(input text) -> text`
Purpose:
- lowercases/unaccents input and replaces non-alphanumerics with `-`.

Used for:
- generating store-scoped product slugs.

## RLS (Row Level Security)

RLS is enabled on all four main tables.

Current notable policies:
- `stores`:
  - `anon` SELECT allowed (`true`)
  - `authenticated` SELECT allowed (`true`)
- `products` / `prices`:
  - `authenticated` SELECT allowed (`true`)
  - `public` policy exists with restriction to specific store IDs
- `client`:
  - authenticated INSERT allowed
  - authenticated SELECT only own row (`auth.uid() = user_id`)

Practical implication:
- Authenticated users can read full product/price datasets.
- Anonymous/public access on products/prices is currently restricted by policy.

## Migrations Present

Applied migration files include:
- `create_latest_price_view`
- `add_price_product_store_created_idx`
- `drop_unused_functions_and_view`
- `drop_app_functions`
- `add_products_store_slug_idx`
- `backfill_product_slugs_store_scoped`
- `create_slugify_function`
- `backfill_missing_slugs_batch`
- `dedupe_slugs_per_store`
- `add_unique_store_slug`
- `populate_stores`

## Architecture Notes (for dev work)

- Search endpoint is now layered:
  - controller: `server/api/products/search.get.ts`
  - service: `server/services/products/searchProducts.ts`
  - repos: `server/repositories/productsRepository.ts`
- Stores endpoint is now layered:
  - controller: `server/api/stores/index.get.ts`
  - service: `server/services/stores/listStores.ts`
  - repo: `server/repositories/storesRepository.ts`

## Known Gaps / Recommendations

1. Consider adding foreign keys (if ingestion flow allows it):
   - `products.store_id -> stores.id`
   - `prices.product_id -> products.id`
   - `prices.store_id -> stores.id`
2. Review public RLS for `products/prices` to ensure intended anonymous behavior.
3. Keep `latest_price` logic as the canonical "current price" source.
4. Keep slug uniqueness store-scoped (`(store_id, slug)`).

## Agent Workflow Note (MCP Supabase)

- For any request that needs database inspection or verification, use the Supabase MCP tools first.
- Preferred MCP tools for DB checks:
  - `supabase_list_projects`
  - `supabase_list_tables`
  - `supabase_execute_sql`
  - `supabase_list_migrations`
  - `supabase_get_advisors`
- Do not guess DB state when MCP can confirm it.
- Keep this document updated when new DB facts are discovered through MCP.
