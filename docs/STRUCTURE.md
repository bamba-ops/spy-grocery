
# SpyGrocery (Nuxt 4) - Structure du projet

Objectif: rendre le repo lisible, stable, et eviter que la logique se retrouve partout.
Ce document definit une structure cible et des regles simples (non negociables) pour garder le controle.

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

3) Logique reutilisable (front)
- `app/composables/*`: wrappers $fetch, helpers UI, adapters simples.
  Exemple: `useProducts().search(params)`.

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
- `app/types/*`: types UI + types DB generes.
- (optionnel futur) `shared/*`: utilitaires communs server+client (pure functions).

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
    - `search.ts`
    - `stores.ts`
    - `shoppingList.ts`
  - `app/composables/`
    - `useProducts.ts`
    - `useStores.ts`
  - `app/types/`
    - `database.types.ts` (Supabase)
    - `index.ts` (domain types)

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

## Rituels pour utiliser un agent (Codex/LLM) sans perdre le controle

Avant:
- Plan (5-10 lignes) + liste fichiers touches.
- Pas de rename/move sans demande explicite.

Apres:
- `git diff` (scope OK?)
- `npm run build` (minimum) et/ou `npx nuxi typecheck`
