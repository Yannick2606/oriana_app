#!/bin/sh
set -eu

umask 077
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
destination="/backups/oriana-${timestamp}.dump"
pg_dump --host "$POSTGRES_HOST" --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --format custom --file "$destination"
pg_restore --list "$destination" >/dev/null
find /backups -type f -name 'oriana-*.dump' -mtime "+${POSTGRES_BACKUP_RETENTION_DAYS:-14}" -delete
echo "Sauvegarde PostgreSQL vérifiée : ${timestamp}"
