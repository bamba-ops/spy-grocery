
# SpyGrocery (Nuxt 4) - Structure du projet

Objectif: rendre le repo lisible, stable, et eviter que la logique se retrouve partout.
Ce document definit une structure cible et des regles simples (non negociables) pour garder le controle.

Voir aussi: `docs/PROJECT_MAP.md` (cartographie actuelle des flux Search / Lists / Stores).

## TL;DR (regles principales)

- Les composants Vue = UI uniquement (pas de requetes DB, pas de logique metier).
- Les pages = composition de sections + wiring minimal (pas de logique metier).
- Pinia = etat global + actions, resilientes aux erreurs.
- Composables = logique reutilisable (fetch wrappers, helpers UI).
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
- Front orchestration (`app/composables`)
- State global (`app/stores`)
- API interne (`server/api`)
- Metier (`server/services`)
- Data access (`server/repositories`)
- DB / APIs externes (Supabase, Stripe, etc.)

Regle anti-bazar:
- Une couche ne saute pas les couches inferieures.
- Ex: component -> store/composable -> api -> service -> repository -> supabase.

### Ce qui est interdit par couche

UI (`app/pages`, `app/components`):
- interdit: requetes Supabase directes, logique metier lourde, manip localStorage brute.

Composables (`app/composables`):
- interdit: devenir un "god composable" qui melange data globale + navigation + CRUD + watchers implicites.
- taille guide: si > 150-200 lignes, split en composables plus petits.

Stores (`app/stores`):
- interdit: logique purement visuelle de composant (layout, style concerns).
- autorise: etat partage, actions metier cote front, erreurs/loading globaux.

API (`server/api`):
- interdit: 200+ lignes de logique metier + requetes SQL melangees.
- autorise: parsing/coercion/validation + appel service + mapping HTTP.

Services (`server/services`):
- interdit: details HTTP/UI.
- autorise: use-cases, orchestration metier, regles de domaine.

Repositories (`server/repositories`):
- interdit: logique metier produit.
- autorise: acces DB/SDK, requetes et mapping data source.

### Separation critique: etat de donnee vs etat d'UI

Etat de donnee (global/shareable) -> store Pinia:
- ex: listes sauvegardees, panier courant, filtres globaux.

Etat d'UI (local page/composant) -> composable/page local:
- ex: search input local, tab active locale, open/close local non partage.

Regle pratique:
- si 2+ pages/composants en ont besoin, mettre en store.
- sinon, garder local (composable/page).

### Regle anti-magie (watchers)

- Eviter les watchers en cascade qui declenchent des fetchs implicites.
- Preferer des actions explicites (`search()`) + debounce local controle.
- Si watchers necessaires, les centraliser dans un seul composable de feature et documenter le flux.

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

2) State
- `app/stores/*` (Pinia):
  - etat serializable
  - actions async avec `loading/error`
  - pas de DOM/Window sans `process.client`
  - data globale partagee, pas d'effets UI diffus

3) Logique reutilisable (front)
- `app/composables/*`: wrappers $fetch, helpers UI, adapters simples.
  Exemple: `useProducts().search(params)`.
  - orchestration de feature cote front (sans devenir un store bis)

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
    - `feature/useSearch.ts`
    - `feature/useLists.ts`
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
- store dedie pour data globale listes (si besoin)
- composable page pour query/sort/handlers UI

2) Search feature:
- composants UI-only
- orchestration explicite dans composable (search + debounce), limiter watchers implicites

3) Docs:
- maintenir ce contrat a jour avant gros changements

## Rituels pour utiliser un agent (Codex/LLM) sans perdre le controle

Avant:
- Plan (5-10 lignes) + liste fichiers touches.
- Pas de rename/move sans demande explicite.

Apres:
- `git diff` (scope OK?)
- `npm run build` (minimum) et/ou `npx nuxi typecheck`
