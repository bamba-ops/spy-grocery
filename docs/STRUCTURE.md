# SpyGrocery (Nuxt 4) - Structure du projet

Objectif: rendre le repo lisible, stable, et eviter que la logique se retrouve partout.
Ce document definit une structure cible et des regles simples (non negociables) pour garder le controle.

Voir aussi: `docs/PROJECT_MAP.md` (cartographie actuelle des flux Search / Lists / Stores).

## TL;DR (regles principales)

- Les composants Vue = UI uniquement (pas de requetes DB, pas de logique metier).
- Les pages = composition de sections + wiring minimal (pas de logique metier).
- Pinia = couche feature front (etat + actions metier front).
- Composables = data access layer / domain front (fetch API interne + APIs externes + adapters).
- `server/api` = controleurs HTTP (parse/valide, appelle services, retourne).
- `server/services` = logique metier (use-cases).
- `server/repositories` = acces donnees (Supabase/SQL), appels isoles.
- Ne pas renommer/deplacer des fichiers sans une raison claire + un commit dedie.
- Tailwind classes only: pas de fichiers CSS custom.

## One-page Architecture Contract

Nom court de l'architecture:
- Layered Architecture + Service Layer + Repository Pattern
- Organisation progressive par feature (search, lists, stores)

Flux cible:
- UI (`app/pages`, `app/components`)
- Feature state + actions (`app/stores`)
- Domain/Data access front (`app/composables`)
- API interne (`server/api`)
- Metier (`server/services`)
- Data access (`server/repositories`)
- DB / APIs externes (Supabase, Stripe, etc.)

Regle anti-bazar:
- Une couche ne saute pas les couches inferieures.
- Ex: component/page -> store(feature) -> composable(domain/api) -> server/api -> service -> repository -> supabase.

### Ce qui est interdit par couche

UI (`app/pages`, `app/components`):
- interdit: requetes Supabase directes, logique metier lourde, manip localStorage brute.

Composables (`app/composables`):
- interdit: devenir un "god composable" qui gere l'etat global feature, la navigation, et le rendu UI.
- autorise: acces donnees, wrappers de fetch, mapping DTO -> types domaine, adaptation des erreurs/reponses.
- taille guide: si > 150-200 lignes, split en composables plus petits.

Stores (`app/stores`):
- interdit: logique purement visuelle de composant (layout, style concerns).
- autorise: etat feature partage + actions metier front (source de verite pour la feature).

API (`server/api`):
- interdit: 200+ lignes de logique metier + requetes SQL melangees.
- autorise: parsing/coercion/validation + appel service + mapping HTTP.

Services (`server/services`):
- interdit: details HTTP/UI.
- autorise: use-cases, orchestration metier, regles de domaine.

Repositories (`server/repositories`):
- interdit: logique metier produit.
- autorise: acces DB/SDK, requetes et mapping data source.

### Separation critique: feature state vs data access

Etat feature (global/shareable) -> store Pinia:
- ex: liste active, listes sauvegardees, drawer open/close, filtres globaux.

Acces donnees/domaine (API/DB/externe) -> composables:
- ex: `useProducts()` pour `/api/products/search`, `useStores()` pour `/api/stores`, futurs domains externes.

Etat d'UI local (non partage) -> page/composant:
- ex: input local, tab active locale, etat visuel transitoire.

Regle pratique:
- si c'est du state feature partage (2+ composants/pages), mettre en store.
- si c'est de l'acces donnees, mettre en composable domain.
- si c'est purement visuel et local, garder dans le composant/page.

### Regle anti-magie (watchers)

- Eviter les watchers en cascade qui declenchent des fetchs implicites.
- Preferer des actions explicites (`search()`) + debounce local controle.
- Si watchers necessaires pour orchestration locale, les centraliser dans un seul endroit (page/composant) et documenter le flux.

## Contexte produit

- App: SpyGrocery (comparateur de prix epicerie).
- Stack: Nuxt 4 + Vue 3 + Nitro (routes server) + Supabase.
- Direction UI: noir/blanc editorial; Manrope (body/UI) + Fraunces (headlines).

## Commandes (repo)

- Install: `npm install`
- Dev: `npm run dev`
- Dev (LAN / telephone): `npm run dev -- --host 0.0.0.0 --port 3000`
- Build: `npm run build`
- Preview: `npm run preview`
- Generate: `npm run generate`

Qualite:
- Lint: non configure.
- Tests: non configure.
- Typecheck (optionnel Nuxt): `npx nuxi typecheck`

## Regles d'architecture (couches)

Pense en couches: UI -> State -> Use-cases -> Data.

1) UI (Vue)
- `app/pages/*`: routing + layout + composition.
- `app/components/*`: composants (presentational et petits composants d'interaction).

2) Feature state
- `app/stores/*` (Pinia):
  - etat serializable
  - actions async avec `loading/error`
  - pas de DOM/Window sans `process.client`
  - source de verite de chaque feature front

3) Data access / Domain (front)
- `app/composables/*`: wrappers `$fetch`, appels API internes, appels APIs externes, mapping de reponse.
  Exemples: `useProducts().search(params)`, `useStores().list()`.
  - pas de state feature global ici (ce state reste dans les stores).

4) Backend (Nitro)
- `server/api/*`: controleurs
  - parse query/body
  - valider/coercer
  - appeler services
  - reponses coherentes
- `server/services/*`: logique metier
  - ex: "search products", "fetch stores", "build promo set"
- `server/repositories/*`: acces donnees
  - ex: `productsRepo.search(...)`, `storesRepo.list()`
  - pas de logique UI

5) Partage
- `shared/types/*`: types UI + types DB generes (utilises cote app + server).
- `shared/*`: utilitaires communs server+client (pure functions).

## Arborescence actuelle (a ce jour)

- `app/`
  - `app/pages/`
    - `index.vue` landing
    - `search.vue` recherche
    - `lists.vue` listes sauvegardees
    - `login.vue` placeholder
    - `stores/[storeSlug]/products/[slug].vue` mock detail
- `app/components/` (sections landing, search, lists, shared)
  - `app/stores/` (Pinia)
    - `lists.ts` (liste courante + listes sauvegardees)
    - `search.ts`
    - `stores.ts`
  - `app/composables/`
    - `api/useProducts.ts`
    - `api/useStores.ts`
    - `local/useListsStorage.ts`

- `shared/`
  - `shared/types/`
    - `database.types.ts` (Supabase)
    - `index.ts` (domain types)
    - `lists.ts`

- `server/`
  - `server/api/stores/index.get.ts`
  - `server/api/products/search.get.ts`

- `app/layouts/`
  - `bottom-nav.vue` (layout pour pages avec bottom nav)

## Conventions de code

Frontend (Vue)
- `<script setup lang="ts">`, composants petits, pages = composition.
- Tailwind uniquement. Pas de fichiers CSS custom.
- Indentation 2 espaces, single quotes, eviter `any`.
- Import order: Vue/Nuxt -> libs -> `~/` -> relatifs; type-only imports.
- Guard browser-only: `process.client` (localStorage, window).

Backend (Nitro)

API routes Nitro
- Nomage: `server/api/foo/bar.get.ts` -> `GET /api/foo/bar`.
- Toujours coercer/valider les query params (`getQuery(event)` + `parseInt`, etc.).
- En cas d'erreur: `throw createError({ statusCode, message })`.

Supabase
- Dans `server/api`, utiliser `serverSupabaseClient(event)`.
- Toujours selectionner uniquement les champs necessaires.
- Eviter les selects non bornes.

## Donnees / DB (Supabase)

Tables principales:
- `products`
- `prices`
- `stores`
Vue:
- `public.latest_price` (dernier prix par produit/store)

Regle navigation:
- Produit scope par store: `/stores/[storeSlug]/products/[slug]`.

## UX: listes (localStorage)

Clés localStorage:
- `spygrocery:saved-lists`: listes nommees
- (legacy) `spygrocery:shopping-list`: ancienne sauvegarde single-list (importe automatiquement)

Comportement attendu:
- Sauvegarder une liste -> reset la liste courante (items = []).
- Sur /lists: click card -> charge la liste dans le drawer; delete -> supprime.

## Workflow refactor (petits pas)

But: ranger sans casser.

1) Cartographier: UI -> store -> composable -> API -> Supabase.
2) Refactor par feature (pas tout d'un coup): extraire service, puis repository.
3) Un commit = une intention (petits diffs, pas de refactor global).

Plan court recommande:
1) Lists feature:
- store `lists.ts` = source de verite front
- composables domain = acces persistence/API (pas d'etat feature global)

2) Search feature:
- composants UI-only
- store `search.ts` pour state feature + composable domain pour fetch products

3) Docs:
- maintenir ce contrat a jour avant gros changements

## Rituels pour utiliser un agent (Codex/LLM) sans perdre le controle

Avant:
- Plan (5-10 lignes) + liste fichiers touches.
- Pas de rename/move sans demande explicite.

Apres:
- `git diff` (scope OK?)
- `npm run build` (minimum) et/ou `npx nuxi typecheck`
