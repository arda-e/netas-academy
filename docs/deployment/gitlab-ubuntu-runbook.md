# GitLab Ubuntu Deployment Runbook

This runbook moves production delivery to GitLab CI, GitLab Container Registry, host Nginx, and Docker Compose on the Ubuntu host `185.48.181.248`.

The first migration keeps:

- Public frontend: `https://new.netasacademy.com`
- Temporary Strapi admin/API: `https://new.netasacademy.com:1337`
- Deploy user: `root`
- Dockerized app and Postgres
- Host Nginx and host Certbot

## Repository Setup

Keep GitHub `origin` during migration and add GitLab as a separate remote:

```bash
git remote add gitlab git@gitlab.com:netastelekom/visium/netas-academy.git
git remote -v
glab repo view netastelekom/visium/netas-academy
```

Push `main` to GitLab before expecting GitLab CI to run:

```bash
git push gitlab main
```

## GitLab Variables

Create these as protected GitLab CI/CD variables. Mask values where GitLab allows masking.

| Variable | Purpose |
| --- | --- |
| `PRODUCTION_HOST` | `185.48.181.248` |
| `PRODUCTION_USER` | `root` for the first migration |
| `PRODUCTION_SSH_PRIVATE_KEY` | Private key used by GitLab deploy jobs |
| `PRODUCTION_APP_DIR` | Server deploy directory, for example `/opt/netas_academy` |
| `REGISTRY_DEPLOY_USER` | GitLab deploy token username with `read_registry` |
| `REGISTRY_DEPLOY_PASSWORD` | GitLab deploy token secret with `read_registry` |
| `APP_KEYS` | Strapi app keys |
| `ADMIN_JWT_SECRET` | Strapi admin JWT secret |
| `API_TOKEN_SALT` | Strapi API token salt |
| `TRANSFER_TOKEN_SALT` | Strapi transfer token salt |
| `ENCRYPTION_KEY` | Strapi encryption key |
| `JWT_SECRET` | Strapi JWT secret |
| `POSTGRES_PASSWORD` | Production Postgres password |
| `EMAIL_SMTP_USER` | Brevo SMTP login |
| `EMAIL_SMTP_PASS` | Brevo SMTP key |
| `PREVIEW_SECRET` | Optional Strapi preview token |
| `B2_BACKUP_BUCKET` | Optional private B2 bucket for Postgres dumps |
| `B2_BACKUP_APPLICATION_KEY_ID` | Optional B2 backup key id |
| `B2_BACKUP_APPLICATION_KEY` | Optional B2 backup key |

GitLab CI uses the built-in registry variables `CI_REGISTRY`, `CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD`, and `CI_REGISTRY_IMAGE` for image publishing. The server uses the deploy token variables above for long-lived image pulls.

## Host Setup

Run on `root@185.48.181.248`:

```bash
apt update
apt install -y nginx certbot
mkdir -p /opt/netas_academy/deploy/ubuntu/nginx
mkdir -p /opt/netas_academy/docker/postgres-backup
mkdir -p /var/www/certbot
```

Make sure DNS for `new.netasacademy.com` points to `185.48.181.248` and inbound `80`, `443`, and `1337` are reachable before issuing certificates.

Install the host Nginx config after GitLab or local SCP has placed it on the host:

```bash
cp /opt/netas_academy/deploy/ubuntu/nginx/new.netasacademy.com.conf /etc/nginx/sites-available/new.netasacademy.com
ln -sf /etc/nginx/sites-available/new.netasacademy.com /etc/nginx/sites-enabled/new.netasacademy.com
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

## Certificates

Issue the first certificate:

```bash
certbot certonly --webroot \
  -w /var/www/certbot \
  -d new.netasacademy.com \
  --email aeren@netas.com.tr \
  --agree-tos \
  --non-interactive
```

Verify:

```bash
ls -l /etc/letsencrypt/live/new.netasacademy.com/fullchain.pem
ls -l /etc/letsencrypt/live/new.netasacademy.com/privkey.pem
nginx -t
systemctl reload nginx
```

Create a Certbot deploy hook that reloads host Nginx only:

```bash
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat >/etc/letsencrypt/renewal-hooks/deploy/reload-netas-nginx.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
nginx -t
systemctl reload nginx
EOF
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-netas-nginx.sh
certbot renew --dry-run
```

The renewal hook must not restart Docker services.

## Pipeline

The GitLab pipeline runs:

1. Frontend lint
2. Frontend tests, temporarily non-blocking during the migration
3. Backend tests, temporarily non-blocking during the migration
4. Playwright E2E after demo seed, temporarily non-blocking during the migration
5. Docker image build and push to GitLab Container Registry
6. SSH deploy to Ubuntu

Frontend, backend, and E2E test jobs are intentionally marked `allow_failure: true`
for the first GitLab Ubuntu migration because earlier broad frontend/backend
refactors left source-contract tests stale. Keep the jobs visible in GitLab so
the red signal is not lost, but repair the stale tests in a dedicated follow-up
branch before making them blocking again.

Image tags:

- `$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA`
- `$CI_REGISTRY_IMAGE:production`

The deploy job writes `/opt/netas_academy/.env` from protected GitLab variables, logs into GitLab Container Registry on the server, pulls the commit-tagged image, and runs:

```bash
docker compose -f deploy/ubuntu/docker-compose.production.yml up -d --remove-orphans --wait --wait-timeout 180
```

Deployment failure prints remote compose status plus recent app and Postgres logs in the GitLab job output.

## Runtime Checks

After a successful deploy:

```bash
ssh root@185.48.181.248
cd /opt/netas_academy
docker compose -f deploy/ubuntu/docker-compose.production.yml ps
docker compose -f deploy/ubuntu/docker-compose.production.yml exec postgres pg_isready -U netas_academy -d netas_academy
curl -I https://new.netasacademy.com
curl -I https://new.netasacademy.com:1337/admin
```

Confirm the deployed commit:

```bash
grep '^GIT_COMMIT_SHA=' /opt/netas_academy/.env
```

## Media Storage Decision

For the first GitLab Ubuntu launch, uploaded media is explicitly stored in the persistent Docker volume `app-uploads`. This avoids silently depending on unconfigured B2 media variables on `main`.

Before real editorial usage, choose one of these:

- Keep `app-uploads` and add a file-level backup/migration process.
- Reintroduce B2 media upload provider support and set the media variables as protected GitLab variables.

Do not treat Postgres backups as media backups.

## Manual Backup

When B2 backup variables are present, run:

```bash
cd /opt/netas_academy
docker compose -f deploy/ubuntu/docker-compose.production.yml --profile backups run --rm postgres-backup /usr/local/bin/backup.sh
```

The expected artifact path is:

```text
b2://$B2_BACKUP_BUCKET/$B2_BACKUP_PREFIX/postgres-<timestamp>.dump
```

## Restore Test

Copy a downloaded dump to `/opt/netas_academy/dumps/postgres.dump`, then run:

```bash
cd /opt/netas_academy
docker run --rm \
  --network netas_academy_default \
  -v "$PWD/scripts:/scripts:ro" \
  -v "$PWD/dumps:/dumps" \
  -e PGHOST=postgres \
  -e PGPORT=5432 \
  -e PGUSER=netas_academy \
  -e PGPASSWORD="$POSTGRES_PASSWORD" \
  -e TARGET_DB=netas_academy \
  -e ADMIN_DB=postgres \
  -e DUMP_PATH=/dumps/postgres.dump \
  postgres:17-alpine /bin/sh /scripts/restore-production-db.sh
```

Verify Strapi tables after restore:

```bash
docker compose -f deploy/ubuntu/docker-compose.production.yml exec postgres \
  psql -U netas_academy -d netas_academy -c "\\dt"
```

## GitHub Production Retirement

Do not delete `.github/workflows/build-images.yml`, `.github/workflows/deploy-ec2.yml`, or `docker-compose.deploy.yml` until:

1. A `main` pipeline has deployed from GitLab.
2. The server is running the expected `$CI_COMMIT_SHA`.
3. Manual rerun deploy works from GitLab.
4. A forced deploy failure has shown useful remote logs.
5. Backup and restore have been tested or consciously deferred for launch.

After those checks pass, remove the GitHub production workflows and GHCR/EC2 secrets from the production path.
