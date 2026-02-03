# spygrocery_v2 database snapshot

Snapshot source: Supabase MCP tools (read-only).

## Schema overview (public)

### Tables (RLS enabled on all)

#### products (~200,932 rows)
- id uuid (PK, default gen_random_uuid())
- slug text
- name varchar
- image_url varchar
- brand varchar
- unit varchar
- store_id uuid
- created_at timestamptz (default now())
- created_date date (default CURRENT_DATE)
- link text

#### prices (~167,336 rows)
- id uuid (PK, default gen_random_uuid())
- product_id uuid
- store_id uuid
- price numeric (check price >= 0)
- unit varchar
- price_un numeric
- quantity numeric
- is_promo boolean
- created_at timestamptz (default now())
- created_date date (default CURRENT_DATE)

#### stores (0 rows)
- id uuid (PK, default gen_random_uuid())
- slug text
- name varchar (unique)
- image_url varchar
- cookies text
- api_url text
- cookies_json jsonb
- wait_for_selector text
- created_at timestamptz (default now())

#### client (0 rows)
- id uuid (PK, default gen_random_uuid())
- email text (unique)
- user_id uuid (unique, default auth.uid())
- created_at timestamptz (default now())

## Views
- product_slugs: SELECT products.slug FROM products
- store_slugs: SELECT stores.slug FROM stores
- stores_with_access: marks is_unlocked for two hardcoded store UUIDs

## Functions (public schema)
- get_products_page(p_offset, p_limit, p_store_id, p_search_text, p_sort_price, p_only_promo)
  - Returns TABLE with product + store + price fields
- get_products_by_store_name(p_offset, p_limit, p_store_name, p_search_text, p_sort_price, p_only_promo)
  - Returns TABLE with product + store + price fields
- get_products_by_ids(p_ids uuid[])
  - Returns TABLE(id, name, brand, image_url, unit, link, price_un)
- search_products(p_query, p_limit, p_offset) -> SETOF products
- search_products_v2(p_query, p_limit, p_offset) -> SETOF products
- search_products_v4(search_text) -> TABLE(store_id, store_name, store_image_url, total_relevance, products jsonb)
- pg_trgm/unaccent helper functions (similarity, word_similarity, etc.)

## Constraints / relationships
- No foreign keys defined in public schema.
- Logical relationships:
  - prices.product_id -> products.id
  - prices.store_id -> stores.id

## Extensions (installed highlights)
- pg_trgm, unaccent (text search)
- pg_cron
- pg_stat_statements
- pgcrypto, pgjwt, pgsodium
- vector
- pg_graphql

## Migrations
- No migrations listed in Supabase.

## Notes
- stores and client tables currently have 0 rows.
- RLS enabled on all public tables.
