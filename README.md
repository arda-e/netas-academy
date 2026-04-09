# netas_academy

Monorepo bootstrap with:

- `frontend/`: Next.js 16.2.2 with TypeScript, App Router, ESLint, Tailwind CSS v4
- `backend/`: Strapi 5.42.0 with TypeScript and SQLite

## Requirements

- Node 24.x
- npm 10+

## Getting started

If your shell is not already using Node 24, switch first:

```bash
fnm use 24
```

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

The root scripts also force Node 24 through `fnm`, which avoids native module mismatches in Strapi's SQLite dependency when your default shell is on a newer Node release.

Run apps separately:

```bash
npm run dev:frontend
npm run dev:backend
```

Frontend default URL: `http://localhost:3000`

Strapi admin default URL: `http://localhost:1337/admin`

## Docker

The repo includes:

- `Dockerfile.frontend`: Next.js standalone production image
- `Dockerfile.backend`: Strapi production image
- `docker-compose.yml`: runs frontend, backend, and nginx together

Start the stack from the repo root:

```bash
docker compose up --build
```

Default URLs:

- Frontend via nginx: `http://localhost`
- Strapi backend/admin: `http://localhost:1337/admin`

Notes:

- The compose file keeps Strapi SQLite data in `./.docker-data/strapi`
- Uploaded files persist in `./.docker-data/uploads`
- Replace the placeholder secrets in `docker-compose.yml` before using this anywhere beyond local testing
