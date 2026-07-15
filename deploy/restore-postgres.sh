#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: restore-postgres.sh /backups/oriana-TIMESTAMP.dump" >&2
  exit 2
fi
pg_restore --list "$1" >/dev/null
pg_restore --host "$POSTGRES_HOST" --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --clean --if-exists --no-owner "$1"
echo "Restauration PostgreSQL terminée et archive vérifiée."
