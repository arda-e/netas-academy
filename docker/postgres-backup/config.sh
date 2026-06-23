#!/usr/bin/env bash

set -euo pipefail

backup_config_load() {
  if [[ -f /etc/postgres-backup.env ]]; then
    # shellcheck disable=SC1091
    source /etc/postgres-backup.env
  fi

  : "${DATABASE_URL:?DATABASE_URL is required}"
  : "${B2_BACKUP_BUCKET:?B2_BACKUP_BUCKET is required}"
  : "${B2_APPLICATION_KEY_ID:?B2_APPLICATION_KEY_ID is required}"
  : "${B2_APPLICATION_KEY:?B2_APPLICATION_KEY is required}"

  BACKUP_CRON_SCHEDULE="${BACKUP_CRON_SCHEDULE:-0 2 * * *}"
  BACKUP_RUN_ON_START="${BACKUP_RUN_ON_START:-true}"
  B2_BACKUP_PREFIX="${B2_BACKUP_PREFIX:-postgres}"
}

backup_config_write_env_file() {
  local env_file="${1:?env file path is required}"

  {
    printf 'export %s=%q\n' DATABASE_URL "$DATABASE_URL"
    printf 'export %s=%q\n' B2_BACKUP_BUCKET "$B2_BACKUP_BUCKET"
    printf 'export %s=%q\n' B2_APPLICATION_KEY_ID "$B2_APPLICATION_KEY_ID"
    printf 'export %s=%q\n' B2_APPLICATION_KEY "$B2_APPLICATION_KEY"
    printf 'export %s=%q\n' B2_BACKUP_PREFIX "$B2_BACKUP_PREFIX"
  } >"$env_file"
}

backup_config_write_cron_file() {
  local cron_file="${1:?cron file path is required}"

  {
    printf 'SHELL=/bin/bash\n'
    printf 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n'
    printf '%s /usr/local/bin/backup.sh >> /proc/1/fd/1 2>> /proc/1/fd/2\n' "$BACKUP_CRON_SCHEDULE"
  } >"$cron_file"
}
