# Alertes Email Specials - Plan d'implementation

Ce document capture le plan propose pour convertir les recherches sans resultat en inscriptions, en ajoutant une alerte email "Notifie-moi quand c'est en special".

## Objectif produit

- Convertir les utilisateurs qui ne trouvent pas un produit (car le catalogue contient les produits en special, pas tout l'inventaire).
- Transformer un moment de frustration (empty state) en action a haute intention.
- Construire un MVP qui respecte l'architecture existante:
  - UI -> Store -> Composable -> API -> Service -> Repository -> Supabase

## 1) Capture d'intention cote UI

Point d'entree recommande:

- `app/components/SearchResults.vue` (empty state de recherche, deja present).

Comportement:

1. Afficher un CTA principal: `Notifie-moi quand c'est en special`.
2. Si utilisateur non connecte:
   - ouvrir le prompt auth via `authStore.setOpenAuthPrompt(...)`.
   - CTA prompt recommande: `Connexion pour activer l'alerte`.
   - utiliser un `nextPath` contextualise:
     - `/search?intent=notify-special&q=<query>&store=<storeId>`
3. Apres login (retour via `auth/confirm`), si `intent=notify-special` est present:
   - creer automatiquement l'alerte,
   - afficher confirmation utilisateur (toast/message).

## 2) Modele de donnees (Supabase)

Table proposee: `public.price_alerts`

Champs recommandes:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `email text not null` (snapshot email pour envoi v1)
- `query text not null`
- `normalized_query text not null`
- `store_id text null` (null = tous magasins)
- `status text not null default 'active'` (`active | paused | unsubscribed`)
- `last_seen_match_count integer not null default 0`
- `last_notified_at timestamptz null`
- `unsubscribe_token uuid not null default gen_random_uuid()`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Contrainte anti-doublon recommandee:

- Unicite d'alerte active par utilisateur et cible de recherche:
  - `(user_id, normalized_query, coalesce(store_id, 'all'))`

RLS:

- Meme strategie que `lists`:
  - owner-only (`auth.uid() = user_id`) pour `select/insert/update/delete`.

## 3) API interne (MVP)

Endpoints recommandes:

- `POST /api/alerts`
  - cree une alerte (idempotente si deja existante)
- `GET /api/alerts`
  - retourne les alertes de l'utilisateur connecte
- `PATCH /api/alerts/[id]` (optionnel MVP)
  - `status` (`paused`, `active`)
- `DELETE /api/alerts/[id]`
  - suppression hard ou soft selon choix produit

Implementation:

- Meme pattern que `lists`:
  - controleur Nitro fin,
  - service pour regles metier,
  - repository pour acces DB.

## 4) Envoi email (job planifie)

MVP recommande:

- Endpoint interne securise: `POST /api/internal/alerts/run`
  - protection par secret header (`x-internal-job-key`)
- Scheduler toutes les 2h a 4h (selon cout/volume)

Algorithme d'envoi (anti-spam):

1. Lire alertes `active`.
2. Pour chaque alerte, chercher des correspondances dans `products` (dataset specials).
3. Envoyer email uniquement si transition `0 -> >0` par rapport a `last_seen_match_count`.
4. Mettre a jour:
   - `last_seen_match_count`
   - `last_notified_at`
5. Inclure lien unsubscribe avec `unsubscribe_token`.

Provider email:

- Resend (simple pour MVP), ou Postmark.

Sujet d'email exemple:

- `Bonne nouvelle: "<requete>" est en special`

## 5) Mesure PostHog sans events custom

Contrainte:

- Ne pas implementer d'events personnalises pour l'instant.
- Utiliser uniquement `$autocapture`, `$pageview`, `$identify`.

### KPI minimaux

1. CTR CTA alerte (sur search no-result)
2. Taux d'acceptation du prompt login
3. Taux d'arrivee page login
4. Taux de retour search apres login
5. Taux de creation d'alerte (si reflet visible via UI/action autocapturee)

### Filtres recommandes (events par defaut)

Toujours ajouter:

- `$host = 'www.spygrocery.com'` (pour exclure le bruit local)

Etapes de funnel proposees:

1. `$autocapture`
   - `$pathname = '/search'`
   - `$event_type = 'click'`
   - `$el_text = 'Notifie-moi quand c\'est en special'`
2. `$autocapture`
   - `$el_text = 'Connexion pour activer l\'alerte'`
3. `$pageview`
   - `$pathname = '/login'`
   - `$current_url` contient `next=%2Fsearch%3Fintent%3Dnotify-special`
4. `$pageview`
   - `$pathname = '/search'`
   - `$current_url` contient `intent=notify-special`

Notes pratiques:

- Utiliser des libelles CTA uniques pour eviter les collisions `$el_text`.
- Sans event custom, l'impression exacte du no-result est moins precise, mais le parcours clic -> auth -> retour est mesurable proprement.

## 6) Taches implementation (ordre recommande)

1. Ajouter copy explicite "specials only" + CTA alerte dans `SearchResults.vue`.
2. Brancher auth prompt avec `nextPath` contextualise (`intent=notify-special`).
3. Ajouter table `price_alerts` + RLS via migration SQL versionnee.
4. Ajouter API alerts (create/list/delete).
5. Creer job interne d'envoi email + endpoint unsubscribe.
6. Creer 2-3 insights PostHog bases sur events par defaut.

## 7) Decision d'infra (a trancher)

Deux options valides:

- Option A (recommandee MVP): cron interne Nuxt + endpoint securise
  - plus rapide a shipper
- Option B: Supabase Edge Function planifiee
  - plus "data/infra native"

Pour un premier lancement rapide, Option A est generalement la plus efficace.
