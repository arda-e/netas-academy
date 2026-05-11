# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Academy portal monorepo for an IT training company. Primary audience is Turkish-speaking corporate and individual learners. UI copy, route slugs, and editorial content are in Turkish — preserve this unless explicitly asked to change it.

- `frontend/`: Next.js 16.2.x, React 19, TypeScript, App Router, Tailwind CSS v4, `next-intl` (tr/en)
- `backend/`: Strapi 5 with TypeScript and SQLite

## Commands

All commands run from repo root. Root scripts wrap subcommands with the correct workspace prefix.

```bash
npm install          # install all workspaces
npm run dev          # run frontend + backend concurrently
npm run dev:frontend
npm run dev:backend
npm run lint         # ESLint (frontend only)
npm run build        # build both apps
npm run build:frontend
npm run build:backend
npm run seed:demo    # populate Strapi with demo content (safe to rerun)
```

Run frontend tests (Node built-in test runner — no Jest/Vitest):

```bash
cd frontend
node --test src/__tests__/<file>.test.mjs          # single test file
node --experimental-test-coverage --test-reporter=spec scripts/run-tests-with-coverage.mjs  # all tests with coverage
```

- Frontend: `http://localhost:3000`
- Strapi admin: `http://localhost:1337/admin`

**Node requirement**: 22.x strictly. Root scripts use `fnm exec --using 22`. Keep your shell on Node 22 to avoid SQLite native-module mismatches.

## Frontend Architecture

### Routing

All user-facing routes live under `frontend/src/app/[locale]/` — the `[locale]` segment is injected by `next-intl` middleware. Default locale is `tr`; English (`en`) is also supported.

Current routes: `/`, `/egitimler`, `/egitmenler`, `/etkinlikler`, `/blog-yazilari`, `/haberler`, `/hakkimizda`, `/iletisim`, `/cozum-ortagi`, `/kvkk`.

Middleware in `frontend/src/middleware.ts` handles locale prefix injection; it excludes `/api`, `/_next`, and static assets.

### Data Layer

All Strapi fetches go through `frontend/src/lib/strapi-client.ts` (`fetchStrapi`), which wraps `fetch` with:
- Default `force-cache` unless `next.tags` or explicit `cache` option is passed
- 3 s timeout, structured JSON error logging, optional exponential-backoff retry

Domain-specific fetch helpers live in `frontend/src/lib/strapi-*.ts`:
- `strapi-courses.ts` — `getCourses`, `getCourseBySlug`, `getCourseSlugs`
- `strapi-events.ts` — `getEvents`, `getEventBySlug`, `getEventSlugs`
- `strapi-blog.ts`, `strapi-teachers.ts`, `strapi-media.ts`

Shared TypeScript types for all Strapi responses are in `frontend/src/lib/strapi-types.ts`.

The `STRAPI_URL` env var (default `http://127.0.0.1:1337`) controls server-to-server calls. In Docker, the frontend proxies `/uploads/*` to Strapi so browser image URLs stay same-origin.

### Next.js Version Warning

This project runs **Next.js 16.2.x**, which has breaking changes relative to earlier versions. Before writing any Next.js-specific code, read the relevant guide in `node_modules/next/dist/docs/`.

### Key Libraries

- **`next-intl`**: i18n. Translation files: `frontend/src/messages/{tr,en}.json`. Use `getTranslations`/`useTranslations` — never hardcode user-visible strings.
- **`react-hook-form` + `zod`**: all forms. Zod schemas are locale-aware (accept a `t` function for validation messages).
- **`isomorphic-dompurify`**: sanitize any Strapi rich-text before rendering as HTML.
- **`shadcn` / `radix-ui`**: base UI primitives under `frontend/src/components/ui/`.

### Content Components

`frontend/src/components/content/` contains the shared shells and section components used across all content pages:
- `content-page-shell.tsx`, `content-detail-shell.tsx`, `content-card-shell.tsx` — layout wrappers
- `intent-lead-form.tsx` — the multi-intent contact/lead capture form
- `responsive-layout.ts` — shared responsive breakpoint logic

### Lead / Contact System

`frontend/src/lib/lead-intents.ts` defines four lead types (`corporate_training_request`, `instructor_application`, `solution_partner_application`, `general_contact`). The `/iletisim` page renders a tabbed form driven by `?intent=<type>` query param. Submission goes to the Next.js API proxy at `/api/contact-submissions`, which forwards to the Strapi backend.

`frontend/src/lib/analytics-events.ts` defines the typed analytics event contract. The active backend defaults to a console noop; swap via `setAnalyticsBackend()`.

### Taxonomy / Enums

Shared taxonomy constants live in `frontend/src/lib/content-taxonomy.ts`:
- Topic areas: `siber-guvenlik`, `yazilim-gelistirme`, `veri-bilimi`, `bulut-altyapi`, `is-surecleri`, `yapay-zeka`
- Course levels: `temel`, `orta`, `ileri`
- Event types: `etkinlik`, `egitim`, `kurs`

### Test-ID Convention

`frontend/src/lib/testids.ts` exports `join()` and `normalizeKey()` for consistent `data-testid` attributes. Turkish characters are mapped to ASCII equivalents. Test IDs use dot-separated segments (e.g. `root-layout.content`).

## Backend Architecture

Content type schemas: `backend/src/api/<type>/content-types/<type>/schema.json`

**Public read** is bootstrapped automatically on startup (`backend/src/index.ts`) for: `teacher`, `course`, `event`, `blog-post`, `blog-author`, and media uploads.

**Custom endpoints** (not generated by Strapi defaults):
- `POST /api/registrations/register` — upserts student by email, creates registration, rejects duplicate (student + event) registrations
- `POST /api/events/:documentId/send-registration-email` — sends confirmation email via Strapi email provider

`registration` is intentionally not publicly readable — only the custom register endpoint is open.

## Cross-Stack Rules

When adding or renaming a Strapi field, update all four places:
1. `backend/src/api/*/content-types/*/schema.json`
2. Backend controller/service using the field
3. Frontend fetch query in `frontend/src/lib/strapi-*.ts` and types in `strapi-types.ts`
4. Demo seed: `backend/scripts/seed-demo.js`

Validate frontend-only changes:
```bash
npm run lint && npm run build:frontend
```

Validate backend-only changes:
```bash
npm run build:backend
```

Validate cross-stack changes:
```bash
npm run lint && npm run build && npm run seed:demo
```

## Deployment

CI builds a single Docker image containing both Next.js and Strapi (`Dockerfile`). GitHub Actions publishes to GHCR with both `:latest` and `:<commit-sha>` tags, then deploys to EC2 via SSH using `docker-compose.deploy.yml`. See `.github/README.md` for required secrets.

SQLite data persists in `.docker-data/strapi`. Media uploads go to `.docker-data/uploads`.
