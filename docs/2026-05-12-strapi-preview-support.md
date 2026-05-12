# Strapi Preview Support

## What Was Applied

- Added Strapi admin preview configuration in `backend/config/admin.ts`.
- Added a Next.js preview route in `frontend/src/app/api/preview/route.ts`.
- Made the Strapi fetch layer draft-aware in `frontend/src/lib/strapi-client.ts`.
- Extended fetch options in `frontend/src/lib/strapi-types.ts` for preview headers.
- Added CSP `frame-ancestors` support in `frontend/next.config.ts`.
- Documented preview environment variables in `README.md`.
- Updated the EC2 deploy workflow to inject preview env vars into the remote `.env`.
- Updated `.github/README.md` with the deploy secret list.

## Previewable Content Types

The preview handler is wired for these Strapi UIDs:

- `api::course.course`
- `api::event.event`
- `api::blog-post.blog-post`
- `api::teacher.teacher`

Each one maps to the existing locale-prefixed frontend routes:

- `/[locale]/egitimler/[slug]`
- `/[locale]/etkinlikler/[slug]`
- `/[locale]/blog-yazilari/[slug]`
- `/[locale]/egitmenler/[slug]`

## Approach

1. Read the live repo structure and confirmed the project is a Strapi 5 backend plus a Next.js App Router frontend.
2. Matched the preview URLs to the actual frontend route conventions instead of using generic examples.
3. Added the Strapi admin `preview` block so the Content Manager can generate a preview URL.
4. Added a secure Next.js preview route that validates `PREVIEW_SECRET`, toggles Draft Mode, and only redirects to relative paths.
5. Made frontend Strapi data fetching draft-aware by adding `status=draft` and `strapi-encode-source-maps: true` only while draft mode is enabled.
6. Added iframe embedding support with a narrow `frame-ancestors` CSP directive.
7. Updated deploy wiring so the required preview env vars are written into the EC2 runtime `.env`.

## Required Environment Variables

- `CLIENT_URL`
- `PREVIEW_SECRET`
- `NEXT_PUBLIC_API_URL`

## Notes

- `PREVIEW_SECRET` is a shared random token, not a public/private key pair.
- The preview route rejects invalid secrets and non-relative redirects.
- Live Preview was not added; basic preview works without it.
