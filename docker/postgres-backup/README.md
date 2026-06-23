# Postgres Backup Sidecar

This directory contains the scheduled PostgreSQL backup job for the Postgres deployment profile.

It does two things:

1. Runs `pg_dump` against the Postgres service.
2. Uploads the dump to a Backblaze B2 bucket through the native `b2` CLI.

The backup bucket should be private.

## What gets backed up

- PostgreSQL database contents
- No application files
- No uploaded media

If media is stored in Backblaze B2, it is backed up separately by B2 itself. If media is still local, it should be migrated off disk before relying on this backup flow.

## Files

- `config.sh`: shared config loader that normalizes env values, writes the cron file, and writes the runtime env file
- `backup.sh`: authorizes with Backblaze, creates a custom-format `pg_dump`, and uploads it to B2
- `entrypoint.sh`: writes the cron job, runs an optional startup backup, and starts `crond`
- `Dockerfile`: builds the sidecar image

## Run the stack

Use the root compose file together with the `backups` profile when you want
scheduled dumps:

```bash
docker compose --profile backups up -d --build postgres-backup
```

## Required environment variables

Database:

- `DATABASE_URL`

Backup target:

- `B2_BACKUP_BUCKET` bucket name, not bucket id
- `B2_BACKUP_APPLICATION_KEY_ID`
- `B2_BACKUP_APPLICATION_KEY`

## Optional environment variables

Backup target:

- `BACKUP_CRON_SCHEDULE`
- `BACKUP_RUN_ON_START`
- `B2_BACKUP_PREFIX`

Defaults:

- cron schedule: `0 2 * * *` UTC
- run on start: `true`

## Manual Backup

Run a one-off backup from the repo root:

```bash
npm run backup:postgres:docker
```

Equivalent compose command:

```bash
docker compose --profile backups run --rm postgres-backup /usr/local/bin/backup.sh
```

## Cron Test

To test the cron sidecar quickly, temporarily set:

```bash
BACKUP_CRON_SCHEDULE=* * * * *
BACKUP_RUN_ON_START=true
```

Then start and watch logs:

```bash
npm run backup:postgres:start-cron
npm run backup:postgres:logs
```

## Backup format

The sidecar writes a PostgreSQL custom-format dump with `pg_dump -Fc` and uploads it with a timestamped name like:

```text
postgres/postgres-20260621T120000Z.dump
```

## Restore

Download the dump from B2, then restore it into a fresh or empty Postgres database with [`scripts/restore-production-db.sh`](/Users/arda/Desktop/development/netas_academy/scripts/restore-production-db.sh).

## Operational notes

- The backup sidecar runs on the cron schedule and can also run once on container start.
- The shared config loader keeps the schedule, backup prefix, and B2 defaults in one place.
- The sidecar expects the Postgres service to be healthy before starting.
- Keep at least one tested restore procedure. A backup is only useful once restore is verified.
