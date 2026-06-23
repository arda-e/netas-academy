#!/usr/bin/env bash

set -euo pipefail

ENV_FILE="/etc/postgres-backup.env"
CRON_FILE="/etc/crontabs/root"

# shellcheck disable=SC1091
source /usr/local/lib/postgres-backup/config.sh

if [[ "$#" -gt 0 ]]; then
  exec "$@"
fi

backup_config_load
backup_config_write_env_file "$ENV_FILE"
backup_config_write_cron_file "$CRON_FILE"

if [[ "$BACKUP_RUN_ON_START" == "true" ]]; then
  /usr/local/bin/backup.sh
fi

exec crond -f -l 8
