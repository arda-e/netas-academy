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
