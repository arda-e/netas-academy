---
title: "feat: Implement frontend SEO layer"
type: feat
status: active
date: 2026-05-11
---

# feat: Implement frontend SEO layer

## Summary

The backend SEO component (`metaTitle`, `metaDescription`, `canonicalPath`, `noIndex`, `ogTitle`, `ogDescription`, `ogImage`) is already modelled and fetched on every content request — but nothing in the frontend consumes it. This plan wires the full SEO pipeline: a single utility merges CMS-authored entity overrides with site-setting defaults, `generateMetadata` is upgraded on all routes, JSON-LD is injected on detail pages, and a `robots.txt` App Router file is added. Sitemap generation is deferred until Phase 2 Strapi i18n ships.

---

## Problem Frame

Four detail pages derive metadata from raw entity fields, silently ignoring the populated `seo.*` sub-object sitting on each fetch response. Eight listing and informational pages export no metadata at all. No page sets `metadataBase`, so every relative URL in `openGraph.images` and `alternates.canonical` is unresolvable by crawlers and social sharing parsers. No `robots.txt` is served. The `StrapiSeo` type and fetch populate queries are already complete — the gap is entirely in the Next.js layer.

---

## Requirements

- R1. Pages emit `<title>` and `<meta name="description">` using `seo.metaTitle` / `seo.metaDescription` where CMS-set, falling back to entity fields and then site-setting defaults.
- R2. Pages emit `<meta name="robots" content="noindex,nofollow">` when `seo.noIndex` is true; `/iletisim` and `/etkinlikler/[slug]/kayit` are noindexed unconditionally regardless of CMS state.
- R3. Pages emit `<link rel="canonical">` using `seo.canonicalPath` when CMS-set; otherwise the page's own locale-prefixed absolute path.
- R4. Pages emit Open Graph `<meta>` tags (`og:title`, `og:description`, `og:image`) using CMS-authored OG fields with entity-field fallbacks.
- R5. All pages emit `<link rel="alternate" hreflang>` for `tr` and `en`. Static pages only in Phase 1; detail-page EN alternate deferred to Phase 2 Strapi i18n.
- R6. Content detail pages (course, event, blog post, teacher) emit JSON-LD structured data appropriate to each content type.
- R7. `GET /robots.txt` disallows `/api/` and allows all other paths.
- R8. All `generateMetadata` functions consistently receive and pass the `locale` param — including blog post and teacher detail, which currently omit it.

---

## Scope Boundaries

- Sitemap (`sitemap.ts`) is not part of this plan — deferred per i18n requirements doc until Phase 2 Strapi i18n delivers localized slugs.
- Twitter-specific `<meta name="twitter:*">` tags are out of scope; OG values serve as fallback for social sharing previews.
- No new Strapi backend fields are needed; JSON-LD is generated programmatically from existing entity fields.
- CMS content editors populating SEO fields in Strapi admin is an operational concern, not a code change.
- hreflang for content detail pages (cross-locale slug resolution) is deferred to Phase 2.

### Deferred to Follow-Up Work

- Sitemap (`frontend/src/app/sitemap.ts`) with per-locale URL variants: separate PR after Phase 2 Strapi i18n ships.
- hreflang alternates on detail pages (`/egitimler/[slug]` ↔ `/en/courses/[slug]`): requires localized slugs from Strapi, Phase 2.
- `generateStaticParams` for pre-rendering detail pages: independent performance concern, not blocked by SEO.

---

## Context & Research

### Relevant Code and Patterns

- `frontend/src/lib/strapi-types.ts:143` — `StrapiSeo` type (all 8 fields already defined)
- `frontend/src/lib/strapi-types.ts:154` — `StrapiSiteSetting` type (exists, no fetch helper)
- `frontend/src/lib/strapi-media.ts` — `getStrapiMediaFormat()`, `toStrapiAssetUrl()` for resolving OG image relative paths
- `frontend/src/lib/strapi-courses.ts` — reference implementation for fetch helpers with `populate` and caching pattern
- `frontend/src/app/[locale]/egitimler/[slug]/page.tsx:45` — current best-practice `generateMetadata` shape (destructures `locale`, calls `getTranslations`)
- `frontend/src/i18n/routing.ts` — `defineRouting` with `locales: ['tr', 'en']`, `defaultLocale: 'tr'`

### Institutional Learnings

- The four-place update rule (`CLAUDE.md`) applies to any Strapi schema change: schema.json, controller/service, strapi-*.ts fetch, seed-demo.js. This plan does NOT add new backend fields, so the rule is not triggered.
- Blog post detail (`/blog-yazilari/[slug]/page.tsx`) and teacher detail (`/egitmenler/[slug]/page.tsx`) do not currently pass `locale` to `getTranslations` in `generateMetadata` — they are inconsistent with course and event detail. This plan fixes both.
- `toStrapiAssetUrl()` normalises Strapi image paths to relative paths (e.g., `/uploads/...`). When placed in `openGraph.images`, Next.js resolves relative strings against `metadataBase` automatically.
- **IMPORTANT**: This project runs Next.js 16.2.x with breaking API changes. Before implementing any `generateMetadata` or metadata-adjacent code, the implementing agent must read `node_modules/next/dist/docs/` in the frontend workspace.
- i18n requirements doc (`docs/brainstorms/i18n-requirements.md`) explicitly commits to `<link rel="alternate" hreflang>` emission and explicitly defers per-locale sitemap to Phase 2.

### External References

- Next.js App Router Metadata API: `frontend/node_modules/next/dist/docs/` (preferred over web — this version has breaking changes)
- `schema.org/Course`, `schema.org/Event`, `schema.org/Article`, `schema.org/Person` for JSON-LD type vocabulary

---

## Key Technical Decisions

- **`metadataBase` in root layout**: `new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')`. All relative URL strings in `alternates.canonical` and `openGraph.images` are resolved by Next.js against this base — no manual URL construction in the helper.
- **Single `buildMetadata` utility**: `seo-utils.ts` accepts entity `seo`, site-setting defaults, and page context (path, locale, fallback title/description). Returns a `Metadata` object. No page file duplicates merge logic.
- **Site-setting fetch is cached per render**: `getSiteSettings()` uses `force-cache` with `tags: ['site-settings']`. Multiple callers within the same render pass hit the cache — one HTTP round-trip total.
- **JSON-LD via `<script>` in JSX, not via `generateMetadata`**: The Next.js metadata API has no JSON-LD surface. Each detail page renders `<script type="application/ld+json">` server-side, injecting JSON built from existing entity fields. No new Strapi fields required.
- **hreflang static-only in Phase 1**: Static listing/informational pages emit `alternates.languages` for both TR and EN using known path pairs. Detail pages omit the EN alternate in Phase 1 — pointing an EN alternate at a TR-language page is worse than none.
- **OG image resolution**: `getStrapiMediaFormat(seo.ogImage, "large")` returns `{ url, width?, height? } | null`, not a plain string. Pass `{ url: format.url, width: format.width, height: format.height }` into `openGraph.images` so Next.js emits `og:image:width` / `og:image:height` alongside the URL. `metadataBase` resolves the relative `url` to absolute.
- **noIndex unconditional for stateful pages**: `/iletisim` and `/etkinlikler/[slug]/kayit` get `robots: { index: false, follow: false }` hardcoded in `generateMetadata` regardless of the CMS `noIndex` field.

---

## Open Questions

### Resolved During Planning

- **Should `buildMetadata` fetch site-settings itself or receive them as a parameter?** Resolved: receives as a parameter. Each page's `generateMetadata` calls `getSiteSettings()` directly, keeping the utility pure and independently testable without Strapi mock setup.
- **Where does `NEXT_PUBLIC_SITE_URL` get defined for Docker deploy?** Resolved: `.env.example` documents it; `docker-compose.deploy.yml` and any `.env.production` pass it as a build arg / runtime env var.
- **Is `alternateLinks` in next-intl routing config needed?** Resolved: No — next-intl middleware's automatic `alternateLinks` covers static paths. For metadata-level hreflang (the more precise approach), we use `alternates.languages` in `generateMetadata` directly. The two approaches overlap; the metadata approach is preferred for per-page control.

### Deferred to Implementation

- **Exact `Metadata` API shape for Next.js 16.2.x**: Read `node_modules/next/dist/docs/` before writing any `generateMetadata` — the `alternates`, `openGraph`, and `robots` field shapes may differ from earlier versions.
- **Whether `robots.ts` in `frontend/src/app/` (not under `[locale]/`) is the correct file location**: Verify against local Next.js docs — robots and sitemap files should be at the app root, not under locale segments.

---

## Implementation Units

### U1. Environment config and `metadataBase`

**Goal:** Introduce `NEXT_PUBLIC_SITE_URL` and wire `metadataBase` into the root layout so all relative URL strings in metadata resolve to correct absolute URLs.

**Requirements:** R3, R4 (OG image URLs), R5 (canonical hrefs)

**Dependencies:** None

**Files:**
- Modify: `frontend/src/app/[locale]/layout.tsx`
- Modify: `.env.example`
- Modify: `docker-compose.deploy.yml` (add `NEXT_PUBLIC_SITE_URL` build arg / env entry)

**Approach:**
- Add `NEXT_PUBLIC_SITE_URL` to `.env.example` with placeholder value `https://netasacademy.com`.
- Update `docker-compose.deploy.yml` to pass `NEXT_PUBLIC_SITE_URL` as a runtime env var.
- In root layout `generateMetadata`, add `metadataBase` using `process.env.NEXT_PUBLIC_SITE_URL` with `http://localhost:3000` fallback.
- The root layout `generateMetadata` also needs to accept `params` to read `locale` and pass it to `getTranslations` — this is a prerequisite for locale-aware metadata in subsequent units.

**Patterns to follow:**
- `frontend/src/app/[locale]/egitimler/[slug]/page.tsx:45` — how params are typed and awaited in `generateMetadata`

**Test scenarios:**
- Test expectation: none — this is pure configuration scaffolding with no independently testable logic. Coverage arrives via the utility unit (U3) which depends on `metadataBase` being present.

**Verification:**
- Root layout `generateMetadata` exports `metadataBase`.
- `NEXT_PUBLIC_SITE_URL` is documented in `.env.example`.
- `npm run build:frontend` passes with no metadata-related warnings.

---

### U2. Site-setting fetch helper

**Goal:** Create `getSiteSettings()` so page-level `generateMetadata` functions can access global SEO defaults (default title, description, OG image) from the Strapi `site-setting` singleton.

**Requirements:** R1, R4

**Dependencies:** None (can land independently of U1)

**Files:**
- Create: `frontend/src/lib/strapi-site-settings.ts`

**Approach:**
- Follow the pattern of `frontend/src/lib/strapi-courses.ts`: call `fetchStrapi`, populate the full `StrapiSiteSetting` fields including `defaultOgImage` sub-fields, and use `force-cache` with `tags: ['site-settings']`.
- Return type: `StrapiSiteSetting | null`.
- The Strapi endpoint for a single type is `/api/site-setting` (not pluralised); confirm against the Strapi schema file.

**Patterns to follow:**
- `frontend/src/lib/strapi-courses.ts` — `fetchStrapi` call shape, populate syntax, cache config
- `frontend/src/lib/strapi-types.ts:154` — `StrapiSiteSetting` type

**Test scenarios:**
- Happy path: `getSiteSettings()` returns an object with `siteName`, `defaultMetaTitle`, `defaultMetaDescription`, and populated `defaultOgImage`.
- Edge case: Strapi `site-setting` not yet populated — `getSiteSettings()` returns `null` without throwing.

**Verification:**
- `getSiteSettings()` is callable and returns `StrapiSiteSetting | null`.
- TypeScript compilation passes with no type errors.
- The `StrapiSiteSetting` type from `strapi-types.ts` is used as the return type without any casting.

---

### U3. SEO metadata utility (`buildMetadata`)

**Goal:** Implement the single merge function that converts entity SEO + site-setting defaults + page context into a Next.js `Metadata` object, with no duplication across page files.

**Requirements:** R1, R2, R3, R4, R5

**Dependencies:** U1 (metadataBase must exist for canonical resolution), U2 (`StrapiSiteSetting` shape)

**Files:**
- Create: `frontend/src/lib/seo-utils.ts`
- Create: `frontend/src/__tests__/seo-utils.test.mjs`

**Approach:**
- `buildMetadata` accepts: `seo: StrapiSeo | null | undefined`, `defaults: StrapiSiteSetting | null`, `fallbackTitle: string`, `fallbackDescription: string | null | undefined`, `pagePath: string` (locale-prefixed, e.g., `/egitimler/kurs-adi`), `locale: string`.
- Returns `Metadata` (Next.js type).
- Merge priority for title: `seo.metaTitle` → `fallbackTitle` → `defaults.defaultMetaTitle`.
- Merge priority for description: `seo.metaDescription` → `fallbackDescription` → `defaults.defaultMetaDescription`.
- Canonical: `seo.canonicalPath` (if set) → `pagePath`. Always a string (metadataBase resolves to absolute).
- robots: when `seo.noIndex` is truthy → `{ index: false, follow: false }`.
- `openGraph.title`: `seo.ogTitle` → title (computed above).
- `openGraph.description`: `seo.ogDescription` → description (computed above).
- `openGraph.images`: from `getStrapiMediaFormat(seo.ogImage, "large")` or `getStrapiMediaFormat(defaults.defaultOgImage, "large")`, with `alt` from `seo.ogImageAlt` or `defaults.defaultOgImageAlt`. Pass `{ url: format.url, width: format.width, height: format.height }` — the `url` is relative; Next.js + `metadataBase` handles absolute resolution.
- `alternates.languages` for static pages: caller passes an optional `localeAlternates` map (`{ tr: string, en: string }`); the helper includes it when present.

**Patterns to follow:**
- `frontend/src/lib/strapi-media.ts` — `getStrapiMediaFormat()` for OG image resolution

**Test scenarios:**
- Happy path — entity with full `seo` object: all returned `Metadata` fields populated from `seo.*` values; `fallbackTitle` is not used.
- Happy path — entity with `seo: null`: title and description fall back to `fallbackTitle` / `fallbackDescription`; OG image falls back to `defaults.defaultOgImage`.
- Happy path — both `seo` and `defaults` are null: only `fallbackTitle` and `fallbackDescription` are returned; no OG images array.
- Edge case — `seo.metaTitle` set but `seo.ogTitle` absent: `openGraph.title` falls back to the computed title (which is `seo.metaTitle`).
- Edge case — `seo.noIndex: true`: returned `robots` is `{ index: false, follow: false }`.
- Edge case — `seo.noIndex: false` (explicit false): returned `robots` is `undefined` (not set at all).
- Edge case — `seo.canonicalPath` set to `/tr/egitimler/kurs-adi`: `alternates.canonical` is `/tr/egitimler/kurs-adi` (relative; metadataBase resolves it).
- Edge case — `seo.canonicalPath` absent: `alternates.canonical` equals the `pagePath` argument.
- Edge case — `localeAlternates` provided: `alternates.languages` contains the TR and EN keys.
- Edge case — `localeAlternates` not provided: `alternates.languages` is absent from returned object.

**Verification:**
- Unit tests pass with `node --test`.
- TypeScript compilation passes: `buildMetadata` returns a valid `Metadata` type.
- No `getStrapiMediaUrl` usages — only `getStrapiMediaFormat` (for width/height dimensions alongside the URL).

---

### U4. Detail page `generateMetadata` wiring

**Goal:** Replace the four detail pages' hand-rolled metadata with `buildMetadata` calls, and fix locale consistency in blog post and teacher detail pages.

**Requirements:** R1, R2, R3, R4, R5, R8

**Dependencies:** U3

**Files:**
- Modify: `frontend/src/app/[locale]/egitimler/[slug]/page.tsx`
- Modify: `frontend/src/app/[locale]/etkinlikler/[slug]/page.tsx`
- Modify: `frontend/src/app/[locale]/blog-yazilari/[slug]/page.tsx`
- Modify: `frontend/src/app/[locale]/egitmenler/[slug]/page.tsx`

**Approach:**
- In each page's `generateMetadata`, call `getSiteSettings()` in parallel with the entity fetch (both are cached; concurrent is fine).
- Call `buildMetadata` with the entity's `seo` field, the site-setting result, entity fallback values, and the locale-prefixed path.
- For `not_found` returns: continue returning just `{ title: t("meta.not_found") }` — no `buildMetadata` needed for 404 paths.
- Blog post detail and teacher detail: add `locale` to the destructured `params` in `generateMetadata`, and pass it to `getTranslations`. Replace hardcoded Turkish not-found strings with `t("meta.not_found")` — add these keys to `tr.json` and `en.json` if they are missing.
- `pagePath` value for each page: `/[locale]/egitimler/[slug]`, etc. — construct from `locale` and `slug` params.
- Phase 1 scope for `localeAlternates`: omit the argument entirely on detail pages (deferred to Phase 2).

**Patterns to follow:**
- Existing course detail `generateMetadata` at `frontend/src/app/[locale]/egitimler/[slug]/page.tsx:45` — best current pattern for params, locale, getTranslations
- `buildMetadata` interface from U3

**Test scenarios:**
- Integration — course detail with `seo.metaTitle` set: `generateMetadata` returns that title, not `course.title`.
- Integration — event detail with `seo: null`: title falls back to `event.title`.
- Integration — blog post detail: `locale` is destructured and passed to `getTranslations` (not hardcoded Turkish).
- Integration — teacher detail: same locale consistency check.
- Integration — course with `seo.noIndex: true`: robots metadata is `{ index: false, follow: false }`.
- Integration — course with a populated `seo.ogImage`: `openGraph.images` contains an entry with a relative URL path and dimensions.

**Verification:**
- All four detail pages compile with no TypeScript errors.
- `npm run lint` passes on modified files.
- Manual browser check: view-source on a detail page shows `<meta property="og:title">` and `<link rel="canonical">` in the `<head>`.

---

### U5. Listing and static page `generateMetadata`

**Goal:** Add `generateMetadata` to the five listing pages and the informational pages that lack it; apply unconditional noindex to `/iletisim` and `/etkinlikler/[slug]/kayit`.

**Requirements:** R1, R2, R5, R8

**Dependencies:** U3

**Files:**
- Modify: `frontend/src/app/[locale]/egitimler/page.tsx`
- Modify: `frontend/src/app/[locale]/etkinlikler/page.tsx`
- Modify: `frontend/src/app/[locale]/blog-yazilari/page.tsx`
- Modify: `frontend/src/app/[locale]/egitmenler/page.tsx`
- Modify: `frontend/src/app/[locale]/haberler/page.tsx`
- Modify: `frontend/src/app/[locale]/iletisim/page.tsx`
- Modify: `frontend/src/app/[locale]/etkinlikler/[slug]/kayit/page.tsx`
- Modify: `frontend/src/messages/tr.json`
- Modify: `frontend/src/messages/en.json`

**Approach:**
- Listing pages (egitimler, etkinlikler, blog-yazilari, egitmenler, haberler): add `generateMetadata({ params })`, destructure `locale`, call `getSiteSettings()`, fetch translations for the page namespace, and call `buildMetadata` with static i18n title/description as the fallback values (not entity data). Pass `localeAlternates` for both TR and EN paths. Since next-intl uses no custom `pathnames` config, EN paths are same-slug with the locale prefix (e.g., `{ tr: '/egitimler', en: '/en/egitimler' }`).
- `/iletisim` and `/etkinlikler/[slug]/kayit`: add `generateMetadata` that returns `robots: { index: false, follow: false }` unconditionally plus a descriptive title. Do NOT call `buildMetadata` — the noindex is structural, not CMS-driven.
- Add missing translation keys to `tr.json` and `en.json` for pages that lack `meta.title` / `meta.description` keys (haberler, iletisim confirmed missing from research).
- EN URL paths follow the next-intl default: same Turkish slug with `/en/` prefix. No custom `pathnames` config exists in `frontend/src/i18n/routing.ts`.

**Patterns to follow:**
- `frontend/src/app/[locale]/cozum-ortagi/page.tsx` — existing listing-page `generateMetadata` using i18n strings

**Test scenarios:**
- Happy path — egitimler listing `generateMetadata` returns a title drawn from the `egitimler.meta.title` i18n key.
- Happy path — `localeAlternates` is present in returned Metadata for listing pages.
- Edge case — iletisim `generateMetadata` returns `robots: { index: false, follow: false }` regardless of any CMS configuration.
- Edge case — kayit page returns noindex robots metadata.
- Edge case — locale is `en`: listing page title is the English translation, not Turkish.

**Verification:**
- All modified listing pages compile with no TypeScript errors.
- `npm run lint` passes.
- View-source on `/egitimler` shows `<meta name="robots">` absent (indexable) and `<link rel="alternate" hreflang="tr">` present.
- View-source on `/iletisim` shows `<meta name="robots" content="noindex,nofollow">`.

---

### U6. JSON-LD structured data on detail pages

**Goal:** Inject `<script type="application/ld+json">` into each content detail page's rendered HTML with schema.org-compliant structured data.

**Requirements:** R6

**Dependencies:** U4 (detail pages already wire entity data; JSON-LD builds on the same entity objects)

**Files:**
- Create: `frontend/src/components/seo/json-ld.tsx`
- Modify: `frontend/src/app/[locale]/egitimler/[slug]/page.tsx`
- Modify: `frontend/src/app/[locale]/etkinlikler/[slug]/page.tsx`
- Modify: `frontend/src/app/[locale]/blog-yazilari/[slug]/page.tsx`
- Modify: `frontend/src/app/[locale]/egitmenler/[slug]/page.tsx`

**Approach:**
- Create a `JsonLd` server component in `frontend/src/components/seo/json-ld.tsx` that accepts a plain object and renders `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />`. Mark as a server component (no `"use client"`).
- In each detail page component (not `generateMetadata`), construct the JSON-LD object from existing entity data and render `<JsonLd data={...} />` inside the page's JSX, ideally near the top of the returned fragment.
- Schema types per page:
  - Course: `@type: "Course"` — `name`, `description`, `provider` (org name from site-setting `siteName`)
  - Event: `@type: "Event"` — `name`, `description`, `startDate`, `endDate` (from `event.startDate` / `event.endDate`)
  - Blog post: `@type: "Article"` — `headline`, `description`, `datePublished`, `author` (from `post.author.fullName` if available)
  - Teacher: `@type: "Person"` — `name`, `jobTitle`, `description` (from `teacher.headline`)
- Construct the `@context: "https://schema.org"` field in the object.
- Do NOT call `getStrapiMediaUrl` inside the JSON-LD — the script content is not affected by `metadataBase` and needs absolute image URLs. Use `toStrapiAssetUrl` + manual base URL prepend (`process.env.NEXT_PUBLIC_SITE_URL`) for any image URLs in JSON-LD.

**Patterns to follow:**
- The `dangerouslySetInnerHTML` pattern is safe here because `JSON.stringify` on a plain object does not produce executable code — no user input flows into the JSON-LD object unescaped.
- `frontend/src/lib/strapi-media.ts:toStrapiAssetUrl` for image path normalisation

**Test scenarios:**
- Happy path — `<JsonLd data={{ "@context": "https://schema.org", "@type": "Course", "name": "Test" }} />` renders a `<script>` tag with the serialised JSON in the DOM.
- Edge case — data object contains no `image` key: script renders without an `image` field (no undefined/null leak).
- Integration — view-source on a course detail page shows a `<script type="application/ld+json">` tag with `"@type": "Course"` in the `<body>`.
- Integration — view-source on an event detail page shows `"@type": "Event"` with a parseable `startDate`.

**Verification:**
- `JsonLd` component renders without React hydration warnings (server component, no client boundary).
- Google's Rich Results Test accepts the emitted JSON-LD (manual spot-check, post-deploy).
- `npm run lint` passes on all modified files.

---

### U7. `robots.ts` App Router file

**Goal:** Serve a `robots.txt` response that disallows `/api/` and allows all other paths.

**Requirements:** R7

**Dependencies:** None (fully independent)

**Files:**
- Create: `frontend/src/app/robots.ts`

**Approach:**
- Use the Next.js `MetadataRoute.Robots` return type.
- Disallow `/api/` for all user agents.
- Set `sitemap` field to the site's `/sitemap.xml` URL using `NEXT_PUBLIC_SITE_URL` (even though the sitemap file does not exist yet — robots.txt pointing to a not-yet-present sitemap is harmless; sitemap generation is deferred to a follow-up PR).
- Verify the exact file location (`frontend/src/app/robots.ts`, not under `[locale]/`) against local Next.js docs before implementing.

**Patterns to follow:**
- Next.js App Router special files convention — read `node_modules/next/dist/docs/` for the `robots.ts` API shape in 16.2.x

**Test scenarios:**
- Happy path — `GET /robots.txt` returns `User-agent: *` with `Disallow: /api/`.
- Happy path — response includes `Sitemap:` directive pointing to the configured site URL.
- Edge case — `NEXT_PUBLIC_SITE_URL` unset: sitemap URL gracefully falls back to `http://localhost:3000/sitemap.xml` (no runtime crash).

**Verification:**
- `curl http://localhost:3000/robots.txt` returns a valid robots.txt response.
- The response contains `Disallow: /api/`.
- `npm run build:frontend` produces no errors related to the robots route.

---

## System-Wide Impact

- **Interaction graph:** All `generateMetadata` functions now call `getSiteSettings()` — a new Strapi endpoint hit on every page render (cached). If the `site-setting` singleton is unpopulated in Strapi, the fetch returns null; helper must handle null gracefully.
- **Error propagation:** `getSiteSettings()` failure must not crash page rendering. The helper should return null (or swallow fetch errors), and `buildMetadata` must not throw when `defaults` is null.
- **State lifecycle risks:** `force-cache` on site-settings means stale SEO defaults until a cache tag revalidation fires. This is acceptable — site-setting changes are editorial, not time-critical.
- **Unchanged invariants:** All existing page JSX and data-fetch logic for content rendering is untouched; only `generateMetadata` and JSON-LD script injection are added to page files.
- **API surface parity:** The Strapi `site-setting` public read permission is already bootstrapped in `backend/src/index.ts:14` (`api::site-setting.site-setting.find`). No backend change needed for U2.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Next.js 16.2.x `Metadata` API shape differs from training data | Read `node_modules/next/dist/docs/` before any implementation; type-check against the imported `Metadata` type |
| ~~`site-setting` public read permission not bootstrapped~~ | Already present at `backend/src/index.ts:14` — no action needed |
| `metadataBase` absent at build time (env var not set in CI/CD) | Add `NEXT_PUBLIC_SITE_URL` to GitHub Actions workflow env and document in `.github/README.md` |
| JSON-LD `dangerouslySetInnerHTML` triggers lint warnings | The value is always `JSON.stringify` of a plain object — no user input. Add an inline comment noting this. |
| EN URL path derivation for `localeAlternates` | Confirmed: next-intl uses no custom `pathnames`, so EN paths are `/en/<same-slug>`. No cross-check needed. |

---

## Sources & References

- Related code: `frontend/src/lib/strapi-types.ts:143` (`StrapiSeo`), `frontend/src/lib/strapi-types.ts:154` (`StrapiSiteSetting`)
- Related code: `frontend/src/lib/strapi-media.ts` (`toStrapiAssetUrl`, `getStrapiMediaFormat`)
- Related code: `frontend/src/app/[locale]/egitimler/[slug]/page.tsx:45` (reference `generateMetadata`)
- Related plans: `docs/plans/2026-05-08-002-feat-i18n-phase-1-routing-ui-strings-plan.md` (EN URL paths)
- Related brainstorm: `docs/brainstorms/i18n-requirements.md` (hreflang commitment + sitemap deferral)
- Backend schema: `backend/src/components/shared/seo.json`, `backend/src/api/site-setting/content-types/site-setting/schema.json`
- Next.js docs: `frontend/node_modules/next/dist/docs/` (authoritative for 16.2.x)
