#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: T30_DROP_CONFIRM=YES drop-t30-restore-db.sh oriana_restore_t30_SUFFIXE" >&2
  exit 2
fi

[ "${T30_DROP_CONFIRM:-}" = "YES" ] || {
  echo "Refus : définir T30_DROP_CONFIRM=YES pour supprimer uniquement la base temporaire contrôlée." >&2
  exit 3
}

target_db="$1"
printf '%s' "$target_db" | grep -Eq '^oriana_restore_t30_[a-z0-9_]+$' || {
  echo "Refus : nom de base temporaire invalide." >&2
  exit 4
}

: "${POSTGRES_HOST:?POSTGRES_HOST manquant}"
: "${POSTGRES_USER:?POSTGRES_USER manquant}"
: "${POSTGRES_DB:?POSTGRES_DB manquant}"
: "${PGPASSWORD:?PGPASSWORD manquant}"

[ "$target_db" != "$POSTGRES_DB" ] || {
  echo "Refus absolu : la cible correspond à POSTGRES_DB." >&2
  exit 5
}

dropdb --host "$POSTGRES_HOST" --username "$POSTGRES_USER" --if-exists "$target_db"
echo "Base temporaire T-30 supprimée : $target_db"
