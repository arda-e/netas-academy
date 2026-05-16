---
title: "fix: Full-Stack Performance Improvements"
type: fix
status: active
date: 2026-05-15
---

# fix: Full-Stack Performance Improvements

## Summary

This plan addresses a cluster of compounding performance inefficiencies discovered through codebase audit and cross-referenced against the Wave 4 inventory (`docs/plans/2026-05-03-001-refactor-wave4-parallel-delegation-inventory.md`) and the SEO implementation plan (`docs/plans/2026-05-11-002-feat-frontend-seo-implementation-plan.md`). The fixes span four layers: request deduplication in the data fetch layer, removal of erroneous dynamic rendering directives, reduction of Strapi query payload sizes, and elimination of a sequential waterfall on the event detail page. Together these convert several SSR-on-every-request pages to static or ISR, reduce per-page Strapi RTTs from 2 to 1 for all detail pages, and cut wasted data from home and list queries.

---

## Problem Frame

Pages that could be statically rendered are instead re-rendered on every request due to three independent causes: the `draftMode()` Dynamic API being awaited unconditionally inside `fetchStrapi`, incorrect `force-dynamic` directives on pages with no dynamic data, and the absence of `generateStaticParams` on all detail pages. Simultaneously, several Strapi helpers over-fetch fields that are never consumed, one helper fetches 100 records to display 3, and the event detail page waterfalls two sequential Strapi calls. These issues multiply: a visitor to a course detail page currently triggers two identical Strapi fetches (one from `generateMetadata`, one from the page body), both SSR-penalised by the `draftMode()` call, on a page that hasn't changed since the last Strapi publish.

---

## Requirements

- R1. Each Strapi fetch helper is called at most once per request per unique argument set, with identical calls within a render pass deduplicated via `React.cache()`.
- R2. The `draftMode()` Dynamic API is not called unconditionally on every Strapi fetch; it is isolated so that pages with no preview use case can render statically.
- R3. `/kvkk`, `/haberler`, and `/cozum-ortagi` do not export `force-dynamic` and are served as static or ISR pages.
- R5. Course and teacher detail pages export `generateStaticParams` and are pre-rendered at build time with tag-based ISR revalidation.
- R6. `getLatestCourses` does not populate SEO fields; fields sent match what the homepage carousel actually renders.
- R8. Blog detail pages use a targeted `getRelatedBlogPosts(excludeSlug, limit)` query instead of fetching all 100 posts and slicing.
- R9. Blog image queries populate `formats`, `width`, and `height` alongside `url` and `alternativeText` so `<Image>` receives dimension hints.
- R10. The event detail page does not block the page shell on a sequential `getEventRegistrationStatus` fetch; the registration CTA state resolves client-side after the static shell is delivered.
- R11. `HomeContactCTASection` does not mark its background image (`hero-blog.webp`) `priority`; only the single LCP hero image carries `priority`.
- R12. A bundle analyser is configured under `ANALYZE=true` to support ongoing performance auditing.

*(R4 and R7 removed: verified during research that both `getBlogPostBySlug` and `getLatestCourses` already use `next: { tags: [...] }` ISR — no-store claims from the Wave 4 audit were stale. `getEvents` server-side `eventType` filtering is also already implemented.)*

---

## Scope Boundaries

- Server-side image processing or CDN configuration for Strapi uploads are out of scope; image optimisation here is limited to `<Image>` props and populate field corrections.
- Icon library consolidation (`lucide-react` → `@phosphor-icons/react` or vice versa) is a housekeeping task; deferred.
- `NextIntlClientProvider` message scoping (reducing bundle by namespace) requires `next-intl` v4 namespace filtering API verification; deferred.
- Splitting `HomeHeroSection` into a server shell + thin client carousel is a larger refactor; deferred.
- `isomorphic-dompurify` client-bundle risk auditing is deferred — it requires tracing component tree boundaries across the RSC split.
- Strapi-side database indexing or query plans are out of scope for this plan.
- Compressing `hero-cozum.webp` (currently 388 KB) is a one-shot asset task; included in U6 as a low-effort win.

### Deferred to Follow-Up Work

- Icon library consolidation: separate housekeeping PR.
- `NextIntlClientProvider` message scoping: dependent on `next-intl` v4 namespace API availability — verify separately.
- `HomeHeroSection` server/client split: separate refactor PR after this plan lands.
- `isomorphic-dompurify` bundle risk: separate audit task.

---

## Context & Research

### Relevant Code and Patterns

- `frontend/src/lib/strapi-client.ts` — `fetchStrapi` core; `draftMode()` await on line 49; cache branching logic lines 60–68.
- `frontend/src/lib/strapi-courses.ts` — `getCourseBySlug`, `getLatestCourses` (uses `next: { tags: [COURSES_TAG] }` — correctly ISR; SEO populate block is the over-fetch to fix), `getCourseSlugs` (ready for `generateStaticParams`).
- `frontend/src/lib/strapi-events.ts` — `getEvents` already passes `eventType` filter to Strapi server-side (confirmed in current code); `getEventBySlug`.
- `frontend/src/lib/strapi-blog.ts` — `getBlogPostBySlug` uses `next: { tags: [BLOG_TAG] }` (correctly ISR — Wave 4 audit's `no-store` claim was stale); `getBlogPosts` fetched for related posts in `blog-yazilari/[slug]/page.tsx`.
- `frontend/src/lib/strapi-teachers.ts` — `getTeacherSlugs` (ready for `generateStaticParams`).
- `frontend/src/app/[locale]/kvkk/page.tsx` — exports `force-dynamic` on line 9; page reads only a local JSON file and `process.env.GIT_COMMIT_SHA`.
- `frontend/src/app/[locale]/haberler/page.tsx` — exports `force-dynamic` on line 7; calls only `getSiteSettings()` with `force-cache`.
- `frontend/src/app/[locale]/cozum-ortagi/page.tsx` — exports `force-dynamic` on line 16; calls only `getSiteSettings()`.
- `frontend/src/app/[locale]/egitimler/[slug]/page.tsx` — calls `getCourseBySlug` twice (lines 54 and 79); no `generateStaticParams`.
- `frontend/src/app/[locale]/etkinlikler/[slug]/page.tsx` — `getEventRegistrationStatus` fetched sequentially after event fetch (line 124, dependent on `event.documentId`). Page is dynamic due to two causes: `draftMode()` in `fetchStrapi` (U2) AND the `no-store` registration status fetch (U5). Both must be fixed for the page shell to become ISR.
- `frontend/src/app/[locale]/etkinlikler/[slug]/kayit/page.tsx` — `export const dynamic = "force-dynamic"` on line 62; registration form gating is security-sensitive and must remain dynamic. The sequential waterfall (event fetch at line 123, registration status at line 130) is real but the `force-dynamic` cannot be removed from this page. Fixing U1 (React.cache) deduplicates the double `getEventBySlug` call: `generateMetadata` function (line 68) + page component body (line 123) are separate function definitions in the same file.
- `frontend/src/app/[locale]/blog-yazilari/[slug]/page.tsx` — calls `getBlogPosts()` (100 items) to extract 3 related posts (lines 93–105).
- `frontend/src/components/home/HomeContactCTASection.tsx` — imports `hero-blog.webp` (line 3) and marks it `priority` on line 31; this image is below the fold and should not be eagerly preloaded. Separate from `hero-cozum.webp` (used in the `/cozum-ortagi` hero), which is the 388 KB asset to compress.
- `frontend/src/components/content/search-field.tsx` — already has `debounceRef` at 300ms (lines 92–99); this finding is not an open item.

### Institutional Learnings

- Wave 4 inventory (`docs/plans/2026-05-03-001-refactor-wave4-parallel-delegation-inventory.md`) pre-audited the `force-dynamic` contradictions, `no-store` inconsistencies, and client-side filter patterns. Use it as a cross-reference checklist.
- SEO plan (`docs/plans/2026-05-11-002-feat-frontend-seo-implementation-plan.md`) established the canonical singleton fetch pattern: `getSiteSettings()` → `force-cache` + `tags: ['site-settings']`. Mirror this for any new globally shared data.
- Bug report PERF-015 confirmed ~300ms filter API response latency, compounded by search debounce. Search debounce is already implemented (300ms debounce in `search-field.tsx`) so this is now a Strapi response time concern, not a frontend issue.
- BUG-005 (resolved): props across RSC boundaries must be serialisable primitives — no inline functions. Relevant if adding client components for the registration status waterfall fix.

### External References

- Next.js App Router caching docs: `node_modules/next/dist/docs/` (repo-local, consult before writing ISR config)
- `React.cache()` deduplication: React 19 built-in; no additional dependency required.

---

## Key Technical Decisions

- **`React.cache()` over a custom memoization layer**: It is the idiomatic App Router solution; deduplicates within a single render pass per-request without persisting across requests. Import from `"react"`.
- **Move `draftMode()` out of `fetchStrapi` core**: Accepting `isDraft?: boolean` as a `FetchStrapiOptions` field is the least-invasive fix. Pages that need preview mode call `draftMode()` themselves and pass the result; pages that don't (the majority) never invoke the Dynamic API. This avoids touching all call sites unnecessarily — the default when `isDraft` is absent is production behaviour (`force-cache`).
- **Tag-based ISR for detail pages rather than pure static**: `revalidate` + `tags` is preferred over pure SSG for editorial content. Use `next: { tags: ['courses'], revalidate: 3600 }` (or per-slug tags) so Strapi can trigger revalidation via on-demand cache invalidation without a full rebuild.
- **`getRelatedBlogPosts` as a new helper, not a parameter to `getBlogPosts`**: Keeps the existing helper's contract stable; avoids a confusing optional-exclude parameter polluting the general-purpose function.
- **Registration status as a client component, not a Suspense boundary**: Moving `getEventRegistrationStatus` to a `useEffect` inside a `RegistrationStatusButton` client component is simpler than a streaming Suspense approach and avoids adding a new route segment. The CTA renders disabled/loading until the client fetch resolves.
- **Do not add `generateStaticParams` to event detail pages**: Events have time-sensitive registration status and a `no-store` dependency; pre-rendering them is misleading. Course and teacher detail pages are the right candidates for SSG because their content changes on author action, not time.

---

## Open Questions

### Resolved During Planning

- **Does `SearchField` already have debounce?** Yes — `debounceRef` at 300ms is already implemented (lines 92–99 of `search-field.tsx`). The Wave 4 inventory finding was stale. No action needed.
- **Should event detail pages get `generateStaticParams`?** No — `getEventRegistrationStatus` uses `no-store` and the CTA state must be fresh per visitor. Covered by R10 (client-side registration status) instead.
- **Which icon library to standardise on?** Decision deferred; both are tree-shakeable and the bundle impact is minimal at current usage.

### Deferred to Implementation

- **Exact ISR `revalidate` interval for course and teacher pages**: Depends on editorial publishing cadence. Start with `revalidate: 3600` (1 hour); tune after measuring cache hit rates.
- **Whether to use per-slug cache tags or a single `'courses'` tag**: Per-slug tags allow surgical invalidation but require Strapi webhook integration. Single tag is simpler and safe for initial shipping. Revisit when Strapi webhook integration is added.
- **`draftMode()` call sites that must remain dynamic**: Implementer should audit whether any page explicitly requires preview mode (Strapi draft status toggle in admin). If yes, ensure those pages retain the `isDraft` path. If no page uses it yet, `isDraft` defaults to `false` everywhere with no behavioural change.

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
Request lifecycle — before and after this plan:

BEFORE (course detail page, current):
  GET /egitimler/[slug]
    → await draftMode()          ← Dynamic API: forces SSR
    → fetchStrapi (generateMetadata)  ← RTT 1
    → fetchStrapi (page body)         ← RTT 2 (duplicate, no cache())
    → fetchStrapi (siteSettings)      ← RTT 3
    Total: 3 Strapi RTTs, full SSR on every request

AFTER (course detail page, target):
  Build time:
    generateStaticParams() → getCourseSlugs() → pre-renders all slugs as static HTML
  
  GET /egitimler/[slug] (first request after build or revalidate):
    → fetchStrapi (cached, tag-based ISR)  ← RTT 1 (shared via React.cache())
    → generateMetadata uses cached result  ← 0 RTTs
    → page body uses cached result         ← 0 RTTs
    Total: 1 Strapi RTT → cached as static HTML for subsequent requests

Event detail page — registration status deferral:
  Static shell (course title, description, schedule) → served from ISR cache
  RegistrationStatusButton client component → mounts → useEffect → fetch /api/events/:documentId/registration-status
  CTA shows skeleton → resolves → enabled or disabled
```

---

## Implementation Units

### U1. Request Deduplication via `React.cache()`

**Goal:** Eliminate duplicate Strapi fetches when the same helper is called from both `generateMetadata` and the page body in the same request.

**Requirements:** R1

**Dependencies:** None

**Files:**
- Modify: `frontend/src/lib/strapi-courses.ts`
- Modify: `frontend/src/lib/strapi-events.ts`
- Modify: `frontend/src/lib/strapi-teachers.ts`
- Modify: `frontend/src/lib/strapi-blog.ts`
- Modify: `frontend/src/lib/strapi-site-settings.ts`

**Approach:**
- Import `cache` from `"react"` in each file.
- Wrap the following helpers with `cache()`: `getCourseBySlug`, `getEventBySlug`, `getTeacherBySlug`, `getBlogPostBySlug`, `getSiteSettings`.
- Leave list helpers (`getCourses`, `getEvents`, etc.) unwrapped — they are called once per page, not from both `generateMetadata` and the page body.
- `React.cache()` deduplicates per unique argument set within one render pass; it does not persist across requests. No cache invalidation concerns.

**Patterns to follow:**
- `frontend/src/lib/strapi-courses.ts` — existing helper export shape; wrap the function, preserve the export name.

**Test scenarios:**
- Happy path: In a test that simulates `generateMetadata` calling `getCourseBySlug("test-slug")` and the page body calling `getCourseBySlug("test-slug")` in the same render scope, only one `fetchStrapi` call should be made (verify via mock/spy on `fetchStrapi` or on `fetch`).
- Edge case: Two different slugs called in the same pass — both should result in separate fetches.
- Edge case: Calling `getSiteSettings()` three times in the same render pass results in one fetch.

**Verification:**
- `generateMetadata` and the page component for `egitimler/[slug]` share one Strapi RTT — confirm via `fetch` spy in a test or via Strapi access logs during manual test.
- `npm run lint && npm run build:frontend` passes.

---

### U2. Fix `draftMode()` Dynamic API Pollution and Caching Directives

**Goal:** Stop `draftMode()` from forcing every page into dynamic rendering; remove incorrect `force-dynamic` from three static pages.

**Requirements:** R2, R3

**Dependencies:** None (U3 depends on this unit)

**Files:**
- Modify: `frontend/src/lib/strapi-client.ts`
- Modify: `frontend/src/lib/strapi-types.ts` (add `isDraft?: boolean` to `FetchStrapiOptions` if not present)
- Modify: `frontend/src/app/[locale]/kvkk/page.tsx` (remove `force-dynamic`)
- Modify: `frontend/src/app/[locale]/haberler/page.tsx` (remove `force-dynamic`)
- Modify: `frontend/src/app/[locale]/cozum-ortagi/page.tsx` (remove `force-dynamic`, add ISR)

**Approach:**
- In `strapi-client.ts`: remove the `await draftMode()` call from inside `fetchStrapi` (line 49). Add `isDraft?: boolean` to `FetchStrapiOptions`. Update the cache branching logic (lines 60–68) to use `options.isDraft` instead of the locally awaited value. Update the `strapi-encode-source-maps` header (line 71) and `status=draft` query param logic similarly. **Important:** when `isDraft` is absent or false, the `strapi-encode-source-maps` header must default to `"false"` explicitly — do not leave it unset.
- `kvkk/page.tsx` line 9: delete `export const dynamic = "force-dynamic"`. Note: `process.env.GIT_COMMIT_SHA` will be frozen at build time rather than injected per-request — this is the correct and desired behaviour (it identifies the deployed build). No other page impact.
- `haberler/page.tsx` line 7: delete `export const dynamic = "force-dynamic"`. Only `generateMetadata` calls `getSiteSettings()`; the page component itself makes no Strapi fetch.
- `cozum-ortagi/page.tsx` line 16: delete `export const dynamic = "force-dynamic"`. Replace with `export const revalidate = 3600` as a conservative ISR interval so updates propagate without a full rebuild.
- **No existing call sites need updating** for the `draftMode()` refactor — `isDraft` defaults to `undefined`/`false` so existing helpers continue to work. Only add `isDraft: true` explicitly if/when Strapi admin preview is actively wired up. **Before shipping:** audit whether any page currently relies on Strapi draft preview via the admin URL; if yes, add `isDraft: true` at that call site first.

**Patterns to follow:**
- `FetchStrapiOptions` type in `frontend/src/lib/strapi-types.ts` — add `isDraft` alongside `cache`, `next`, `headers`, `retries`, `timeout`.
- Existing `force-cache` + `tags` pattern in `getSiteSettings` (`strapi-site-settings.ts`) — mirror this shape for any new `isDraft`-aware callers.

**Test scenarios:**
- Happy path: After removing `force-dynamic` from `/kvkk`, build output lists `/kvkk` as static (`○`), not dynamic (`λ`).
- Happy path: `fetchStrapi` called without `isDraft` option behaves identically to current production behaviour — uses `force-cache`; `strapi-encode-source-maps` header is `"false"`.
- Happy path: `fetchStrapi` called with `isDraft: true` sets `cache: "no-store"`, appends `status=draft` to the Strapi URL, and sets `strapi-encode-source-maps: "true"`.
- Happy path: `fetchStrapi` called with `options.next` set and `isDraft` absent — `fetchOptions.cache` is left unset (ISR path), `strapi-encode-source-maps` defaults to `"false"` — same as current behaviour before the refactor.
- Edge case: `haberler` and `cozum-ortagi` appear as static (`○`) or ISR (`◐`) in build output, not dynamic.
- Edge case: `kvkk` page displays the `GIT_COMMIT_SHA` value that was current at build time — this is the expected and correct behaviour after removing `force-dynamic`.

**Verification:**
- `npm run build:frontend` output shows `/kvkk` and `/haberler` as static pages.
- `cozum-ortagi` shows as ISR (revalidate interval shown).
- No TypeScript errors in `strapi-client.ts` or `strapi-types.ts`.

---

### U3. `generateStaticParams` for Content-Stable Detail Pages

**Goal:** Pre-render course and teacher detail pages as static HTML at build time, served from CDN/edge cache for subsequent requests with ISR revalidation.

**Requirements:** R5

**Dependencies:** U2 (must remove `draftMode()` from `fetchStrapi` first so static pre-render is not blocked by Dynamic API)

**Files:**
- Modify: `frontend/src/app/[locale]/egitimler/[slug]/page.tsx`
- Modify: `frontend/src/app/[locale]/egitmenler/[slug]/page.tsx`

**Approach:**
- Add `export async function generateStaticParams()` to each file. Use the existing `getCourseSlugs()` and `getTeacherSlugs()` helpers respectively.
- **The `[locale]` layout does not export `generateStaticParams`** (confirmed by inspection of `frontend/src/app/[locale]/layout.tsx`). Therefore the return shape must include **both** `locale` and `slug` dimensions — e.g. `[{ locale: "tr", slug: "kurs-adi" }, { locale: "en", slug: "kurs-adi" }]`. Use the supported locales (`["tr", "en"]`) to generate the cross-product. If only slug objects are returned (without locale), only one locale variant is pre-rendered and the other hits SSR.
- Add `export const revalidate = 3600` to both pages so content changes propagate without a full rebuild.
- Remove any `force-dynamic` from these pages if present.
- Do **not** add `generateStaticParams` to event or blog detail pages — events are time-sensitive, blog is lower priority.

**Patterns to follow:**
- `getCourseSlugs()` in `frontend/src/lib/strapi-courses.ts` — returns `{ slug: string }[]`; cross-product with locales to produce the full params array.
- `getTeacherSlugs()` in `frontend/src/lib/strapi-teachers.ts` — same shape.
- Supported locales are `["tr", "en"]` as configured in `next-intl` middleware.

**Test scenarios:**
- Happy path: `npm run build:frontend` output shows all course slugs pre-rendered as static pages (build log lists each slug).
- Happy path: A request for a pre-rendered course slug returns a 200 with `x-nextjs-cache: HIT` header (or equivalent) after first build.
- Edge case: A course slug added after build is not in `generateStaticParams` — Next.js falls back to SSR for unknown slugs; verify the page still renders correctly on first request and is then cached.
- Edge case: Locale combinations (`tr/egitimler/slug`, `en/egitimler/slug`) both pre-render — verify two entries per slug in build output.

**Verification:**
- Build output lists all known course and teacher slugs as static routes (`○` or with pre-render count).
- No TypeScript or lint errors.
- Manual test: navigate to a pre-rendered course detail page; TTFB is measurably lower than SSR baseline (rough target: under 200ms from EC2 → browser vs previous 400–800ms SSR).

---

### U4. Strapi Query Payload Reduction

**Goal:** Remove fields that are fetched but never consumed; replace the over-broad blog related-posts fetch; add missing image dimension fields to blog queries.

**Requirements:** R6, R8, R9

**Dependencies:** None

**Files:**
- Modify: `frontend/src/lib/strapi-courses.ts`
- Modify: `frontend/src/lib/strapi-blog.ts`
- Modify: `frontend/src/app/[locale]/blog-yazilari/[slug]/page.tsx`
- Modify: `frontend/src/lib/strapi-types.ts` (add `BlogPostSummary` type for related posts if needed)

**Approach:**

**`getLatestCourses` — strip SEO populate (R6):**
- The homepage carousel (`HomeFeaturedCoursesSection`) uses: `slug`, `title`, `summary`, `topicArea`, `level`, and `coverImage`.
- Remove the SEO `populate` block (fields: `metaTitle`, `metaDescription`, `canonicalPath`, `noIndex`, `ogImage`) from `getLatestCourses`. These are fetched but not rendered in the carousel.

**`getRelatedBlogPosts` — new targeted helper (R8):**
- Add `getRelatedBlogPosts(excludeSlug: string, limit: number)` to `strapi-blog.ts`. Query: `filters[slug][$ne]=${excludeSlug}&pagination[pageSize]=${limit}`.
- Fields: only what the related-post card renders — `slug`, `title`, `summary`, `publishedAt`, `coverImage` (url, alternativeText, formats thumbnail).
- Update `blog-yazilari/[slug]/page.tsx` to call `getRelatedBlogPosts(slug, 3)` instead of `getBlogPosts()`.

**Blog `coverImage` populate — add dimension fields (R9):**
- In `getBlogPosts` and `getBlogPostBySlug`, the `coverImage` populate currently includes only `url` and `alternativeText`.
- Add `formats`, `width`, `height` to the `coverImage` populate so `<Image>` receives dimension hints and Next.js can generate a correct srcset.
- Update the `StrapiImage` or blog-specific TypeScript types to include the new fields.

**Patterns to follow:**
- Existing `populate` query structure in `strapi-courses.ts` — same field-by-field populate syntax.
- `getStrapiMediaFormat` in `strapi-media.ts` — how format objects are consumed; ensure the new fields flow through.

**Test scenarios:**
- Happy path (`getLatestCourses`): The Strapi request URL for home page does not include any `seo` populate fields — assert via mock or Strapi access log.
- Happy path (`getRelatedBlogPosts`): Returns at most `limit` posts; the returned posts do not include the post matching `excludeSlug`.
- Edge case (`getRelatedBlogPosts`): When fewer than `limit` posts exist (e.g. only 1 total blog post), the helper returns the available posts without error — consuming component handles 0–2 related posts gracefully.
- Happy path (blog image dimensions): `<Image>` in blog list and detail receives `width` and `height` props from the Strapi response; no layout shift observed during manual page load test.
- Edge case (blog image dimensions): When Strapi returns a `coverImage` with no `formats` (e.g. the image has not been processed), the component falls back gracefully — no `undefined` width/height crash.

**Verification:**
- Strapi access logs show smaller response payloads for home page and event list requests.
- Blog detail page's related posts section makes one Strapi request fetching ≤ 3 records rather than 100.
- `npm run lint && npm run build:frontend` passes.

---

### U5. Event Registration Status Waterfall Elimination

**Goal:** Break the sequential Strapi fetch waterfall on the event detail page so the page shell renders from cache while registration status resolves client-side.

**Requirements:** R10

**Dependencies:** None

**Files:**
- Modify: `frontend/src/app/[locale]/etkinlikler/[slug]/page.tsx`
- Modify: `frontend/src/app/[locale]/etkinlikler/[slug]/kayit/page.tsx`
- Create: `frontend/src/components/events/registration-status-button.tsx` (new client component)

**Approach:**
- Currently `etkinlikler/[slug]/page.tsx` awaits `getEventBySlug` + `getSiteSettings()` in a `Promise.all` (lines 114–117), then sequentially awaits `getEventRegistrationStatus(event.documentId)` (line 124). The page is dynamic for two reasons: `draftMode()` in `fetchStrapi` (fixed in U2) and the `no-store` registration status fetch (fixed here). Both U2 and U5 must land for the shell to become ISR.
- Extract registration status display into a new `RegistrationStatusButton` client component:
  - Accepts `documentId: string` as a prop (serialisable — no function props per BUG-005 pattern).
  - On mount (`useEffect`), calls the Strapi registration status endpoint: `/api/events/${documentId}/registration-status` (the actual backend path — not `/api/events/:id/status`). Uses `cache: "no-store"` or a simple `fetch` with no cache options.
  - Renders a skeleton/disabled state until the fetch resolves, then renders the appropriate CTA (open / closed / full). When the fetch returns `null` or an unexpected payload, render a graceful fallback (e.g. link to the contact form) — do not crash or spin indefinitely.
- Remove `getEventRegistrationStatus` from the server-side render path in `page.tsx` only. **`kayit/page.tsx` must retain `export const dynamic = "force-dynamic"` (line 62)** — the registration form gating is security-sensitive and showing the form to a user only to then close/disable it after client hydration would create a UX race condition. `kayit/page.tsx` improvement is limited to U1 (React.cache deduplication of the double `getEventBySlug` call) and is not further changed in this unit.
- After U2 + U5 land, the event detail shell page (`[slug]/page.tsx`) should appear as ISR in the build output.

**Patterns to follow:**
- BUG-005 resolution pattern: client components receive serialisable primitives (`documentId: string`), not functions or complex objects.
- `frontend/src/components/content/search-field.tsx` — client component pattern with `useEffect` and `useRef` for async state.

**Test scenarios:**
- Happy path: Event detail page renders the static shell (title, date, description) without waiting for registration status. Registration CTA transitions from skeleton to "Kayıt Ol" within ~1 second of page load.
- Happy path: When registration is closed (Strapi returns `closed`), CTA renders as disabled with appropriate Turkish text.
- Edge case: When the registration status API call fails (network error, timeout, or 404), the CTA renders a graceful fallback — not an indefinite spinner or blank.
- Edge case: When `getEventRegistrationStatus` returns `null` or an unexpected payload shape (missing `data` field), `RegistrationStatusButton` handles it without crashing — the same null-guard pattern used in `strapi-events.ts` (`data?.data ?? null`) must be mirrored in the client fetch handler.
- Integration: After U2 + U5 both land, `etkinlikler/[slug]` appears as ISR (`◐`) in `npm run build:frontend` output — not dynamic (`λ`).
- Unchanged: `kayit/page.tsx` retains `force-dynamic`; it is not listed as ISR in build output and that is correct.

**Verification:**
- After both U2 and U5 land: `etkinlikler/[slug]` route appears as ISR in `npm run build:frontend` output.
- Network trace in browser DevTools shows the event detail page HTML arriving before the registration status API call completes.
- No TypeScript errors on the new `RegistrationStatusButton` component.
- `kayit/page.tsx` continues to function correctly and retains `force-dynamic`.

---

### U6. Image Asset Optimization and Bundle Tooling

**Goal:** Remove the erroneous `priority` prop from a below-fold image; compress the oversized hero asset; add bundle analyser for ongoing monitoring.

**Requirements:** R11, R12

**Dependencies:** None

**Files:**
- Modify: `frontend/src/components/home/HomeContactCTASection.tsx`
- Modify: `frontend/next.config.ts`
- Asset: `frontend/src/assets/images/hero-cozum.webp` (compress externally, replace in place)

**Approach:**

**`HomeContactCTASection` — remove `priority` from `hero-blog.webp` (R11):**
- Line 31 of `HomeContactCTASection.tsx` marks `hero-blog.webp` (imported on line 3) `priority`. This section appears below the fold on all standard viewports.
- Remove the `priority` prop. The LCP image (the `HomeHeroSection` hero, above the fold) retains its `priority`. These are two separate images; this edit only touches `HomeContactCTASection.tsx`.

**`hero-cozum.webp` — compress source asset (separate image):**
- `hero-cozum.webp` is used in the `/cozum-ortagi` hero component, not in `HomeContactCTASection`. At 388 KB it is ~4× larger than the other hero images. Use `squoosh` (CLI: `npx @squoosh/cli`) or `sharp` to re-encode at ~80 quality target (~80–100 KB), replacing the file in `frontend/src/assets/images/`.
- Next.js optimises at request time, but a smaller source reduces the initial disk read and CPU cost for the image optimisation worker.

**Bundle analyser — add under `ANALYZE=true` (R12):**
- Install `@next/bundle-analyzer` as a `devDependency`.
- Wrap the `next.config.ts` export with the analyser conditionally: `process.env.ANALYZE === "true"`. No change to production builds.
- Add `ANALYZE=true npm run build:frontend` to the project README or `package.json` scripts comment.

**Patterns to follow:**
- `frontend/next.config.ts` existing export shape — wrap, do not replace.
- Other hero images in `frontend/src/assets/images/` for size reference (target ~80–100 KB for WebP heroes).

**Test scenarios:**
- Happy path (`priority` removal): Chrome DevTools LCP trace for the home page shows a single LCP candidate — the hero image — rather than two `priority` images competing for preload bandwidth.
- Happy path (bundle analyser): `ANALYZE=true npm run build:frontend` produces `.next/analyze/client.html` and `server.html` treemap files without errors.
- Edge case (hero compression): The compressed `hero-cozum.webp` renders visibly without quality degradation at 1920px viewport width — eyeball test.
- Test expectation: none for `hero-cozum.webp` asset replacement — visual regression test only.

**Verification:**
- `next.config.ts` TypeScript compiles cleanly with the analyser wrapper.
- `HomeContactCTASection` has no `priority` prop on its `<Image>`.
- `hero-cozum.webp` file size is under 120 KB.
- `npm run lint && npm run build:frontend` passes with no new warnings.

---

## System-Wide Impact

- **Interaction graph:** Removing `draftMode()` from `fetchStrapi` affects every Strapi data fetch in the application. Pages that use Strapi preview mode (if any) must receive `isDraft: true` explicitly from the calling page. No current page is confirmed to use draft preview.
- **Error propagation:** `React.cache()` does not catch errors — a rejected promise inside a cached function propagates as normal. Existing `try/catch` in page components covers this.
- **State lifecycle risks:** Tag-based ISR means stale content serves for up to `revalidate` seconds after a Strapi publish. This is acceptable for training catalog content. Registration status is explicitly excluded from ISR (remains real-time via client fetch).
- **API surface parity:** The `FetchStrapiOptions` type change (`isDraft` field) is additive and backward-compatible. No existing call site breaks.
- **Integration coverage:** The `RegistrationStatusButton` (U5) introduces a new client-side API call pattern — the endpoint is `/api/events/${documentId}/registration-status` (the actual Strapi custom route, not `/api/events/:id/status`). Verify Strapi public permissions cover this endpoint before shipping U5.
- **Unchanged invariants:** `force-cache` behaviour for all other pages (egitimler list, egitmenler list, blog list, etc.) is not changed by this plan. The `getSiteSettings()` singleton pattern remains `force-cache` + tags as established by the SEO plan.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Removing `draftMode()` from `fetchStrapi` silently breaks Strapi admin preview for all routes | Before shipping U2: confirm no page is wired to Strapi draft preview. If any page uses it, add `isDraft: true` at that call site first. No current page is confirmed to use draft preview, but this must be verified — editors relying on preview will always see published content after this change if the call site is missing. |
| `generateStaticParams` for `[locale]/egitimler/[slug]` omits locale dimension | `[locale]/layout.tsx` does not export `generateStaticParams`. The return shape must include both `locale` and `slug`. If slug-only objects are returned, only one locale pre-renders. |
| `getCourseSlugs()` returns `[]` when Strapi is unavailable during build | Build-time Strapi unavailability causes `generateStaticParams` to return an empty array — zero pages are pre-rendered, all requests fall back to SSR. Consider a build-time health check or a fallback slug list for CI robustness. |
| ISR pages serving stale content after Strapi publish | Document `revalidate: 3600` behaviour; add on-demand revalidation webhook as a follow-up. |
| `RegistrationStatusButton` calls wrong endpoint and returns 404 for all users | The endpoint is `/api/events/${documentId}/registration-status` — verify this path in `backend/src/api/` before shipping U5. A wrong path leaves all users in the skeleton/loading state permanently. |
| Compressing `hero-cozum.webp` introduces visible quality degradation | Compress at ≥80 quality; eyeball-test at 1920px width before committing. |

---

## Documentation / Operational Notes

- After U3 ships, the first `npm run build:frontend` will pre-render all course and teacher slugs. Build time will increase proportionally to the number of slugs × Strapi RTTs. For ~50 courses and ~20 teachers this is acceptable (~70 extra requests at ~50ms each ≈ 3.5s added build time).
- The bundle analyser (`@next/bundle-analyzer`) is a dev dependency only; it does not affect the Docker production image.
- `ANALYZE=true npm run build:frontend` should be run after any significant new dependency addition to confirm client bundle size stays healthy.

---

## Sources & References

- Wave 4 parallel delegation inventory: `docs/plans/2026-05-03-001-refactor-wave4-parallel-delegation-inventory.md`
- SEO implementation plan (caching patterns): `docs/plans/2026-05-11-002-feat-frontend-seo-implementation-plan.md`
- Bug report PERF-015 (filter API latency) and BUG-005 (RSC serialisation): `docs/bug-reports/2026-04-30-product-bug-report.md`
- Next.js App Router caching and ISR: `node_modules/next/dist/docs/` (consult before implementing U2/U3)
- `React.cache()` documentation: React 19 built-in, no external link needed
