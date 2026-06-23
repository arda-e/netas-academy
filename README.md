# netas_academy

Monorepo bootstrap with:

- `frontend/`: Next.js 16.2.2 with TypeScript, App Router, ESLint, Tailwind CSS v4
- `backend/`: Strapi 5.42.0 with TypeScript and SQLite

## Requirements

- Node 22.x
- npm 10+

## Getting started

Ensure your shell is already using Node 22 before running the app.

Install the root helper dependency:

```bash
npm install
```

Run both apps together:

```bash
npm run dev
```

Seed demo data for the current Strapi models:

```bash
npm run seed:demo
```

The demo seed is safe to rerun and populates `teachers`, `courses`, `events`, `blog-posts`, `students`, and `registrations` with published editorial content for local testing.

The root scripts use the active shell Node runtime. Keep it on Node 22 to avoid native module mismatches in Strapi's SQLite dependency.

Run apps separately:

```bash
npm run dev:frontend
npm run dev:backend
```

Frontend default URL: `http://localhost:3000`

Strapi admin default URL: `http://localhost:1337/admin`

## Docker

The repo includes:

- `Dockerfile`: a single production image that runs both Next.js and Strapi
- `docker-compose.yml`: runs the combined app container

Start the stack from the repo root:

```bash
docker compose up --build
```

Default URLs:

- Frontend: `http://localhost:3000`
- Strapi backend/admin: `http://localhost:1337/admin`

Notes:

- The compose file keeps Strapi SQLite data in `./.docker-data/strapi`
- Uploaded files persist in `./.docker-data/uploads`
- The single container starts Strapi first, then boots Next.js on port `3000`
- Local compose defaults to `netas-academy:local`; EC2 deploy overrides this with the GHCR image
- Server-to-server calls use `STRAPI_URL`; Strapi uploads are exposed through the frontend `/uploads/*` rewrite so browser image URLs stay same-origin
- Replace the placeholder secrets in `docker-compose.yml` before using this anywhere beyond local testing

## Backblaze B2

To move media off the local disk and into Backblaze B2:

- Set `UPLOAD_PROVIDER=aws-s3`
- Set `B2_APPLICATION_KEY_ID`, `B2_APPLICATION_KEY`, and `B2_BUCKET`
- Set `B2_REGION` to your bucket region, for example `us-west-004`
- Set `B2_ENDPOINT` to the S3 endpoint for that region, for example `https://s3.us-west-004.backblazeb2.com`
- Set `B2_PUBLIC_URL` to the public file base for your bucket, for example `https://f000.backblazeb2.com/file/<bucket-name>`
- Keep `B2_ROOT_PATH=uploads` if you want Strapi files grouped under an `uploads/` prefix

## Postgres Backups

When you switch the app to PostgreSQL, you can run a separate backup sidecar that:

- runs `pg_dump` from a cron job on a schedule
- uploads the dump to a private B2 bucket
- keeps the current SQLite flow untouched until you opt into the Postgres profile

### Use the repo-managed Postgres container

Set `DATABASE_CLIENT`, `DATABASE_URL`, and `POSTGRES_PASSWORD` in your shell or deployment env:

```bash
export DATABASE_CLIENT=postgres
export POSTGRES_PASSWORD='replace-with-a-local-password'
export DATABASE_URL='postgres://netas_academy:replace-with-a-local-password@postgres:5432/netas_academy'
```

Use the repo-managed Postgres service with:

```bash
docker compose --profile postgres up -d --build
```

For local Docker, use the same profile with `docker-compose.yml`:

```bash
docker compose --profile postgres up -d --build
```

### Use an existing Postgres container

If your Postgres container already publishes a host port, point the app at it from Docker with `host.docker.internal`:

```bash
export DATABASE_URL='postgres://USER:PASSWORD@host.docker.internal:5432/DATABASE'
docker compose -f docker-compose.yml -f docker-compose.external-postgres.yml up -d --build
```

If the Postgres container is on the same Docker network as the app, use the Postgres container name as the host in `DATABASE_URL`.

Seed the configured database through the running app container:

```bash
npm run seed:demo:docker
```

Required backup env vars:

- `DATABASE_URL`
- `B2_BACKUP_BUCKET` bucket name, not bucket id
- `B2_BACKUP_APPLICATION_KEY_ID`
- `B2_BACKUP_APPLICATION_KEY`

Optional backup env vars:

- `BACKUP_CRON_SCHEDULE`
- `BACKUP_RUN_ON_START`
- `B2_BACKUP_PREFIX`

Defaults:

- cron schedule: `0 2 * * *` UTC
- run on start: `true`

The backup sidecar is opt-in. Add `--profile backups` when starting the Postgres services if you also want scheduled B2 dumps:

```bash
docker compose --profile backups up -d --build postgres-backup
```

The root `.env` file is the local place to put these values. It is ignored by Git; use `.env.example` as the template.

Run one manual backup against the currently running local Postgres stack:

```bash
npm run backup:postgres:docker
```

Start the scheduled backup sidecar locally and watch the cron logs:

```bash
npm run backup:postgres:start-cron
npm run backup:postgres:logs
```

## Restore Production DB

Use the root `.env` file for the real Postgres password and B2 credentials. It is ignored by Git, and [`.env.example`](/Users/arda/Desktop/development/netas_academy/.env.example) shows the expected variables.

On a new server:

```bash
docker compose --profile postgres up -d postgres
```

Download the dump you want from B2. The backup sidecar stores files under:

```text
$B2_BACKUP_PREFIX/postgres-<timestamp>.dump
```

Then restore it with the helper script:

```bash
docker run --rm \
  --network netas_academy_default \
  -v "$PWD/scripts:/scripts:ro" \
  -v "$PWD/dumps:/dumps" \
  -e PGHOST=postgres \
  -e PGPORT=5432 \
  -e PGUSER=netas_academy \
  -e PGPASSWORD=netasacademy \
  -e TARGET_DB=netas_academy \
  -e ADMIN_DB=postgres \
  -e DUMP_PATH=/dumps/postgres.dump \
  postgres:16-alpine /bin/sh /scripts/restore-production-db.sh
```

If your target database name differs, change `TARGET_DB`. If you want to keep using the old `RESTORE_DB` name, the script still accepts it as a fallback.

Keep `B2_BACKUP_BUCKET`, `B2_BACKUP_APPLICATION_KEY_ID`, and `B2_BACKUP_APPLICATION_KEY` in the root `.env` file when testing against a real B2 bucket.

## Preview setup

To enable Strapi Content Manager preview with the Next.js frontend, set these env vars:

- `CLIENT_URL` for the frontend origin used by Strapi preview URLs
- `PREVIEW_SECRET` for the draft-mode preview route token
- `NEXT_PUBLIC_API_URL` for the Strapi admin origin used in the frontend CSP `frame-ancestors` allowlist
