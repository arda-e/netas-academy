#!/usr/bin/env bash

set -euo pipefail

required_vars=(
  PRODUCTION_HOST
  PRODUCTION_USER
  PRODUCTION_APP_DIR
  PRODUCTION_SSH_PRIVATE_KEY
  REGISTRY_DEPLOY_USER
  REGISTRY_DEPLOY_PASSWORD
  CI_REGISTRY
  CI_REGISTRY_IMAGE
  CI_COMMIT_SHA
  APP_KEYS
  ADMIN_JWT_SECRET
  API_TOKEN_SALT
  TRANSFER_TOKEN_SALT
  ENCRYPTION_KEY
  JWT_SECRET
  POSTGRES_PASSWORD
  EMAIL_SMTP_USER
  EMAIL_SMTP_PASS
)

for required_var in "${required_vars[@]}"; do
  if [[ -z "${!required_var:-}" ]]; then
    echo "Missing required GitLab variable: ${required_var}" >&2
    exit 1
  fi
done

ssh_target="${PRODUCTION_USER}@${PRODUCTION_HOST}"
ssh_port="${PRODUCTION_SSH_PORT:-22}"
ssh_opts=(-i ~/.ssh/production_deploy_key -p "$ssh_port" -o StrictHostKeyChecking=yes)
scp_opts=(-i ~/.ssh/production_deploy_key -P "$ssh_port" -o StrictHostKeyChecking=yes)
compose_file="deploy/ubuntu/docker-compose.production.yml"

umask 077
production_env="$(mktemp)"
write_env() {
  local key="${1:?key is required}"
  local value="${2:-}"
  value="${value//\'/\'\\\'\'}"
  printf "%s='%s'\n" "$key" "$value" >>"$production_env"
}

write_env APP_IMAGE "${CI_REGISTRY_IMAGE}:${CI_COMMIT_SHA}"
write_env GIT_COMMIT_SHA "$CI_COMMIT_SHA"
write_env NEXT_PUBLIC_SITE_URL "${NEXT_PUBLIC_SITE_URL:-https://new.netasacademy.com}"
write_env STRAPI_PUBLIC_URL "${STRAPI_PUBLIC_URL:-https://api.netasacademy.com}"
write_env CLIENT_URL "${CLIENT_URL:-https://new.netasacademy.com}"
write_env FRONTEND_URL "${FRONTEND_URL:-http://127.0.0.1:3000}"
write_env NEXT_PUBLIC_API_URL "${NEXT_PUBLIC_API_URL:-https://api.netasacademy.com}"
write_env PREVIEW_SECRET "${PREVIEW_SECRET:-}"
write_env APP_KEYS "$APP_KEYS"
write_env ADMIN_JWT_SECRET "$ADMIN_JWT_SECRET"
write_env API_TOKEN_SALT "$API_TOKEN_SALT"
write_env TRANSFER_TOKEN_SALT "$TRANSFER_TOKEN_SALT"
write_env ENCRYPTION_KEY "$ENCRYPTION_KEY"
write_env JWT_SECRET "$JWT_SECRET"
write_env POSTGRES_PASSWORD "$POSTGRES_PASSWORD"
write_env EMAIL_SMTP_HOST "${EMAIL_SMTP_HOST:-smtp-relay.brevo.com}"
write_env EMAIL_SMTP_PORT "${EMAIL_SMTP_PORT:-587}"
write_env EMAIL_SMTP_SECURE "${EMAIL_SMTP_SECURE:-false}"
write_env EMAIL_SMTP_USER "$EMAIL_SMTP_USER"
write_env EMAIL_SMTP_PASS "$EMAIL_SMTP_PASS"
write_env EMAIL_DEFAULT_FROM "${EMAIL_DEFAULT_FROM:-Netas Academy <aeren@netas.com.tr>}"
write_env EMAIL_DEFAULT_REPLY_TO "${EMAIL_DEFAULT_REPLY_TO:-aeren@netas.com.tr}"
write_env EMAIL_TEST_ADDRESS "${EMAIL_TEST_ADDRESS:-test@netasacademy.com}"
write_env REGISTRY_DEPLOY_USER "$REGISTRY_DEPLOY_USER"
write_env REGISTRY_DEPLOY_PASSWORD "$REGISTRY_DEPLOY_PASSWORD"
write_env CI_REGISTRY "$CI_REGISTRY"
write_env B2_BACKUP_BUCKET "${B2_BACKUP_BUCKET:-}"
write_env B2_BACKUP_APPLICATION_KEY_ID "${B2_BACKUP_APPLICATION_KEY_ID:-}"
write_env B2_BACKUP_APPLICATION_KEY "${B2_BACKUP_APPLICATION_KEY:-}"
write_env B2_BACKUP_PREFIX "${B2_BACKUP_PREFIX:-postgres}"
write_env BACKUP_CRON_SCHEDULE "${BACKUP_CRON_SCHEDULE:-0 2 * * *}"
write_env BACKUP_RUN_ON_START "${BACKUP_RUN_ON_START:-true}"

ssh "${ssh_opts[@]}" "$ssh_target" "mkdir -p '${PRODUCTION_APP_DIR}/deploy/ubuntu/nginx' '${PRODUCTION_APP_DIR}/docker/postgres-backup' '${PRODUCTION_APP_DIR}/scripts'"
scp "${scp_opts[@]}" "$compose_file" "$ssh_target:${PRODUCTION_APP_DIR}/${compose_file}"
scp "${scp_opts[@]}" deploy/ubuntu/nginx/new.netasacademy.com.conf "$ssh_target:${PRODUCTION_APP_DIR}/deploy/ubuntu/nginx/new.netasacademy.com.conf"
scp "${scp_opts[@]}" docker/postgres-backup/* "$ssh_target:${PRODUCTION_APP_DIR}/docker/postgres-backup/"
scp "${scp_opts[@]}" scripts/restore-production-db.sh "$ssh_target:${PRODUCTION_APP_DIR}/scripts/restore-production-db.sh"
scp "${scp_opts[@]}" "$production_env" "$ssh_target:${PRODUCTION_APP_DIR}/.env"
rm -f "$production_env"

ssh "${ssh_opts[@]}" "$ssh_target" "PRODUCTION_APP_DIR='${PRODUCTION_APP_DIR}' bash -s" <<'REMOTE'
set -euo pipefail

cd "$PRODUCTION_APP_DIR"
compose="docker compose -f deploy/ubuntu/docker-compose.production.yml"

set -a
. ./.env
set +a

print_failure_context() {
  echo "Remote compose status:" >&2
  $compose ps >&2 || true
  echo "Recent app logs:" >&2
  $compose logs --tail=200 app >&2 || true
  echo "Recent Postgres logs:" >&2
  $compose logs --tail=200 postgres >&2 || true
}

trap print_failure_context ERR

for required_file in deploy/ubuntu/docker-compose.production.yml deploy/ubuntu/nginx/new.netasacademy.com.conf; do
  test -s "$required_file"
done

install -m 0644 deploy/ubuntu/nginx/new.netasacademy.com.conf /etc/nginx/sites-available/new.netasacademy.com
ln -sfn /etc/nginx/sites-available/new.netasacademy.com /etc/nginx/sites-enabled/new.netasacademy.com
nginx -t
nginx -s reload

for attempt in 1 2 3 4 5; do
  if ! ss -ltn "sport = :1337" | grep -q ':1337'; then
    break
  fi

  if [ "$attempt" -eq 5 ]; then
    echo "Port 1337 is still occupied after nginx reload." >&2
    ss -ltnp "sport = :1337" >&2 || true
    exit 1
  fi

  sleep 2
done

echo "$REGISTRY_DEPLOY_PASSWORD" | docker login "$CI_REGISTRY" -u "$REGISTRY_DEPLOY_USER" --password-stdin

for attempt in 1 2 3 4 5; do
  echo "docker compose pull attempt ${attempt}/5"
  if $compose pull; then
    break
  fi

  if [ "$attempt" -eq 5 ]; then
    echo "docker compose pull failed after 5 attempts." >&2
    exit 1
  fi

  sleep $((attempt * 10))
done

$compose up -d --remove-orphans --wait --wait-timeout 180
$compose ps
docker image prune -af
REMOTE
