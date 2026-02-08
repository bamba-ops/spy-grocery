# SpyGrocery Data Layer Documentation

## Overview
Clean, simple data layer architecture for SpyGrocery built with Nuxt 4 + Supabase + Pinia.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Components (Vue)                      │
│            SearchResults.vue, SearchSidebar.vue          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Composables (Data Access)                   │
│     useProducts(), useStores(), useProductImage()        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│               Pinia Stores (State)                       │
│         searchStore, storesStore, shoppingList           │
└────────────────────┬────────────────────────────────────┘
                     │
┌──────────────────▼────────────────────────────────────┐
│                Server API (Nuxt)                         │
│     GET /api/stores, GET /api/products/search            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│           Supabase (serverSupabaseClient)                │
│      products, stores, prices, latest_price view         │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
app/
├── types/
│   ├── database.types.ts       # Auto-generated from Supabase
│   └── index.ts                # Clean domain types (Product, SearchParams, etc.)
│
├── composables/
│   ├── useProducts.ts          # Product search wrapper
│   ├── useStores.ts            # Store list wrapper
│   └── useProductImage.ts      # Image display with emoji fallback
│
├── stores/
│   ├── search.ts               # Search query, results, pagination, sorting
│   ├── stores.ts               # Store list cache + filter selection
│   └── shoppingList.ts         # Shopping cart (updated with new Product type)
│
└── components/
    ├── SearchResults.vue       # Uses searchStore + real data
    └── SearchSidebar.vue       # Dynamic store filters + sorting

server/
└── api/
    ├── stores/
    │   └── index.get.ts        # GET /api/stores
    └── products/
        └── search.get.ts       # GET /api/products/search
```

## API Endpoints

### GET /api/stores
Returns all stores with product counts.

**Response:**
```json
{
  "stores": [
    {
      "id": "uuid",
      "name": "IGA",
      "slug": "iga",
      "image_url": "https://...",
      "product_count": 47193
    }
  ]
}
```

### GET /api/products/search
Search products with filters, sorting, and pagination.

**Query Parameters:**
- `q` (string) - Search query (fuzzy match on name/brand)
- `stores` (string) - Comma-separated store IDs
- `sort` (string) - Sort order: `price-low`, `price-high`, `name`
- `limit` (number) - Results per page (default: 50)
- `offset` (number) - Pagination offset

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Organic Milk",
      "brand": "Horizon",
      "slug": "organic-milk-123",
      "unit": "1L",
      "image_url": "https://...",
      "link": "https://...",
      "store": {
        "id": "uuid",
        "name": "IGA",
        "slug": "iga",
        "image_url": "https://..."
      },
      "price": 4.99,
      "price_un": 4.99,
      "price_unit": "L",
      "is_promo": false
    }
  ],
  "total": 1234,
  "page": 1,
  "limit": 50,
  "totalPages": 25
}
```

## Types

### Core Domain Types (app/types/index.ts)

```typescript
// Simple product type with store and price included
interface Product {
  id: string
  name: string
  brand: string | null
  slug: string
  unit: string | null
  image_url: string | null
  link: string | null
  store: {
    id: string
    name: string
    slug: string
    image_url: string | null
  }
  price: number | null
  price_un: number | null
  price_unit: string | null
  is_promo: boolean | null
}

// Search parameters
interface SearchParams {
  q?: string
  stores?: string
  sort?: 'price-low' | 'price-high' | 'name'
  limit?: number
  offset?: number
}

// Search response
interface SearchResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

## Pinia Stores

### searchStore (app/stores/search.ts)
Manages search state, results, and pagination.

**State:**
- `query` - Current search query
- `results` - Product array
- `total` - Total results count
- `page` - Current page number
- `limit` - Results per page
- `sortBy` - Sort order
- `loading` - Loading state
- `error` - Error message

**Actions:**
- `search()` - Execute search with current params
- `setQuery(q)` - Update query and reset to page 1
- `setSortBy(sort)` - Change sort order and re-search
- `nextPage()`, `prevPage()`, `goToPage(n)` - Pagination

### storesStore (app/stores/stores.ts)
Manages store list and filter selection.

**State:**
- `stores` - Array of all stores
- `selectedStoreIds` - Array of selected store IDs
- `loaded` - Whether stores have been loaded

**Actions:**
- `loadStores()` - Fetch stores from API (cached)
- `toggleStore(id)` - Select/deselect store
- `selectAll()`, `deselectAll()` - Bulk selection

**Getters:**
- `storesWithSelection` - Stores with `selected` property

## Composables

### useProducts()
```typescript
const { search } = useProducts()

const { data, error, pending } = search({
  q: 'milk',
  stores: 'id1,id2',
  sort: 'price-low',
  limit: 50,
  offset: 0
})
```

### useStores()
```typescript
const { fetch } = useStores()

const { data } = fetch() // Returns { stores: [...] }
```

### useProductImage()
```typescript
const { getImageDisplay } = useProductImage()

const display = getImageDisplay(product.image_url, product.name)
// Returns: { type: 'url'|'emoji', value: string }
```

## Component Integration

### SearchResults.vue
- Uses `searchStore` for data
- Displays products in grid or list view
- Debounced search (400ms)
- Pagination controls
- Image display with emoji fallback
- Loading and empty states

### SearchSidebar.vue
- Loads stores on mount
- Dynamic store checkboxes
- Sort by dropdown
- Triggers search on filter change

## Features

✅ **Search** - Fuzzy search by product name/brand (ILIKE)  
✅ **Filtering** - Multi-select stores  
✅ **Sorting** - Price (low/high), name (A-Z)  
✅ **Pagination** - 50 results per page  
✅ **Images** - Direct display with emoji fallback  
✅ **Loading States** - Skeleton screens  
✅ **Error Handling** - User-friendly error messages  
✅ **Promo Badges** - "SPY DEAL" for promotional items  
✅ **Unit Prices** - Display unit price with unit ($/L, $/kg, etc.)  

## Database Schema

### Tables
- **products** (200,932 rows) - Product catalog per store
- **stores** (6 rows) - IGA, Metro, Provigo, Maxi, Super C, Walmart
- **prices** (200,932 rows) - Historical price data
- **latest_price** (view) - Most recent price per product/store

### Indexes
- `products(store_id, slug)` - Unique constraint for store-scoped URLs
- `prices(product_id, store_id, created_at DESC)` - Latest price queries
- Trigram indexes on `products.name` and `products.brand` for fuzzy search

## Performance Considerations

1. **Caching** - Store list cached in Pinia (rarely changes)
2. **Pagination** - Limit 50 results per page
3. **Debounced Search** - 400ms delay to reduce API calls
4. **Lazy Loading** - Images loaded lazily with `loading="lazy"`
5. **Server-Side Search** - Complex queries handled by server API

## Future Enhancements

- [ ] Add price history tracking
- [ ] Implement similar products across stores
- [ ] Add user favorites (requires auth)
- [ ] Cache search results in localStorage
- [ ] Add Redis cache for server API
- [ ] Unit price normalization (e.g., all to $/100g)
- [ ] Advanced filters (brand, price range)
- [ ] Search autocomplete/suggestions

## Development

**Start dev server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

## Notes

- No custom CSS - Tailwind utility classes only
- All types are generated from Supabase schema
- Server API uses `serverSupabaseClient` for secure access
- Composables use `useFetch` for SSR-friendly data fetching
- Pinia stores manage global state (search, filters)
- Components are kept simple and focused
