# Supabase DB Overview (SpyGrocery)

This document reflects the current production-like Supabase state inspected via MCP on **March 20, 2026**.

## Quick Summary

- Project URL: `https://thtxpbkjwabegyikrdhu.supabase.co`
- Main schema: `public`
- Active tables used by web app:
  - `products`
  - `product_prices`
- No public views are currently present (`latest_price` no longer exists).

Current row counts:
- `products`: `5,362`
- `product_prices`: `5,362`

## Data Model

Logical model:
- `products` is the current searchable product snapshot table.
- `product_prices` is historical price tracking per product observation.

Database-level relationship:
- `product_prices.product_id -> products.id` (`ON DELETE CASCADE`)

Key uniqueness:
- `products.slug` is unique.
- `product_prices` enforces one row per product per UTC day via expression unique index:
  - `(product_id, ((observed_at AT TIME ZONE 'UTC')::date))`

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

## Views and Functions

- `public` views: none.
- `public` functions: none.

## RLS / Security Status

Supabase advisors currently report:
- `RLS Disabled in Public` on:
  - `public.products`
  - `public.product_prices`

Reference:
- https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public

Performance advisory currently reported:
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

## Current Web API Contract (Aligned)

### `GET /api/products/search`

Query params:
- `q?: string`
- `store?: string` (`all` or one store id/slug)
- `sort?: 'price_asc' | 'price_desc' | 'title_asc' | 'recent'`
- `on_sale?: 'true' | 'false'`
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

## Notes for Agents

- Do not assume `stores`, `prices`, or `latest_price` exist.
- For current price display, use `products.price_num`.
- Keep `product_prices` for analytics/history workflows.
- If schema is uncertain, re-check with Supabase MCP before coding.
