# SpyGrocery Web

Application web Nuxt pour comparer les prix en epicerie au Quebec, construire des listes d'achats, et utiliser un assistant IA pour generer une premiere liste en quelques secondes.

## Apercu

- Frontend: Nuxt 4 + Vue 3 + Tailwind
- State management: Pinia
- Backend web: Nitro (`server/api/*`, `services`, `repositories`)
- Data: Supabase (`products`, `product_prices`, `lists`, `ai_chat_sessions`, `onboarding`)
- SEO: routes canoniques `/produits/[store]/[product]` et `/magasins/[store]`, robots + sitemap

## Fonctionnalites principales

- Recherche de produits avec tri, pagination et filtre magasin (`/search`)
- Fiche produit canonique (`/produits/[store]/[product]`) avec alternatives inter-magasins
- Pages magasins (`/magasins/[store]`)
- Listes sauvegardees avec sync locale + cloud (`/lists`)
- Auth Supabase (magic link + Google) (`/login`, `/auth/confirm`)
- Chat IA avec mode normal et mode creation de liste (`/api/ai/chat`)
- Onboarding guide en 3 etapes (`/onboarding`)

## Stack technique

- Nuxt 4, Vue 3, Nitro
- Pinia
- Supabase (`@nuxtjs/supabase`)
- Vercel AI SDK (`ai`, `@ai-sdk/vue`)
- Tailwind CSS

## Architecture (resume)

Le projet suit un flux en couches:

`UI -> Store -> Composable -> API -> Service -> Repository -> Supabase`

Ce contrat est documente dans `docs/STRUCTURE.md`.

## Lancer en local

Prerequis:

- Node.js >= 20.19
- npm

Installation:

```bash
npm install
```

Developpement:

```bash
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

## Variables d'environnement

Creer `web/.env`:

```bash
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable-key>
NUXT_AI_GATEWAY_API_KEY=<ai-gateway-key>
NUXT_AI_GATEWAY_MODEL=<optional-model>
NUXT_PUBLIC_SITE_URL=https://spygrocery.com
```

## Scripts utiles

```bash
npm run dev
npm run build
npm run preview
npm run generate
```

## Statut du projet

Projet actif en evolution continue.

- Le depot est public pour visibilite.
- Le projet n'est pas ouvert aux contributions externes pour le moment.

## Documentation

- `docs/STRUCTURE.md` - architecture et conventions de couches
- `docs/SUPABASE_DB.md` - modele de donnees et contrats DB
- `docs/STYLING.md` - direction visuelle et regles UI
- `docs/ONBOARDING.md` - contrat fonctionnel onboarding
