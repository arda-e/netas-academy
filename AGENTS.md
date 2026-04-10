# AGENTS.md

## Project Overview

This repository is a small academy portal monorepo:

- `frontend/`: Next.js 16 App Router app in TypeScript
- `backend/`: Strapi 5 CMS and API in TypeScript with SQLite

The product surface is an academy site for courses, events, blog content, and registrations. The UI is primarily Turkish. Keep route names, labels, and editorial copy consistent with the existing Turkish navigation unless the task explicitly requires a language change.

## Start Here

Before changing code, read the files that define the local rules and entry points:

- Root overview: [`README.md`](/Users/arda/Desktop/development/netas_academy/README.md)
- Frontend-specific rules: [`frontend/AGENTS.md`](/Users/arda/Desktop/development/netas_academy/frontend/AGENTS.md)
- Frontend app shell: [`frontend/src/app/layout.tsx`](/Users/arda/Desktop/development/netas_academy/frontend/src/app/layout.tsx)
- Strapi client: [`frontend/src/lib/strapi.ts`](/Users/arda/Desktop/development/netas_academy/frontend/src/lib/strapi.ts)
- Strapi bootstrap and public permissions: [`backend/src/index.ts`](/Users/arda/Desktop/development/netas_academy/backend/src/index.ts)

## Environment

- Use Node `22.x`.
- Use `npm`, not `pnpm` or `yarn`.
- Root scripts already wrap commands with `fnm exec --using 22`.
- Backend defaults to SQLite at [`backend/.tmp/data.db`](/Users/arda/Desktop/development/netas_academy/backend/.tmp/data.db).

Common commands from the repo root:

```bash
npm install
npm run dev
npm run dev:frontend
npm run dev:backend
npm run lint
npm run build
npm run seed:demo
```

## Repo Structure

### Frontend

- Source lives under [`frontend/src`](/Users/arda/Desktop/development/netas_academy/frontend/src).
- Routes live in [`frontend/src/app`](/Users/arda/Desktop/development/netas_academy/frontend/src/app).
- Shared UI and content rendering live in [`frontend/src/components`](/Users/arda/Desktop/development/netas_academy/frontend/src/components).
- Strapi fetch helpers live in [`frontend/src/lib/strapi.ts`](/Users/arda/Desktop/development/netas_academy/frontend/src/lib/strapi.ts).

Current route groups:

- `/`: marketing hero
- `/egitimler`: courses
- `/etkinlikler`: events
- `/blog-yazilari`: blog posts
- `/haberler`: news
- `/iletisim`: contact

Frontend conventions:

- Treat `frontend/AGENTS.md` as mandatory when touching Next.js code.
- The app uses Next.js `16.2.2`, React `19`, App Router, and Tailwind CSS `v4`.
- Existing content listing pages are server-rendered and use `getCourses`, `getEvents`, and `getBlogPosts`.
- User-facing copy currently mixes Turkish characters in UI labels with ASCII slugs in URLs. Preserve that pattern unless asked to normalize it.
- The contact form is currently client-side only and does not submit to the backend. Do not assume a working contact API exists.

### Backend

- Strapi app lives in [`backend`](/Users/arda/Desktop/development/netas_academy/backend).
- Content type schemas live under [`backend/src/api`](/Users/arda/Desktop/development/netas_academy/backend/src/api).
- Demo seed lives at [`backend/scripts/seed-demo.js`](/Users/arda/Desktop/development/netas_academy/backend/scripts/seed-demo.js).

Current content types:

- `teacher`
- `course`
- `event`
- `blog-post`
- `student`
- `registration`

Important backend behavior:

- Public read permissions for `teacher`, `course`, `event`, and `blog-post` are enabled in bootstrap.
- `registration` is intentionally non-public except for the custom register endpoint.
- Custom endpoints exist for:
  - `POST /api/registrations/register`
  - `POST /api/events/:documentId/send-registration-email`
- Registration creation upserts a student by email and rejects duplicate registrations for the same event.
- Event email sending requires a configured Strapi email provider.

## Working Rules

- Prefer changing source files only. Do not edit generated or dependency directories such as:
  - `frontend/.next`
  - `frontend/node_modules`
  - `backend/dist`
  - `backend/node_modules`
- If a task touches frontend data requirements, verify the Strapi query in [`frontend/src/lib/strapi.ts`](/Users/arda/Desktop/development/netas_academy/frontend/src/lib/strapi.ts) and the matching schema in `backend/src/api/*/content-types/*/schema.json`.
- If you add or rename Strapi fields, update:
  - The relevant schema
  - Any backend controller or service logic using that field
  - The frontend fetch query and types
  - The demo seed if local demo content should cover the new field
- Keep styling aligned with the existing palette and component patterns in [`frontend/src/app/globals.css`](/Users/arda/Desktop/development/netas_academy/frontend/src/app/globals.css) and the shared content components.
- Do not replace the existing Turkish IA and copy structure with generic English placeholders.

## Validation

For frontend-only changes:

```bash
npm run lint
npm run build:frontend
```

For backend-only changes:

```bash
npm run build:backend
```

For cross-stack changes:

```bash
npm run lint
npm run build
npm run seed:demo
```

If you change Strapi models or registration flows, test the affected API route against a running backend instead of assuming the generated controller behavior is sufficient.

## Git Notes

The repo root is not currently a Git repository. Check the target app directory before running Git commands. At the time of writing, `frontend/` contains its own Git metadata.
