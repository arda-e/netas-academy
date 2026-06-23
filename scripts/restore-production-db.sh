#!/bin/sh
set -eu

: "${PGHOST:?Missing PGHOST}"
: "${PGUSER:?Missing PGUSER}"
: "${PGPASSWORD:?Missing PGPASSWORD}"

PGPORT="${PGPORT:-5432}"
ADMIN_DB="${ADMIN_DB:-postgres}"
TARGET_DB="${TARGET_DB:-${RESTORE_DB:-netas_academy}}"
DUMP_PATH="${DUMP_PATH:-/dumps/production.dump}"

export PGHOST PGPORT PGUSER PGPASSWORD

if [ ! -f "$DUMP_PATH" ]; then
  echo "Dump file not found: $DUMP_PATH" >&2
  exit 1
fi

echo "Dropping target database if it exists: $TARGET_DB"
dropdb \
  --host "$PGHOST" \
  --port "$PGPORT" \
  --username "$PGUSER" \
  --maintenance-db "$ADMIN_DB" \
  --if-exists \
  "$TARGET_DB"

echo "Creating target database: $TARGET_DB"
createdb \
  --host "$PGHOST" \
  --port "$PGPORT" \
  --username "$PGUSER" \
  --maintenance-db "$ADMIN_DB" \
  "$TARGET_DB"

echo "Restoring dump from $DUMP_PATH into $TARGET_DB"

pg_restore \
  --host "$PGHOST" \
  --port "$PGPORT" \
  --username "$PGUSER" \
  --no-owner \
  --no-acl \
  --dbname "$TARGET_DB" \
  "$DUMP_PATH"

echo "Database restored into $TARGET_DB"
