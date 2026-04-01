# SpyGrocery (Nuxt 4) - Structure du projet

Objectif: rendre le repo lisible, stable, et eviter que la logique se retrouve partout.
Ce document definit une structure cible et des regles simples (non negociables) pour garder le controle.

Voir aussi: `docs/SUPABASE_DB.md` (etat DB + contrats API actifs).

## Regle de langue (obligatoire)

- La langue du projet est le **francais en premier lieu**.
- Par defaut, tout contenu visible utilisateur doit etre en francais (UI, messages, SEO, docs produit).
- L'anglais est reserve aux termes techniques ou aux demandes explicites.

## TL;DR (regles principales)

- Les composants Vue = UI uniquement (pas de requetes DB, pas de logique metier).
- Les pages = composition de sections + wiring minimal (pas de logique metier).
- Pinia = couche feature front (etat + actions metier front).
- Composables = data access layer / domain front (fetch API interne + APIs externes + adapters).
- `server/api` = controleurs HTTP (parse/valide, appelle services, retourne).
- `server/services` = logique metier (use-cases).
- `server/repositories` = acces donnees (Supabase/SQL), appels isoles.
- Pages privees via middleware `auth`, page login via middleware `guest`.
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
  - format attendu: chaque fichier expose un composable `useXxx()` qui retourne ses methodes.
    Exemple: `useListsStorage()` retourne `get...`, `set...`, `delete...`.

4) Backend (Nitro)
- `server/api/*`: controleurs
  - parse query/body
  - valider/coercer
  - appeler services
  - reponses coherentes
- `server/services/*`: logique metier
  - ex: "search products", "fetch stores", "orchestration chat tools"
- `server/repositories/*`: acces donnees
  - ex: `productsRepo.search(...)`, `storesRepo.list()`
  - pas de logique UI

5) Partage
- `shared/types/*`: types UI + types DB generes (utilises cote app + server).
- `shared/*`: utilitaires communs server+client (pure functions).

## Arborescence actuelle (a ce jour)

- `app/`
  - `middleware/`
    - `auth.ts` guard pages privees (`/lists`)
    - `guest.ts` garde login/guest
    - `onboarding.ts` guard onboarding-first (`/search`, `/products/[slug]`, `/lists`)
  - `pages/`
    - `index.vue` landing
    - `login.vue` auth
    - `auth/confirm.vue` callback auth
    - `onboarding.vue` onboarding AI guide
    - `search.vue` recherche
    - `products/[slug].vue` detail produit
    - `lists.vue` listes sauvegardees
  - `components/` (sections landing, search, lists, shared + `ai/AiChatbot.vue` + `BottomNavAuthAction.vue`)
  - `stores/` (Pinia)
    - `auth.ts`
    - `onboarding.ts`
    - `lists.ts` (liste courante + listes sauvegardees)
    - `productDetails.ts`
    - `search.ts`
    - `chat.ts`
  - `composables/`
    - `api/useProducts.ts`
    - `api/useStores.ts`
    - `api/useChat.ts`
    - `api/useChatSessions.ts`
    - `api/useOnboarding.ts`
    - `api/useLists.ts`
    - `useAuth.ts`
    - `useListsStorage.ts`
  - `layouts/`
    - `bottom-nav.vue` (layout pour pages avec bottom nav)

- `shared/`
  - `shared/types/`
    - `database.types.ts` (Supabase)
    - `index.ts` (domain types)
    - `lists.ts`

- `server/`
  - `server/api/lists/*.ts`
  - `server/api/onboarding/*.ts`
  - `server/api/stores/index.get.ts`
  - `server/api/products/search.get.ts`
  - `server/api/products/[slug].get.ts`
  - `server/api/ai/chat.post.ts`
  - `server/api/ai/sessions/*.ts`
  - `server/services/lists/listsService.ts`
  - `server/services/onboarding/onboardingService.ts`
  - `server/services/ai/chatService.ts`
  - `server/services/ai/chatSessionsService.ts`
  - `server/repositories/listsRepository.ts`
  - `server/repositories/onboardingRepository.ts`
  - `server/repositories/ai/productsSqlRepository.ts`
  - `server/repositories/ai/chatSessionsRepository.ts`

## Conventions de code

Frontend (Vue)
- `<script setup lang="ts">`, composants petits, pages = composition.
- Tailwind uniquement. Pas de fichiers CSS custom.
- Indentation 2 espaces, single quotes, eviter `any`.
- Import order: Vue/Nuxt -> libs -> `~/` -> relatifs; type-only imports.
- Guard browser-only: `process.client` (localStorage, window).
- Naming fonctions (regle equipe):
  - lecture/acces de donnees -> prefixe `get` (ex: `getProducts`, `getStoreTotals`)
  - ecriture/mutation -> prefixe `set` (ex: `setProducts`, `setSelectedStore`)
  - suppression -> prefixe `delete` (ex: `deleteListStorageItemByName`)

Backend (Nitro)

API routes Nitro
- Nomage: `server/api/foo/bar.get.ts` -> `GET /api/foo/bar`.
- Toujours coercer/valider les query params (`getQuery(event)` + `parseInt`, etc.).
- En cas d'erreur: `throw createError({ statusCode, message })`.
- `server/*` ne doit jamais importer `app/*`.

Supabase
- Dans `server/api`, utiliser `serverSupabaseClient(event)`.
- Toujours selectionner uniquement les champs necessaires.
- Eviter les selects non bornes.

## Donnees / DB (Supabase)

Tables principales:
- `products`
- `product_prices`

Contrat data actuel:
- La recherche UI lit le snapshot courant depuis `products`.
- Les magasins filtres UI sont derives de `products (store, store_id)` cote backend.
- Le chat V1 utilise uniquement `products` (pas `product_prices`).
- Les listes sauvegardees cloud utilisent `public.lists` avec user owner (`user_id`).
- Les sessions chat IA utilisent `public.ai_chat_sessions` (`messages_json` snapshot).
- Le dataset produits actuel est traite comme specials.

Regle UI actuelle:
- La navigation principale produit est centree sur `index`, `search`, `products/[slug]`, `lists`.
- Auth UI est geree via `login` + `auth/confirm` + action compacte sur bottom nav mobile.

## UX: listes (localStorage)

Clés localStorage:
- `spygrocery:saved-lists`: listes nommees
- `spygrocery:deleted-list-names`: tombstones pour replay des suppressions cloud

Comportement attendu:
- Sauvegarder une liste -> reset la liste courante (items = []).
- Sur /lists: click card -> charge la liste dans le drawer; delete -> supprime.
- Save/update est auth-gate via prompt login.
- Flux persistence cloud: ecriture locale puis sync cloud si session auth (strategie `local wins` par nom).

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

3) Chat feature:
- UI/component `ai/AiChatbot.vue` (UI only)
- store `app/stores/chat.ts` pour etat/derivations/actions feature chat
- composable `app/composables/api/useChat.ts` pour transport AI SDK vers `/api/ai/chat`
- composable `app/composables/api/useChatSessions.ts` pour CRUD sessions
- routes `POST /api/ai/chat` + `/api/ai/sessions*` fines (validation + delegation)
- service `server/services/ai/chatService.ts` pour orchestration model + tools
- service `server/services/ai/chatSessionsService.ts` pour orchestration sessions
- repository dedie `server/repositories/ai/productsSqlRepository.ts` (SQL lecture seule)
- repository `server/repositories/ai/chatSessionsRepository.ts` pour persistance sessions
- en mode liste (`createListMode`): data part `data-grocery-list` avec `items: ListProduct[]`

## Flux Chat IA (actuel)

Flux impose:
- `app/components/ai/AiChatbot.vue` -> `app/stores/chat.ts` -> `app/composables/api/useChatSessions.ts` -> `GET/POST/GET[id]/DELETE[id] /api/ai/sessions*` -> `server/services/ai/chatSessionsService.ts` -> `server/repositories/ai/chatSessionsRepository.ts` -> Supabase `ai_chat_sessions`
- `app/components/ai/AiChatbot.vue` -> `app/stores/chat.ts` -> `app/composables/api/useChat.ts` -> `POST /api/ai/chat` (`chatId` requis) -> `server/services/ai/chatService.ts` -> `server/repositories/ai/productsSqlRepository.ts` -> Supabase
- en mode liste: le meme flux ajoute un tool `submit_list_items`, puis `server/api/ai/chat.post.ts` emet `data-grocery-list`
- fin de stream: snapshot complet `UIMessage[]` persiste dans `ai_chat_sessions.messages_json`

Regles:
- pas d'appel Supabase depuis UI/store/composable chat
- pas de logique metier dans `server/api/ai/chat.post.ts`
- les tools du modele restent controles par des schemas et des repositories

3) Docs:
- maintenir ce contrat a jour avant gros changements

## Rituels pour utiliser un agent (Codex/LLM) sans perdre le controle

Avant:
- Plan (5-10 lignes) + liste fichiers touches.
- Pas de rename/move sans demande explicite.

Apres:
- `git diff` (scope OK?)
- `npm run build` (minimum) et/ou `npx nuxi typecheck`
