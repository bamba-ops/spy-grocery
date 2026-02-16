# Project Map (Search / Lists / Stores)

But: avoir une vue claire des flux actuels avant refactor.
Scope: frontend Nuxt + API Nitro + state Pinia + localStorage.

## Vue d'ensemble

- Entry app: `app/app.vue` -> `NuxtLayout` -> `NuxtPage`.
- Layout mobile/global nav: `app/layouts/bottom-nav.vue`.
- Pages principales:
  - `app/pages/search.vue`
  - `app/pages/lists.vue`
- State global:
  - `app/stores/lists.ts`
  - `app/stores/search.ts`
  - `app/stores/stores.ts`
- Data fetch front:
  - `app/composables/api/useProducts.ts`
  - `app/composables/api/useStores.ts`
  - `app/composables/feature/useSearch.ts`
  - `app/composables/feature/useLists.ts`
- API server:
  - `server/api/products/search.get.ts`
  - `server/api/stores/index.get.ts`

---

## Flux 1: Search (query + filtres + pagination)

### UI/Pages
- `app/pages/search.vue` monte la page (results + panel) et applique le layout `bottom-nav`.
- `app/components/SearchResults.vue`
  - lit `searchStore.results`, `loading`, `error`, `page`
  - debounce sur `searchStore.query`
  - lance `searchStore.search()` au mount
  - pagination Prev/Next via `searchStore.prevPage()/nextPage()`
- `app/components/SearchSidebar.vue`
  - charge les stores (`storesStore.loadStores()`)
  - synchronise filtres (sort, store, promos)
  - met a jour `searchStore.selectedStores`

### State
- `app/stores/search.ts`
  - source of truth pour: query, sort, page, selectedStores, promos
  - action `search()` -> appelle `useProducts().search(...)`
  - getters: `totalPages`, `offset`
- `app/stores/stores.ts`
  - charge la liste des magasins et la selection par defaut

### Data (front -> API)
- `app/composables/api/useProducts.ts`
  - `$fetch('/api/products/search', { query: params })`

### API (server)
- `server/api/products/search.get.ts`
  - parse `q, stores, sort, limit, offset, promos, dedupe`
  - query Supabase `products`
  - enrichit avec `stores` + `latest_price`
  - filtre promo + dedupe (guardrail)
  - retourne `{ products, total, page, limit, totalPages }`

### Points sensibles actuels
- Logique metier assez lourde dans le controlleur API (candidate pour `server/services/*`).
- Acces donnees Supabase melange avec mapping DTO dans le meme fichier.

---

## Flux 2: Stores (catalogue + selection)

### UI
- Utilise principalement `SearchSidebar.vue`.

### State
- `app/stores/stores.ts`
  - `loadStores()` appelle `useStores().fetchStores()`
  - garde `selectedStoreIds`
  - expose `getAllStoresIds`, `storesWithSelection`

### Data (front -> API)
- `app/composables/api/useStores.ts`
  - `$fetch('/api/stores')`

### API
- `server/api/stores/index.get.ts`
  - lit `stores`
  - lit `products` pour compter par store
  - retourne `stores` avec `product_count`

### Point sensible actuel
- Le comptage est fait en RAM cote API apres select large `products(store_id)`.
  (optimisable plus tard via SQL agregation/repository)

---

## Flux 3: Lists (saved lists + drawer)

### UI/Pages
- `app/pages/lists.vue`
  - charge les listes sauvegardees depuis store
  - filtre/sort via `ListsToolbar`
  - open list: charge la liste et ouvre drawer
  - delete list: confirmation + suppression
- `app/components/SavedListCard.vue`
  - click card -> `open`
  - click trash -> `delete`
- `app/components/CreateListCard.vue`
  - lien vers `/search`
- `app/components/ShoppingListDrawer.vue` et `app/components/SearchListPanel.vue`
  - affichent la liste courante
  - save (nommee)
  - clear

### State
- `app/stores/lists.ts`
  - liste courante `items` + drawer `isOpen`
  - listes sauvegardees `savedLists`
  - save/load/delete via module localStorage dedie
  - clear: `clearList()`

### Data persistence
- LocalStorage keys:
  - `spygrocery:saved-lists` (source principale)
  - `spygrocery:shopping-list` (legacy import fallback)

### Point sensible actuel
- Le store unifie combine etat liste courante + listes sauvegardees.
  (coherent pour simplifier maintenant, mais a surveiller si la taille grossit)

---

## Contrat de responsabilites (a respecter des maintenant)

- `pages`: orchestration de composants, pas de logique metier.
- `components`: rendering + interactions locales.
- `stores`: etat global + actions.
- `composables`: fetch wrappers et utilitaires reutilisables.
- `server/api`: controleurs HTTP uniquement.
- `server/services` (prochaine etape): use-cases metier.
- `server/repositories` (prochaine etape): acces Supabase/DB.

## Prochaine etape de refactor (commit 1 cible)

- Extraire la logique de `server/api/products/search.get.ts` vers:
  - `server/services/products/searchProducts.ts`
  - `server/repositories/productsRepository.ts`
  - `server/repositories/storesRepository.ts`
  - `server/repositories/pricesRepository.ts`

Puis laisser `server/api/products/search.get.ts` comme simple controleur.
