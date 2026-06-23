#!/usr/bin/env bash

set -euo pipefail

# shellcheck disable=SC1091
source /usr/local/lib/postgres-backup/config.sh

backup_config_load

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
database_dump="/tmp/postgres-backup-${timestamp}-$$.dump"
remote_path="${B2_BACKUP_PREFIX}/postgres-${timestamp}.dump"

cleanup() {
  rm -f "$database_dump"
}

trap cleanup EXIT

echo "Creating backup for ${DATABASE_URL%%\?*}" >&2

if ! b2 account authorize "$B2_APPLICATION_KEY_ID" "$B2_APPLICATION_KEY" >/dev/null; then
  echo "Backblaze B2 authorization failed before pg_dump ran" >&2
  echo "Check B2_BACKUP_APPLICATION_KEY_ID, B2_BACKUP_APPLICATION_KEY, and bucket access" >&2
  exit 1
fi

pg_dump \
  --dbname "$DATABASE_URL" \
  --format=custom \
  --file "$database_dump"

b2 file upload \
  "$B2_BACKUP_BUCKET" \
  "$database_dump" \
  "$remote_path"

echo "Uploaded backup to b2://${B2_BACKUP_BUCKET}/${remote_path}" >&2
