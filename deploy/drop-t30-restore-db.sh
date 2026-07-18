#!/bin/sh
set -eu

if [ "$#" -ne 2 ]; then
  echo "Usage: T30_DROP_CONFIRM=YES drop-t30-restore-db.sh oriana_restore_t30_SUFFIXE t30_YYYYMMDD_IDENTIFIANT" >&2
  exit 2
fi

[ "${T30_DROP_CONFIRM:-}" = "YES" ] || {
  echo "Refus : définir T30_DROP_CONFIRM=YES pour supprimer uniquement la base temporaire contrôlée." >&2
  exit 3
}

target_db="$1"
rehearsal_id="$2"
printf '%s' "$target_db" | grep -Eq '^oriana_restore_t30_[a-z0-9_]+$' || {
  echo "Refus : nom de base temporaire invalide." >&2
  exit 4
}
printf '%s' "$rehearsal_id" | grep -Eq '^t30_[0-9]{8}_[a-z0-9]{6,32}$' || {
  echo "Refus : identifiant de répétition invalide." >&2
  exit 5
}

: "${POSTGRES_HOST:?POSTGRES_HOST manquant}"
: "${POSTGRES_USER:?POSTGRES_USER manquant}"
: "${POSTGRES_DB:?POSTGRES_DB manquant}"
: "${PGPASSWORD:?PGPASSWORD manquant}"

[ "$target_db" != "$POSTGRES_DB" ] || {
  echo "Refus absolu : la cible correspond à POSTGRES_DB." >&2
  exit 6
}

marker="$(psql --host "$POSTGRES_HOST" --username "$POSTGRES_USER" --dbname "$target_db" --tuples-only --no-align --set=ON_ERROR_STOP=1 --command "SELECT rehearsal_id FROM public.t30_rehearsal_marker WHERE rehearsal_id = '$rehearsal_id'" | tr -d '[:space:]')" || {
  echo "Refus : marqueur de répétition absent ou illisible." >&2
  exit 7
}
[ "$marker" = "$rehearsal_id" ] || {
  echo "Refus : le marqueur ne correspond pas à la répétition autorisée." >&2
  exit 8
}

dropdb --host "$POSTGRES_HOST" --username "$POSTGRES_USER" --if-exists "$target_db"
echo "Base temporaire T-30 supprimée : $target_db"
