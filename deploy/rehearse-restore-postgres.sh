#!/bin/sh
set -eu

usage() {
  echo "Usage: T30_REHEARSAL_CONFIRM=YES rehearse-restore-postgres.sh /backups/oriana-TIMESTAMP.dump oriana_restore_t30_SUFFIXE" >&2
  exit 2
}

[ "$#" -eq 2 ] || usage
[ "${T30_REHEARSAL_CONFIRM:-}" = "YES" ] || {
  echo "Refus : définir T30_REHEARSAL_CONFIRM=YES après vérification de l'environnement de répétition." >&2
  exit 3
}

dump_path="$1"
target_db="$2"

case "$dump_path" in
  /backups/oriana-*.dump) ;;
  *) echo "Refus : l'archive doit être un fichier /backups/oriana-*.dump." >&2; exit 4 ;;
esac

printf '%s' "$target_db" | grep -Eq '^oriana_restore_t30_[a-z0-9_]+$' || {
  echo "Refus : la base temporaire doit respecter oriana_restore_t30_[a-z0-9_]+." >&2
  exit 5
}

[ -f "$dump_path" ] || { echo "Refus : archive absente." >&2; exit 6; }
: "${POSTGRES_HOST:?POSTGRES_HOST manquant}"
: "${POSTGRES_USER:?POSTGRES_USER manquant}"
: "${POSTGRES_DB:?POSTGRES_DB manquant}"
: "${PGPASSWORD:?PGPASSWORD manquant}"

[ "$target_db" != "$POSTGRES_DB" ] || {
  echo "Refus absolu : la cible temporaire correspond à POSTGRES_DB." >&2
  exit 7
}

case "$target_db" in
  postgres|template0|template1) echo "Refus absolu : base système interdite." >&2; exit 8 ;;
esac

pg_restore --list "$dump_path" >/dev/null
sha256sum "$dump_path"

exists="$(psql --host "$POSTGRES_HOST" --username "$POSTGRES_USER" --dbname postgres --tuples-only --no-align --command "SELECT 1 FROM pg_database WHERE datname = '$target_db'" | tr -d '[:space:]')"
[ -z "$exists" ] || {
  echo "Refus : la base temporaire existe déjà. Aucun écrasement n'est autorisé." >&2
  exit 9
}

started_at="$(date +%s)"
createdb --host "$POSTGRES_HOST" --username "$POSTGRES_USER" "$target_db"
pg_restore --host "$POSTGRES_HOST" --username "$POSTGRES_USER" --dbname "$target_db" --no-owner --exit-on-error "$dump_path"

migrations="$(psql --host "$POSTGRES_HOST" --username "$POSTGRES_USER" --dbname "$target_db" --tuples-only --no-align --command 'SELECT count(*) FROM schema_migrations')"
tables="$(psql --host "$POSTGRES_HOST" --username "$POSTGRES_USER" --dbname "$target_db" --tuples-only --no-align --command "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'")"
finished_at="$(date +%s)"

echo "Restauration T-30 terminée dans une base temporaire."
echo "Base temporaire : $target_db"
echo "Migrations : $migrations"
echo "Tables publiques : $tables"
echo "Durée secondes : $((finished_at - started_at))"
echo "La base n'est pas supprimée automatiquement. Utiliser drop-t30-restore-db.sh après validation."
