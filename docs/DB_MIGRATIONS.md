# DB Migrations Workflow (TEST -> PROD)

Ce document definit le workflow obligatoire pour tous les changements de base de donnees.

## Emplacement des migrations

- Les fichiers SQL de migration doivent etre crees dans `web/supabase/migrations/`.
- Convention de nommage:
  - `YYYYMMDDHHMMSS_description_courte.sql`

## Regles obligatoires

- Ne pas modifier la DB de prod (`A`) directement via SQL Editor.
- Toute modification DB doit exister dans un fichier de migration versionne.
- Toujours appliquer d'abord sur la DB test (`B`), valider, puis appliquer le meme fichier sur la DB prod (`A`).
- Commiter les migrations dans Git avec le code applicatif associe.
- Pour les migrations de donnees, privilegier des scripts idempotents (`ON CONFLICT`, `WHERE`, etc.).

## Ordre d'execution recommande

1. Creer le fichier SQL dans `web/supabase/migrations/`.
2. Appliquer sur `B`.
3. Verifier l'application (build + parcours critiques).
4. Appliquer le meme fichier sur `A`.
5. Commit/PR.

## Exemple (Docker + psql)

```bash
# TEST (B)
docker run --rm -e PGPASSWORD="$DB_B_PASSWORD" -v "$PWD/supabase/migrations:/migrations" postgres:17 \
  psql "$DB_B_URL" -v ON_ERROR_STOP=1 -f /migrations/20260408_add_example.sql

# PROD (A)
docker run --rm -e PGPASSWORD="$DB_A_PASSWORD" -v "$PWD/supabase/migrations:/migrations" postgres:17 \
  psql "$DB_A_URL" -v ON_ERROR_STOP=1 -f /migrations/20260408_add_example.sql
```

## Cas special

- Si un changement est fait "a la main" en test, il faut quand meme creer la migration SQL correspondante avant promotion vers prod.
