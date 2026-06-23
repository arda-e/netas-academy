---
date: 2026-06-23
topic: gitlab-ubuntu-deployment-migration
---

# GitLab Ubuntu Deployment Migration Requirements

## Summary

Migrate the academy portal delivery path from GitHub Actions, GHCR, and EC2 to GitLab CI, GitLab Container Registry, and a custom Ubuntu production server. The target runtime uses Docker for the combined app image, a separate Postgres container, and host-level Nginx with Certbot for public TLS and proxying.

---

## Problem Frame

The current deployment is tightly coupled to GitHub and EC2. Images are built and published through GitHub Actions to GHCR, then a second GitHub workflow connects to EC2, uploads compose/Nginx files, writes a remote `.env`, pulls the GHCR image, and restarts Docker Compose.

The new target should preserve the useful operational shape of that setup while removing GitHub, GHCR, and EC2 as assumptions. The migration is a fresh production deploy, so the requirements do not need to preserve current SQLite content or uploaded files.

---

## Key Decisions

- **Host Nginx owns public traffic.** Ubuntu system Nginx and Certbot should terminate TLS and proxy to local container ports, instead of keeping Nginx inside Docker Compose.
- **Strapi gets its own subdomain.** Host Nginx should serve the public Next.js site on the main domain and proxy Strapi admin/API through a dedicated CMS subdomain, without exposing public `:1337`.
- **GitLab becomes the delivery authority.** GitLab CI builds, tests, publishes, and deploys the application; GitHub Actions and GHCR are not kept as parallel production paths.
- **`main` auto-deploys after quality gates.** Production deploys should run automatically from `main` only after lint and tests pass, with a manual production deploy still available for reruns.
- **Production starts fresh.** The migration should create a clean Ubuntu/Postgres production environment instead of performing a live data cutover from the current SQLite runtime.
- **Postgres is containerized but separate.** The app and Postgres should run as distinct Docker services, with Postgres persistence owned by a dedicated server volume or bind mount.

---

## Actors

- A1. **Developer** pushes changes to GitLab and reads pipeline/deploy results.
- A2. **GitLab CI** validates, builds, publishes, and initiates production deploys.
- A3. **Ubuntu server** runs Docker services, host Nginx, Certbot, persistent data, and deployment scripts.
- A4. **Site operator** manages secrets, DNS, first-time server setup, and production recovery tasks.

---

## Requirements

**Repository and Delivery Ownership**

- R1. The production source of truth must move from GitHub to GitLab.
- R2. GitHub Actions workflows must no longer be required for production build or deploy.
- R3. Production images must be published to GitLab Container Registry with immutable commit tags.
- R4. The deployment must identify the exact commit SHA running in production.

**CI Quality Gates**

- R5. GitLab CI must run the existing lint gate before building or deploying production.
- R6. GitLab CI must run the available frontend and backend automated test suites before production deploy.
- R7. The existing Playwright E2E suite must be represented as a production quality gate, either in the default deploy pipeline or as an explicitly blocking manual/scheduled gate.
- R8. A failed lint, test, build, image push, or deploy step must stop production deployment.

**Image Build and Registry**

- R9. GitLab CI must build the existing production Docker image using Node 22.
- R10. GitLab CI must push both an immutable commit tag and a stable production tag to GitLab Container Registry.
- R11. The Ubuntu server must pull production images from GitLab Container Registry without relying on GHCR credentials.

**Ubuntu Runtime**

- R12. The production server must run the combined Next.js and Strapi app in Docker.
- R13. Postgres must run as a separate Docker service from the app.
- R14. App startup must use Postgres configuration in production rather than the current deploy-compose SQLite setting.
- R15. Persistent Postgres data must survive app image replacement, compose restarts, and server reboots.
- R16. Uploaded media must have an explicit production storage decision before launch, because the fresh deploy does not preserve current local uploads.

**Host Nginx and TLS**

- R17. Host Nginx must proxy the public website to the frontend container port.
- R18. Host Nginx must proxy Strapi admin/API traffic from a dedicated CMS subdomain to the backend container port.
- R19. Certbot must issue and renew TLS certificates on the Ubuntu host.
- R20. Certificate renewal must reload host Nginx without requiring a full Docker stack restart.

**Deployment Operation**

- R21. Production deploy must be triggered automatically after successful `main` pipelines.
- R22. Production deploy must also be manually runnable from GitLab for reruns and recovery.
- R23. Deployment must create or update the remote environment file from GitLab protected variables or an equivalent protected secret source.
- R24. Deployment must restart the app stack with health checks and fail the pipeline when the new version does not become healthy.
- R25. Deployment failure must collect enough remote status and logs for diagnosis from GitLab job output.

**Backups and Recovery**

- R26. Postgres backup requirements must be preserved or re-established for the new containerized Postgres setup.
- R27. A restore procedure must be documented and verified before the migration is considered production-ready.
- R28. Production secrets must not be stored in tracked files on GitLab or on the server deploy directory.

---

## Key Flows

- F1. GitLab push-to-production
  - **Trigger:** A change lands on `main`.
  - **Actors:** A1, A2, A3
  - **Steps:** GitLab CI installs dependencies, runs lint and tests, builds the Docker image, pushes registry tags, connects to the Ubuntu server, updates deploy files/secrets, pulls the image, restarts services, and checks health.
  - **Outcome:** The server runs the image for the pushed commit, or the pipeline fails before changing production.
  - **Covered by:** R3, R5, R6, R8, R9, R10, R21, R24

- F2. First production bootstrap
  - **Trigger:** The custom Ubuntu server is ready for initial launch.
  - **Actors:** A3, A4
  - **Steps:** The operator configures DNS, Docker, host Nginx, Certbot, GitLab registry access, protected secrets, persistent data paths, Postgres, and the app stack.
  - **Outcome:** The fresh production environment can receive automated GitLab deploys.
  - **Covered by:** R11, R12, R13, R15, R17, R18, R19, R23

- F3. Recovery deploy
  - **Trigger:** The latest automatic deploy fails or a known-good commit must be redeployed.
  - **Actors:** A2, A3, A4
  - **Steps:** The operator runs a manual GitLab production deploy for a selected commit tag, the server pulls that image, restarts services, and emits logs/status back to the job.
  - **Outcome:** Production returns to a known GitLab image without GitHub/GHCR access.
  - **Covered by:** R4, R11, R22, R24, R25

---

## Acceptance Examples

- AE1. **Covers R5, R6, R8.** Given a frontend lint failure, when a commit is pushed to `main`, then GitLab CI fails before building or deploying the production image.
- AE2. **Covers R3, R4, R10.** Given a successful `main` pipeline, when the image is pushed, then GitLab Container Registry contains a tag for the commit SHA and the deploy records that SHA in production configuration.
- AE3. **Covers R11, R21, R24.** Given the Ubuntu server has valid GitLab registry credentials, when the deploy job runs, then the server pulls from GitLab Container Registry and waits for app health before marking the job successful.
- AE4. **Covers R13, R14, R15.** Given the app image is replaced during deploy, when Docker Compose restarts the stack, then Postgres data remains available and Strapi connects to Postgres.
- AE5. **Covers R17, R19, R20.** Given Certbot renews a certificate on the host, when the deploy hook runs, then host Nginx reloads and continues serving HTTPS traffic.
- AE6. **Covers R22, R25.** Given an automatic production deploy fails, when the operator opens the GitLab job, then the job output includes remote compose status and recent service logs.

---

## Success Criteria

- Production deploys no longer require GitHub Actions, GHCR, EC2-specific secrets, or EC2-specific runbooks.
- A push to `main` deploys only after lint and automated tests pass.
- The Ubuntu server can be rebuilt from tracked deployment artifacts plus protected secrets and persistent data backups.
- A failed deploy leaves enough evidence in GitLab CI logs to diagnose without SSHing blindly first.
- A restore from Postgres backup is tested before the fresh production setup is treated as launch-ready.

---

## Scope Boundaries

- No live migration of existing SQLite content is required.
- No preservation of current local uploads is required.
- No parallel production deployment path through GitHub Actions or GHCR is required.
- No host-installed Postgres is required.
- No public `:1337` Strapi port is required.
- No application feature work is included unless needed to support the deployment/runtime migration.

---

## Dependencies and Assumptions

- The custom Ubuntu server has inbound access for the intended public HTTP/HTTPS ports and outbound access to GitLab Container Registry.
- DNS can be pointed at the custom Ubuntu server before certificate issuance.
- GitLab protected variables can hold registry, SSH, application, Strapi, SMTP, database, and backup secrets.
- The existing Docker image remains the production packaging unit unless planning discovers a blocking reason to split frontend and backend images.
- The production media decision may reuse the existing Backblaze B2 upload path, but that choice is not settled by this brainstorm.

---

## Outstanding Questions

### Resolve Before Planning

- Should the first GitLab implementation run Playwright E2E on every `main` deploy, or make E2E a blocking manual/scheduled gate while lint, frontend tests, and backend tests run on every deploy?
- What domain name should replace the current `new.netasacademy.com` assumptions in Nginx, Certbot, and public URL variables?

### Deferred to Planning

- Which exact GitLab CI job split, cache strategy, and Docker build method should be used?
- Which server path and Docker network names should be standardized for the custom Ubuntu deployment?
- Which backup retention policy and restore verification command should be used for Postgres?

---

## Sources and Research

- `README.md` documents the current monorepo, Docker shape, Postgres profile, and backup sidecar commands.
- `.github/workflows/build-images.yml` defines the current GitHub Actions build and GHCR image publishing path.
- `.github/workflows/deploy-ec2.yml` defines the current EC2 SSH deploy behavior, remote `.env` writing, GHCR pull, health wait, and failure log collection.
- `docker-compose.deploy.yml` shows the current production compose shape and its SQLite/GHCR/Docker-Nginx assumptions.
- `docker-compose.yml` contains the existing separate Postgres and backup services behind profiles.
- `docker-compose.external-postgres.yml` shows the existing overlay for a separately managed Postgres connection.
- `backend/config/database.ts` confirms Strapi supports Postgres via environment configuration.
- `docker/nginx/conf.d/new.netasacademy.com.conf` shows the existing Docker-Nginx proxy behavior to preserve conceptually in host Nginx.
- `docs/deployment/ec2-nginx-certbot.md` is the EC2-specific runbook that should be replaced or generalized for the custom Ubuntu server.
- `frontend/package.json`, `backend/package.json`, and `e2e/package.json` define the current lint and test command surface.
