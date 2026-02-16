# Auth Integration Plan (Nuxt 4 + Supabase)

## Objectif
Ajouter une auth propre et previsible avec `@nuxtjs/supabase`, sans casser le flow actuel.
Aucune implementation immediate: ce document est un plan d'execution.

## Contexte actuel
- Module Supabase deja actif dans `nuxt.config.ts`
- Config actuelle:
  - `supabase.url = process.env.SUPABASE_URL`
  - `supabase.key = process.env.SUPABASE_PUBLISHABLE_KEY`
  - `supabase.redirect = false`
- Le projet utilise deja des API Nitro (`server/api/*`) et un layout global.

## Principes
1. Garder `redirect: false` pour controler l'auth nous-memes.
2. Cote client: `useSupabaseClient()` + `useSupabaseUser()`.
3. Cote server: `serverSupabaseUser(event)` pour proteger, `serverSupabaseClient(event)` pour query.
4. Middleware custom Nuxt pour les pages protegees.
5. SSR API calls: transmettre les cookies (`useRequestHeaders(['cookie'])`) si necessaire.

---

## Architecture cible

### Client
- `app/pages/login.vue`
- `app/pages/confirm.vue`
- `app/middleware/auth.ts`
- Optionnel: `app/middleware/guest.ts` (bloquer `/login` si deja connecte)

### Server
- `server/api/*`:
  - check user (`serverSupabaseUser(event)`)
  - 401 si non connecte
  - DB via `serverSupabaseClient(event)`

---

## Etapes d'integration

### Etape 1 - Page login
Creer/mettre a jour `app/pages/login.vue`:
- Form email/password (ou OAuth)
- `const supabase = useSupabaseClient()`
- Login password: `supabase.auth.signInWithPassword(...)`
- OAuth/email link: `redirectTo: <origin>/confirm`
- Gestion erreur/loading simple

### Etape 2 - Page confirm (PKCE callback)
Creer `app/pages/confirm.vue`:
- `const user = useSupabaseUser()`
- watcher sur `user`
- quand connecte: `navigateTo('/search')` (ou route saved)

### Etape 3 - Middleware auth
Creer `app/middleware/auth.ts`:
- si `!useSupabaseUser().value` -> `navigateTo('/login')`
- Appliquer sur pages privees via `definePageMeta({ middleware: 'auth' })`
- Exemples: `/search`, `/lists` (selon besoin produit)

### Etape 4 - Protection API server
Pour les routes sensibles:
- `const user = await serverSupabaseUser(event)`
- si pas user -> `throw createError({ statusCode: 401, message: 'Unauthorized' })`
- puis logique metier via service/repository avec `serverSupabaseClient(event)`

### Etape 5 - SSR cookies forwarding (si useFetch SSR)
Quand une page SSR appelle une API protegee:
- `useFetch('/api/xxx', { headers: useRequestHeaders(['cookie']) })`
- garantit que la session user passe cote serveur

### Etape 6 - Redirect path post-login (optionnel recommande)
- Utiliser `useSupabaseCookieRedirect()` sur `/confirm`
- Si chemin sauvegarde: rediriger vers ce chemin, sinon fallback `/search`

---

## Regles de securite
- Ne jamais exposer de `service_role` cote client.
- Utiliser la publishable key cote app.
- Garder RLS active en DB.
- Reserver `serverSupabaseServiceRole` aux cas admin backend explicitement controles.

---

## Criteres d'acceptation
1. User non connecte sur page protegee -> redirection `/login`.
2. Login reussi -> callback `/confirm` -> redirection app.
3. API protegee retourne 401 sans session.
4. API protegee fonctionne avec session.
5. Deconnexion renvoie vers pages publiques/guest correctement.

---

## Plan de test manuel
1. Ouvrir `/search` en incognito -> redirige login.
2. Se connecter -> arrive sur `/search` (ou path saved).
3. Appeler endpoint protege sans cookie -> 401.
4. Meme endpoint avec session -> 200 + data.
5. Logout -> acces prive bloque a nouveau.

---

## Decisions en attente
1. Quelles pages exactes sont protegees au lancement? (`/search`, `/lists`, autres?)
2. Login principal: password, magic link, OAuth (Google/GitHub)?
3. Fallback post-login: `/search` ou `/`?
4. Veut-on le redirect-to-last-path des la V1?
