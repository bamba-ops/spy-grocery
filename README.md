# SpyGrocery Web (Nuxt 4)

## Table of Contents
- [English](#english)
  - [Overview](#overview)
  - [Current Features](#current-features)
  - [Tech Stack](#tech-stack)
  - [Architecture Contract](#architecture-contract)
  - [Project Structure](#project-structure)
  - [Local Setup](#local-setup)
  - [Environment Variables](#environment-variables)
  - [Available Commands](#available-commands)
  - [Internal API Overview](#internal-api-overview)
  - [Core Types (Reference)](#core-types-reference)
  - [Data Model Summary](#data-model-summary)
  - [Local Storage Behavior (Lists)](#local-storage-behavior-lists)
  - [Styling Direction](#styling-direction)
  - [Known Limitations](#known-limitations)
  - [Detailed Docs](#detailed-docs)
- [Français](#français)
  - [Vue d'ensemble](#vue-densemble)
  - [Fonctionnalités actuelles](#fonctionnalités-actuelles)
  - [Stack technique](#stack-technique)
  - [Contrat d'architecture](#contrat-darchitecture)
  - [Structure du projet](#structure-du-projet)
  - [Setup local](#setup-local)
  - [Variables d'environnement](#variables-denvironnement)
  - [Commandes disponibles](#commandes-disponibles)
  - [Aperçu API interne](#aperçu-api-interne)
  - [Types principaux (référence)](#types-principaux-référence)
  - [Résumé du modèle de données](#résumé-du-modèle-de-données)
  - [Comportement localStorage (listes)](#comportement-localstorage-listes)
  - [Direction styling](#direction-styling)
  - [Limites connues](#limites-connues)
  - [Documentation détaillée](#documentation-détaillée)

---

## English

### Overview
SpyGrocery is a grocery price-comparison web app.
It lets users search products once and compare prices across stores, then build a local shopping list to estimate totals.

### Current Features
- Product search with server-side pagination (`/search`).
- Sort options: `price_asc`, `price_desc`, `title_asc`, `recent`.
- Store filter (`all` or one store).
- Product cards include a store link (`View on store`) when `url` is available.
- Product details page (`/products/[slug]`) with cross-store alternatives.
- Auth flow with Supabase (`/login` + `/auth/confirm`): magic link + Google sign-in.
- Protected lists page (`/lists`) with auth middleware and post-login `next` redirect.
- Save/update list actions gated by an auth-required prompt.
- Shopping drawer with grouped items by store and total estimate.
- Mobile bottom-nav auth action (compact floating login/logout control).
- AI chat on `/search` with two modes:
  - normal assistant mode (streamed text answers),
  - grocery-list mode (`createListMode`) that streams a structured list data part for UI preview/add-to-list.
- AI chat sessions (`/api/ai/sessions*`) with persisted `UIMessage[]` snapshots.

### Tech Stack
- Nuxt 4 + Vue 3
- Nitro server routes (`server/api/*`)
- Pinia (feature state)
- Supabase (`@nuxtjs/supabase`)
- Tailwind CSS
- Vercel AI SDK (`ai`, `@ai-sdk/vue`)
- `lucide-vue-next` icons
- `vue-sonner` toasts

### Architecture Contract
Layered flow used in this repo:

`UI (pages/components) -> Store (Pinia) -> Composable (data access) -> API route -> Service -> Repository -> Supabase`

Key rule: do not skip layers for business/data logic.

### Project Structure
```text
web/
  app/
    components/      # UI components
    composables/     # Front data access + local persistence helpers (incl. api/useChat.ts, api/useLists.ts)
    layouts/         # Shared layouts
    pages/           # Routes (/, /search, /products/[slug], /lists, /login, /auth/confirm)
    plugins/         # Pinia plugin
    stores/          # Pinia feature stores (auth, lists, search, chat, productDetails)
  server/
    api/             # Nitro HTTP handlers
    services/        # Use-case/business orchestration
    repositories/    # Supabase query layer (products, lists, ai)
  shared/
    types/           # Shared domain + DB types
    utils/           # Shared helpers
  docs/              # Deeper architecture/DB/styling plans
```

### Local Setup
Prerequisites:
- Node.js 20+ recommended
- npm

Install and run:
```bash
npm install
npm run dev
```

App runs locally on the Nuxt default dev port (usually `http://localhost:3000`).

### Environment Variables
Create `web/.env` with:

```bash
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<your-publishable-or-anon-key>
NUXT_AI_GATEWAY_API_KEY=<your-vercel-ai-gateway-key>
```

Nuxt Supabase module uses these in `nuxt.config.ts`.

### Available Commands
```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview built app
npm run generate  # Static generation
```

### Internal API Overview

#### `GET /api/products/search`
Query params:
- `q?: string`
- `store?: string` (`all` or one store id/slug)
- `sort?: 'price_asc' | 'price_desc' | 'title_asc' | 'recent'`
- `limit?: number` (default: `50`, max: `100`)
- `offset?: number` (default: `0`)

Response:
```ts
{
  items: SearchProduct[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

#### `GET /api/stores`
Returns stores derived from `products` rows (not from a dedicated `stores` table in this web app contract):

```ts
{
  stores: StoreFacet[]
}
```

#### `GET /api/products/[slug]`
Returns one product plus comparable alternatives from other stores:

```ts
{
  product: SearchProduct
  otherStoreProducts: SearchProduct[]
}
```

#### Lists API (authenticated)

`GET /api/lists`
```ts
{
  lists: PersistedList[]
}
```

`POST /api/lists`
```ts
body: {
  name: string
  items: ListProduct[]
}
```

`PATCH /api/lists/[id]`
```ts
body: {
  name: string
  items: ListProduct[]
}
```

`DELETE /api/lists/[id]`
```ts
{
  success: true
}
```

#### AI Sessions API (authenticated)

`GET /api/ai/sessions`
```ts
{
  sessions: ChatSession[]
}
```

`POST /api/ai/sessions`
```ts
body: {
  title?: string | null
}
```

`GET /api/ai/sessions/[id]`
```ts
{
  session: ChatSession
}
```

`DELETE /api/ai/sessions/[id]`
```ts
{
  success: true
}
```

#### `POST /api/ai/chat`
Streaming chat endpoint used by the AI chat panel on `/search`.

Request body (simplified):
```ts
{
  messages: UIMessage[]
  chatId: string
  createListMode?: boolean
}
```

Behavior:
- Requires an authenticated user and a valid owned `chatId`.
- Uses tool calling with read-only SQL access to `public.products` (`query_products_sql`).
- In list mode, model must submit `ListProduct[]` through `submit_list_items`.
- Chat V1 reads from `products` only.
- Returns a UI message stream response for AI SDK UI clients.
- In list mode, stream includes a persistent data part:
  - `type: 'data-grocery-list'`
  - `data: { items: ListProduct[] }`

### Core Types (Reference)
From `shared/types/index.ts` and `shared/types/search.ts`:

```ts
type SearchSort = 'price_asc' | 'price_desc' | 'title_asc' | 'recent'

interface SearchProduct {
  id: string
  slug: string
  title: string
  brand: string | null
  store: string
  store_id: string | null
  image_url: string | null
  url: string | null
  uom: string | null
  price_num: number | null
  was_price_num: number | null
  price_text: string | null
  pre_price_text: string | null
  on_sale: boolean | null
  scraped_at: string | null
}

interface StoreFacet {
  id: string
  store_id: string | null
  name: string
  slug: string
  product_count: number
}

interface ListProduct {
  product: SearchProduct
  quantity: number
}

interface ChatSession {
  id: string
  user_id: string
  title: string | null
  messages_json: UIMessage[]
  created_at: string
  updated_at: string
  last_message_at: string
}
```

### Data Model Summary
Current Supabase model used by the app:
- `public.products` (search/read model for current product cards)
- `public.product_prices` (historical prices, analytics-ready)
- `public.lists` (user-owned saved lists, `items_json` payload)
- `public.ai_chat_sessions` (user-owned chat sessions, `messages_json` snapshot payload)

Stores in UI are derived from `products (store, store_id)` and aggregated in backend.
Current operational product dataset is treated as specials-only.

### Local Storage Behavior (Lists)
Main keys:
- `spygrocery:saved-lists`
- `spygrocery:deleted-list-names`

Behavior:
- Current shopping drawer items stay local in memory.
- Named list save/update is authenticated and opens a login prompt when needed.
- When authenticated, saved lists are written locally first, then synced to `/api/lists` (`local wins` conflict policy).
- Deleted local list names are tracked and replayed to cloud on next sync.
- On read, legacy product payload shapes are normalized to current `SearchProduct` shape.

### Styling Direction
- Editorial black/white direction.
- Typography:
  - `Manrope` for UI/body (`font-sans`)
  - `Fraunces` for display headings (`font-display`)
- Tailwind utility classes only (no custom CSS files).

### Known Limitations
- No lint script configured currently.
- No test runner configured currently.
- Typecheck is optional and depends on `vue-tsc` availability in environment.
- Local/cloud list merge strategy is intentionally simple (`local wins`, by list name).

### Detailed Docs
- [Structure guide](docs/STRUCTURE.md)
- [Supabase DB overview](docs/SUPABASE_DB.md)
- [Styling guide](docs/STYLING.md)

---

## Français

### Vue d'ensemble
SpyGrocery est une application web de comparaison de prix en épicerie.
Elle permet de rechercher des produits, comparer les prix entre magasins, puis construire une liste d'achats locale avec estimation des totaux.

### Fonctionnalités actuelles
- Recherche produits avec pagination serveur (`/search`).
- Tri disponible: `price_asc`, `price_desc`, `title_asc`, `recent`.
- Filtre magasin (`all` ou un magasin précis).
- Les cards produits affichent un lien (`View on store`) vers le site du magasin si `url` existe.
- Page détail produit (`/products/[slug]`) avec alternatives cross-store.
- Auth Supabase active (`/login` + `/auth/confirm`) avec magic link et Google.
- Page listes protégée (`/lists`) avec middleware auth et redirection `next` après login.
- Actions save/update de liste bloquées sans session (prompt de connexion).
- Drawer shopping list avec groupement par magasin et total estimé.
- Action auth mobile au-dessus de la bottom nav (login/logout compact).
- Chat IA sur `/search` avec deux modes:
  - mode assistant normal (réponses texte streamées),
  - mode création de liste (`createListMode`) qui stream une data part structurée pour prévisualiser/ajouter la liste.
- Sessions chat IA (`/api/ai/sessions*`) avec persistance snapshot `UIMessage[]`.

### Stack technique
- Nuxt 4 + Vue 3
- Routes Nitro (`server/api/*`)
- Pinia (state management)
- Supabase (`@nuxtjs/supabase`)
- Tailwind CSS
- Vercel AI SDK (`ai`, `@ai-sdk/vue`)
- Icônes `lucide-vue-next`
- Toasts `vue-sonner`

### Contrat d'architecture
Flux en couches appliqué dans ce repo:

`UI (pages/components) -> Store (Pinia) -> Composable (accès données) -> API route -> Service -> Repository -> Supabase`

Règle clé: ne pas sauter de couche pour la logique métier ou data.

### Structure du projet
```text
web/
  app/
    components/      # Composants UI
    composables/     # Accès data front + persistance locale (incl. api/useChat.ts, api/useLists.ts)
    layouts/         # Layouts partagés
    pages/           # Routes (/, /search, /products/[slug], /lists, /login, /auth/confirm)
    plugins/         # Plugin Pinia
    stores/          # Stores Pinia (auth, lists, search, chat, productDetails)
  server/
    api/             # Handlers HTTP Nitro
    services/        # Orchestration métier
    repositories/    # Couche requêtes Supabase (products, lists, ai)
  shared/
    types/           # Types domaine + DB partagés
    utils/           # Helpers partagés
  docs/              # Docs détaillées architecture/DB/styling
```

### Setup local
Prérequis:
- Node.js 20+ recommandé
- npm

Installation et lancement:
```bash
npm install
npm run dev
```

L'application tourne en local sur le port Nuxt par défaut (généralement `http://localhost:3000`).

### Variables d'environnement
Créer `web/.env` avec:

```bash
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<your-publishable-or-anon-key>
NUXT_AI_GATEWAY_API_KEY=<your-vercel-ai-gateway-key>
```

Le module Supabase Nuxt lit ces variables dans `nuxt.config.ts`.

### Commandes disponibles
```bash
npm run dev       # Lance le serveur de dev
npm run build     # Build de production
npm run preview   # Prévisualisation du build
npm run generate  # Génération statique
```

### Aperçu API interne

#### `GET /api/products/search`
Paramètres query:
- `q?: string`
- `store?: string` (`all` ou un store id/slug)
- `sort?: 'price_asc' | 'price_desc' | 'title_asc' | 'recent'`
- `limit?: number` (défaut: `50`, max: `100`)
- `offset?: number` (défaut: `0`)

Réponse:
```ts
{
  items: SearchProduct[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

#### `GET /api/stores`
Retourne les magasins dérivés des lignes `products` (pas d'usage direct d'une table `stores` dans ce contrat web):

```ts
{
  stores: StoreFacet[]
}
```

#### `GET /api/products/[slug]`
Retourne un produit et ses alternatives comparables dans d'autres magasins:

```ts
{
  product: SearchProduct
  otherStoreProducts: SearchProduct[]
}
```

#### API listes (authentifiée)

`GET /api/lists`
```ts
{
  lists: PersistedList[]
}
```

`POST /api/lists`
```ts
body: {
  name: string
  items: ListProduct[]
}
```

`PATCH /api/lists/[id]`
```ts
body: {
  name: string
  items: ListProduct[]
}
```

`DELETE /api/lists/[id]`
```ts
{
  success: true
}
```

#### API sessions IA (authentifiée)

`GET /api/ai/sessions`
```ts
{
  sessions: ChatSession[]
}
```

`POST /api/ai/sessions`
```ts
body: {
  title?: string | null
}
```

`GET /api/ai/sessions/[id]`
```ts
{
  session: ChatSession
}
```

`DELETE /api/ai/sessions/[id]`
```ts
{
  success: true
}
```

#### `POST /api/ai/chat`
Endpoint de chat en streaming utilisé par le panneau IA sur `/search`.

Body de requête (simplifié):
```ts
{
  messages: UIMessage[]
  chatId: string
  createListMode?: boolean
}
```

Comportement:
- Nécessite un utilisateur authentifié et un `chatId` possédé par cet utilisateur.
- Utilise des tools avec accès SQL lecture seule sur `public.products` (`query_products_sql`).
- En mode liste, le modèle soumet `ListProduct[]` via `submit_list_items`.
- Le chat V1 lit uniquement `products`.
- Retourne un flux de messages UI compatible AI SDK UI.
- En mode liste, le flux inclut une data part persistante:
  - `type: 'data-grocery-list'`
  - `data: { items: ListProduct[] }`

### Types principaux (référence)
Depuis `shared/types/index.ts` et `shared/types/search.ts`:

```ts
type SearchSort = 'price_asc' | 'price_desc' | 'title_asc' | 'recent'

interface SearchProduct {
  id: string
  slug: string
  title: string
  brand: string | null
  store: string
  store_id: string | null
  image_url: string | null
  url: string | null
  uom: string | null
  price_num: number | null
  was_price_num: number | null
  price_text: string | null
  pre_price_text: string | null
  on_sale: boolean | null
  scraped_at: string | null
}

interface StoreFacet {
  id: string
  store_id: string | null
  name: string
  slug: string
  product_count: number
}

interface ListProduct {
  product: SearchProduct
  quantity: number
}

interface ChatSession {
  id: string
  user_id: string
  title: string | null
  messages_json: UIMessage[]
  created_at: string
  updated_at: string
  last_message_at: string
}
```

### Résumé du modèle de données
Modèle Supabase actuel utilisé par l'app:
- `public.products` (modèle de lecture recherche/cards)
- `public.product_prices` (historique de prix, analytique)
- `public.lists` (listes sauvegardées par utilisateur, payload `items_json`)
- `public.ai_chat_sessions` (sessions chat utilisateur, payload snapshot `messages_json`)

Les magasins de l'UI sont dérivés de `products (store, store_id)` puis agrégés côté backend.
Le dataset produits opérationnel est traité comme un dataset de spéciaux.

### Comportement localStorage (listes)
Clés principales:
- `spygrocery:saved-lists`
- `spygrocery:deleted-list-names`

Comportement:
- Les items du drawer shopping list restent locaux en mémoire.
- Save/update d'une liste nommée est authentifié et ouvre un prompt de connexion si nécessaire.
- Si l'utilisateur est connecté, les listes sauvegardées sont écrites d'abord en local puis synchronisées vers `/api/lists` (`local gagne` en cas de conflit).
- Les suppressions locales sont mémorisées puis rejouées côté cloud au prochain sync.
- À la lecture, les anciens payloads produit sont normalisés vers le format `SearchProduct` actuel.

### Direction styling
- Direction éditoriale noir/blanc.
- Typographies:
  - `Manrope` pour UI/texte (`font-sans`)
  - `Fraunces` pour titres display (`font-display`)
- Tailwind classes uniquement (pas de fichiers CSS custom).

### Limites connues
- Pas de script lint configuré actuellement.
- Pas de runner de tests configuré actuellement.
- Le typecheck est optionnel et dépend de la disponibilité de `vue-tsc` dans l'environnement.
- La stratégie de merge local/cloud reste volontairement simple (`local gagne`, par nom de liste).

### Documentation détaillée
- [Guide structure](docs/STRUCTURE.md)
- [Vue d'ensemble Supabase DB](docs/SUPABASE_DB.md)
- [Guide styling](docs/STYLING.md)
