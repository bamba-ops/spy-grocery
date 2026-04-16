# SpyGrocery Onboarding Contract

## Goal

L'onboarding v2 est **product-first**.

Le parcours doit mener l'utilisateur vers une action concrete le plus vite possible:

1. trouver un premier produit reel,
2. continuer dans le magasin de ce produit,
3. finaliser sa liste.

C'est le nouveau moment AHA du parcours.

## Core Flow (3 Steps)

### Step 1 - Product selection (`/onboarding`)

- L'utilisateur cherche un produit depuis `ProductSearchDropdown`.
- La selection produit demarre la progression onboarding (`status = in_progress`, `current_step = 1`).
- Le titre du produit selectionne est persiste comme `first_intent`.

### Step 2 - Store continuation (`/produits/[store]/[product]?onboarding=1` puis `/magasins/[store]?onboarding=1`)

- La selection produit fait avancer la progression vers l'etape magasin (`current_step = 2`).
- Le slug magasin est persiste dans `selected_store_slug` pour reprise fiable du parcours.
- L'utilisateur peut ajouter des produits a sa liste dans ce contexte.

### Step 3 - List finalization (`/lists?source=onboarding`)

- Le resume final est affiche sur la page listes.
- L'action principale est `Enregistrer ma liste`.
- L'etat onboarding est ensuite marque `completed`.

## Skip / Resume

- `Passer pour l'instant` positionne `status = skipped` puis redirige vers `/search`.
- Un utilisateur `skipped` n'est pas hard-bloque et peut reprendre le parcours.
- La reprise remet l'etat en `in_progress` a l'etape 1 et renvoie sur `/onboarding`.

## Blocking Rule

- Le middleware onboarding bloque uniquement l'etape 1.
- Les etapes 2 et 3 se passent sur des pages produit/magasin/listes standards.

## Completion Rule

- Le parcours est considere termine quand l'utilisateur declenche l'action finale de l'etape 3 (`Enregistrer ma liste`).

## Data Contract

Storage table: `public.onboarding`.

Main fields:

- `status`: `not_started | in_progress | completed | skipped`
- `current_step`: `1..3`
- `first_intent`: nullable text
- `selected_store_slug`: nullable text
- `first_chat_session_id`: nullable uuid to `ai_chat_sessions.id` (compat)
- `has_preview`: boolean (compat)
- `has_added_list`: boolean (compat)
- `completed_at`, `skipped_at`, timestamps

## API Contract

- `GET /api/onboarding` -> `{ onboarding }`
- `PATCH /api/onboarding` -> `{ onboarding }`

Auth is required. Row ownership is enforced by RLS (`auth.uid() = user_id`).
