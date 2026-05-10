# Wave 4 Explorer Inventory

**Date:** 2026-05-03
**Source Plan:** `docs/plans/2026-05-03-001-refactor-wave4-parallel-delegation-plan.md`
**Gate Status:** P3-01 merged on `main` — `strapi.ts` is gone, 7 split domain modules exist.

---

## 1. PR Strategy Stale Paths (26 found)

The `.kilo/audit/PR_STRATEGY.md` references many files that either never existed or have since moved. These stale references should **not** leak into worker prompts — workers must use current paths from this inventory.

| # | Stale Path in PR_STRATEGY.md | Current State |
|---|------------------------------|---------------|
| 1 | `frontend/src/components/content/blog-search.tsx` | Does not exist. Search uses `SearchField` component. |
| 2 | `frontend/src/components/ui/separator.tsx` | Does not exist. |
| 3 | `frontend/src/lib/navigation.ts` | Does not exist (planned new file). |
| 4 | `frontend/src/lib/event-registration.ts` | Does not exist. |
| 5 | `backend/src/services/event-registration.ts` | Does not exist. |
| 6 | `frontend/src/components/content/content-detail-page-shell.tsx` | Actual file is `content-detail-shell.tsx`. |
| 7 | `frontend/src/components/content/content-list-page.tsx` | Does not exist (planned new file). |
| 8 | `frontend/src/components/blog-card.tsx` | Blog cards live in `components/content/blog.tsx`. |
| 9 | `frontend/src/components/course-catalog-list.tsx` | Actual path is `components/courses/course-catalog-list.tsx`. |
| 10 | `frontend/src/lib/strapi.ts` | Already deleted (P3-01 split complete). |
| 11 | `backend/src/plugins/internal-notifications/` | Not yet created (source still in services). |
| 12 | `backend/scripts/seed/` | Not yet created. |
| 13 | `backend/src/api/*/routes/custom.ts` | Config exists but actual custom routes use `custom-*.ts` naming. |
| 14–26 | Various planned new files (loading.tsx, error.tsx, e2e/, .github/workflows, vitest.config.ts, test subdirectories) | Do not yet exist. |

**Wave 4 PR description corrections needed:**
- **P3-02**: File list should be narrowed to frontend `strapi-*.ts` only — backend controller files are not Zod insertion points.
- **P4-01**: Should reference `content-detail-shell.tsx` (existing), not `content-detail-page-shell.tsx`.

---

## 2. U01 Surface Map (P3-02: Zod Runtime Validation)

### Strapi Client (`strapi-client.ts`)
- **Current:** 18 lines. Single `fetchStrapi<T>(path, options?)` function. No runtime validation. Default cache `'no-store'`. Generic `T` used only for `as T` cast.
- **Insertion point:** After `response.json()` before the `as T` cast. Accept optional `schema?: z.ZodType<T>` parameter. If provided, `schema.parse(data)`. If omitted, fall back to current `as T` cast (backward compat).
- **Concern:** All domain modules silently catch errors → `[]`/`null`. Zod parse errors would also be swallowed unless error handling strategy is clarified.

### Domain Modules (all 7 files exist, all functional)
- **`strapi-courses.ts`** (67 lines): 4 functions. `getCourses()`, `getCourseSlugs()`, `getCourseBySlug()`, `getLatestCourses()`. All try/catch → `[]`/`null`.
- **`strapi-events.ts`** (88 lines): 5 functions. CLIENT-SIDE event type filtering in `getEvents()` — fetches ALL then filters in memory.
- **`strapi-blog.ts`** (46 lines): 3 functions. `getBlogPostBySlug` uses `no-store` (inconsistent with other detail functions).
- **`strapi-teachers.ts`** (42 lines): 3 functions. `getTeachers` uses explicit `no-store` (only listing function doing so).
- **`strapi-media.ts`** (70 lines): 3 utility functions. No fetch calls. `getStrapiMediaUrl` handles v4/v5 response shapes. `StrapiMedia` type has `data?: unknown`, `attributes?: unknown` legacy fallbacks.
- **`strapi-types.ts`** (130 lines): 8 plain TypeScript type aliases. No runtime validation. `EventRegistrationStatus` is not a Strapi content type — needs its own schema.

### Conflict Zones: Shared with U02
`strapi-courses.ts`, `strapi-events.ts`, `strapi-blog.ts`, `strapi-teachers.ts` — both U01 and U02 need to edit the same functions. U01 inserts validation logic; U02 changes cache directives on the fetch call.

---

## 3. U02 Surface Map (P3-03: Frontend Caching)

### Route Page Cache Directives

| Page | Directive | Fetch Cache | Issue |
|------|-----------|-------------|-------|
| `/egitimler/page.tsx` | `force-dynamic` | `no-store` (default) | Redundant. Remove `force-dynamic`, add ISR. |
| `/etkinlikler/page.tsx` | `force-dynamic` | `no-store` (default) | Redundant. |
| `/blog-yazilari/page.tsx` | `force-dynamic` | `no-store` (default) | Redundant. |
| `/hakkimizda/page.tsx` | `force-dynamic` | `no-store` (both fetches) | Redundant. `getLatestCourses` should use ISR. |
| `/page.tsx` | None | No Strapi fetches | Already static. No changes. |
| `/egitimler/[slug]/page.tsx` | `force-dynamic` | `force-cache` | **Contradiction**: page overrides fetch. Remove `force-dynamic`. |
| `/etkinlikler/[slug]/page.tsx` | `force-dynamic` | `force-cache` + `no-store`(status) | Same contradiction. Status must stay `no-store`. |
| `/blog-yazilari/[slug]/page.tsx` | `force-dynamic` | `no-store` | Remove `force-dynamic`; align `getBlogPostBySlug` to `force-cache`. |

### Domain Module Cache Inconsistencies
- All listing functions: `no-store` (default from fetchStrapi)
- All slug functions: `force-cache` — consistent
- Except `getBlogPostBySlug`: `no-store` (explicit) — inconsistent, flagged by P3-03
- `getLatestCourses`: no cache option → defaults to `no-store` — P3-03 says it should use `force-cache`

---

## 4. U03 Surface Map (P4-01: Route States & Shells)

### Current Shell Components
- **`content-page-shell.tsx`**: Server component. Hero + breadcrumb + content. No error/loading/suspense boundary.
- **`content-detail-shell.tsx`**: Server component. Breadcrumb + leadMedia slot + prose body. No error/loading.
- **`content-grid.tsx`**: Server component. Empty state handling only (No loading skeleton).
- **`content-card-shell.tsx`**: Server component. Next/image fill + aspect-ratio container. No blur placeholder. No loading skeleton.

### Route State Infrastructure: NONE
- **Zero `loading.tsx` files** anywhere under `app/`
- **Zero `error.tsx` files** anywhere under `app/`
- **Zero `not-found.tsx` files** anywhere under `app/`

All error handling is `try/catch → return []/null → empty page or notFound()`.

### Test ID Conventions (from `lib/testids.ts`)
- Dot-separated: `"page.{route}"`, `"page.{route-detail}"`, `"page.{route}.{section}.{element}"`
- Cards: `"{route}.card.{slug}"`
- Search: `"search-field.toggle"`, `"search-field.input"`
- Grid: `"{testId}"` for container, `"{testId}.empty"` for empty state

---

## 5. U04 Surface Map (P4-02: Image Optimization)

### Media Selection (`strapi-media.ts`)
- **Current:** Tries candidates in order: `media.url → data.attributes.url → ... → formats.large → formats.medium → formats.small → formats.thumbnail`. Always picks the largest available format first — no size-awareness.
- **Gaps:** No WebP/AVIF awareness. No blur data URL. No width/height returned. No per-context format size request.

### Blog Media (`strapi-blog.ts`)
- **Current:** `getBlogPosts` and `getBlogPostBySlug` populate coverImage with only `url` + `alternativeText`. NO formats, width, height, or mime type. This means blog cards always load the full original upload URL.
- **Gap:** Blog detail hero uses `priority` (correct for LCP) but loads raw upload URL, not optimized variant.

### Rich Text Sanitization (`rich-text-content.tsx`)
- **Current:** Uses `isomorphic-dompurify` (~32KB minified). Runs server-side during RSC but package is in dependency tree. If any parent is client component, library leaks to client bundle.

### Next.js Image Config (`next.config.ts`)
- **Current:** `remotePatterns` for Strapi URLs + localhost + unsplash. No `deviceSizes`, `imageSizes`, or `minimumCacheTTL` customization. Rewrite proxy `/uploads/:path*` → Strapi server.

---

## 6. U05 Surface Map (P4-03: Performance)

### Retry/Backoff: NONE
- `strapi-client.ts` has no retry, no backoff, no timeout, no abort controller. Single fetch with error throw.

### Event Filtering: CLIENT-SIDE
- `getEvents()` fetches ALL events (pageSize=100) then filters by `eventType` in memory via `Array.filter()`. Should push to Strapi query param `filters[eventType][$eq]`.

### Search Debounce: NONE
- `SearchField` calls `router.replace()` on EVERY keystroke — triggers full server re-render and Strapi re-fetch per character.

### Course List Virtualization: NONE
- `CourseCatalogList` renders all courses in a flat grid. No windowing, pagination, or infinite scroll.

### Dependencies
- No virtualization libs (react-window, react-virtuoso)
- No debounce utility (lodash.debounce, use-debounce)
- No SWR/React Query for caching

---

## 7. U06 Surface Map (P4-04: Backend Performance)

### Analytics Event Service
- **Current:** `capture(input)` validates string lengths ≤1000, sanitizes PII keys from `properties`, persists via `strapi.db.query().create()`.
- **Gap:** No retention/cleanup logic. Events accumulate indefinitely. No `createdAt` index for efficient deletion. `server.ts` has no cron config.

### SPL XML Parser (`spl-check/xml.ts`)
- **Current hardening:** XML entity escaping, 1MB size guard, namespace-agnostic `findSoapElement()` with CDATA support, try/catch wrappers.
- **Remaining gaps:** No depth limit on recursive `findSoapElement` (stack overflow risk). Silent null returns on parse failure (no logging). `isArray: () => false` means repeated elements silently overwrite.
- **SPL adapter:** Retry with exponential backoff (2 attempts max, configurable timeout). Falls back to `manual_review` gracefully. No logging/metrics.

### Backend Test Inventory (23 test files, Vitest v4)
- 17 passing SPL/internal-notifications tests
- `FAILING_TESTS.md` is **stale** — tests may have been fixed in commit `661afcf`

---

## 8. U07 Surface Map (P6-02: Proxy/Logging)

### Current State: ZERO logging
- `strapi-client.ts`: No logging, no structured error types, no correlation IDs
- All 4 domain modules: `try/catch → []/null`, no logging
- All 4 proxy routes (registrations, contact-submissions, newsletter, analytics): Identical boilerplate. 502 on network error. No logging. No timeout. No retry.

### Proxy Route Template (identical across all 4)
```
try { fetch to Strapi } catch { 502 + Turkish error }
```
No request validation, no response normalization, no correlation headers.

---

## 9. U08 Surface Map (P5-05: Notification Plugin)

### Current Service Structure (well-designed, DI-based)
- `keys.ts`: 8 notification keys
- `recipient-utils.ts`: Email normalization
- `service-core.ts` (195 lines): Pure business logic with DI
- `strapi-service.ts` (38 lines): Strapi adapter
- `templates.ts` (196 lines): Turkish email templates
- `types.ts` (107 lines): 7 payload interfaces + envelope types

### Consumers (fire-and-forget pattern, try/catch with logging)
- `registration/services/registration.ts`: `event_registration` key
- `contact-submission/services/contact-submission.ts`: 4 contact keys
- `course-application/services/course-application.ts`: 3 application keys

### Plugin Infrastructure
- **No custom plugins** exist under `backend/src/plugins/` (directory doesn't exist)
- `config/plugins.ts`: Only upload (aws-s3), email (sendmail), csv-exporter
- `backend/src/index.ts`: Seeds 8 default notification routings, sets up public read permissions

### Notification Routing API
- Exists as standard Strapi collection type with key, label, enabled, customEmails, adminRoles

### P1-01 Gate: SETTLED
- Rate-limiter middleware exists (`backend/src/middlewares/rate-limiter.ts`): sliding-window, per-path limits covering all notification-triggering endpoints. Registered globally. U08 is unblocked.

---

## 10. Baseline Failures: Stale

`FAILING_TESTS.md` (dated 2026-04-28) reports 16 pre-existing failures. Commit `661afcf` ("fix(security): add rate limiting, upgrade deps, fix 16 test failures") appears to have resolved:

| Category | Reported | Current Status |
|----------|----------|----------------|
| contact-submission kvkkConsent | 9 | **FIXED** — test file has `kvkkConsent: true` in all inputs |
| TCKN masking (registration+course-app) | 3 | **Possibly fixed** — test file values match service behavior |
| SPL/SOAP XML parsing | 4 | **UNVERIFIED** — requires test run |
| blog-author schema test | 1 | **FIXED** |

**Action required:** Run full backend test suite before U06/U08 start to establish current baseline. Update `FAILING_TESTS.md` or reference the actual test run output.

---

## 11. Shared Conflict Matrix (Verified Against Current Code)

| Shared File | Units | Conflict Type |
|-------------|-------|---------------|
| `strapi-client.ts` | U01, U02, U05, U07 | **HIGHEST RISK** — 4 units editing same file. U01: schema param. U05: retry/backoff. U07: logging. Must be sequenced. |
| `strapi-courses.ts` | U01, U02, U07 | All edit same functions — validation + cache + logging |
| `strapi-events.ts` | U01, U02, U05 | Same functions — validation + cache + server-side filters |
| `strapi-blog.ts` | U01, U02, U04 | Validation + cache + media populate |
| `strapi-teachers.ts` | U01, U02, U07 | Validation + cache + logging |
| `strapi-types.ts` | U01, U04 | U01: schemas. U04: media shapes |
| `strapi-media.ts` | U01, U04 | U04: format selection. U01: validation compat |
| `content-card-shell.tsx` | U03, U04 | U03: shell abstraction. U04: image behavior |
| `search-field.tsx` | U03, U05 | U03: loading states. U05: debounce |
| `rich-text-content.tsx` | U04, U05 | Sanitization bundle + image optimization |
| `backend/src/index.ts` | U08 | Plugin bootstrap registration |

**Safe parallel lanes (no shared files):**
- U03 (shells) + U06 (backend perf) — zero overlap
- U03 (shells) + U08 (plugin) — zero overlap
- U04 (images) + U06 (backend perf) — zero overlap
- U05 (perf) + U08 (plugin) — zero overlap (except strapi-client shared with U01/U02/U07)
- U06 (backend perf) + U08 (plugin) — both backend, different concerns, no shared files

---

## 12. Execution Recommendations

1. **U01 should go first** — Zod validation in `strapi-client.ts` is a prerequisite for U05 (retry) and U07 (logging) that also need that file. U01's change is the simplest (add optional schema parameter).
2. **U05 and U07 must follow U01** on `strapi-client.ts` — they depend on the function signature.
3. **U03 and U06 can start immediately** — no shared file dependencies with U01/U02.
4. **U08 can start immediately** — P1-01 gate is settled, no shared files with frontend units.
5. **U02 can run in parallel with U01** if they coordinate on domain module edits, but U01 should own `strapi-client.ts` first.
6. **FAILING_TESTS.md should be refreshed** before U06/U08 validation.
