# PR Strategy — netas_academy Audit Remediation

## Generated: 2026-05-01 | 103 findings → 27 PRs + 9 observations

---

## Merge Strategy

**Not one PR per finding.** Findings are grouped into **27 PRs** by:
1. **Same file/touch zone** — findings modifying the same files go together
2. **Causal dependency** — if F-A requires F-B first, they share a PR (or are sequenced linearly)
3. **Risk isolation** — security fixes are small, focused PRs for thorough review
4. **Effort balance** — each PR is 0.5–4 dev-days
5. **Theme cohesion** — each PR has one clear purpose

**Merge order**: Dependency-aware topological sort via 7 waves. Wave 0 (quick wins) can ship immediately. Waves 1–6 follow blocking arrows.

---

## Wave 0 — Quick Wins (ship immediately, any order)

### P1-05: Secure credentials, secrets management, and TCKN pepper warnings

| Field | Value |
|-------|-------|
| **Findings** | SEC-007, SEC-014 |
| **Effort** | 0.5 days |
| **Risk** | LOW |
| **Dependencies** | None |
| **Files** | `backend/.env.example`, `backend/.env`, `docker-compose.yml`, `docker-compose.deploy.yml`, `backend/src/utils/tckn.ts` |
| **Description** | Move hardcoded secrets from `.env` and Docker Compose to documented environment variables. Add `TCKN_STORAGE_PEPPER` documentation. Emit startup warning if pepper is empty. |
| **Validation** | Verify `.env.example` documents all required secrets with `${VAR}` placeholders. Docker Compose uses env var references, not hardcoded strings. `hashTcknForStorage` logs warning when pepper unset. |
| **Acceptance** | No actual secrets tracked in git. `.env` in `.gitignore`. `TCKN_STORAGE_PEPPER` documented in `.env.example` with instructions. |

### P6-01: Fix KVKK page lint errors and wire up Haberler data

| Field | Value |
|-------|-------|
| **Findings** | SA-001, SA-015, TC-004 |
| **Effort** | 0.5 days |
| **Risk** | LOW |
| **Dependencies** | None |
| **Files** | `frontend/src/app/kvkk/page.tsx`, `frontend/src/app/haberler/page.tsx` |
| **Description** | Replace 13 Turkish unescaped entities with HTML entities (`&ldquo;`, `&rdquo;`, `&rsquo;`). Wire up empty `/haberler` page to fetch from Strapi (or add `dynamic = 'force-dynamic'` + TODO if backend content type doesn't exist yet). Add route tests for both pages. |
| **Validation** | `npm run lint` passes with zero errors. `/haberler` renders content or clear placeholder. Tests pass for both routes. |
| **Acceptance** | Lint pipeline green. Both routes have passing tests. Haberler page no longer renders hardcoded empty list. |

### P7-06: Fix XML parser security configuration

| Field | Value |
|-------|-------|
| **Findings** | SEC-009 |
| **Effort** | 0.25 days |
| **Risk** | LOW |
| **Dependencies** | None |
| **Files** | `backend/src/services/spl-check/xml.ts` |
| **Description** | Add safe XML parser options: `processEntities: false`, `htmlEntities: false`, `ignoreDeclaration: true`. Add max response size check (1MB) before parsing SOAP response. |
| **Validation** | SPL check endpoint returns correct SOAP status and reference after config change. Existing SPL tests still pass. |
| **Acceptance** | `XMLParser` constructor includes entity processing disabled. Response body validated for max length before parsing. |

### P5-04: Frontend architecture cleanup — dead code, duplicated styles, navigation config

| Field | Value |
|-------|-------|
| **Findings** | SA-010, SA-020, AR-010, AR-016, DM-005, DM-006, SA-003, SA-012 |
| **Effort** | 1.5 days |
| **Risk** | LOW |
| **Dependencies** | None |
| **Files** | `frontend/src/app/globals.css`, `frontend/src/components/content/blog-search.tsx` (DELETE), `frontend/src/components/ui/separator.tsx` (DELETE or use), `frontend/src/components/content/content-card-shell.tsx`, `frontend/src/components/content/search-field.tsx`, `frontend/src/components/site-header.tsx`, `frontend/src/lib/navigation.ts` (NEW) |
| **Description** | Extract repeated Tailwind utility classes into `@layer components` in globals.css. Fix or remove `.dark` class stub. Delete dead code (`blog-search.tsx`, `separator.tsx`). Replace non-null assertion with proper type guard in ContentCardShell. Use `_searchOnly` convention for unused prop. Centralize navigation items into shared config. Extract ContentCardMetadata sub-component shared by EventCard/CourseCard/BlogCard. |
| **Validation** | `npm run lint` passes. All pages render identically. No import errors for deleted files. Navigation works correctly on all pages. |
| **Acceptance** | Repeated Tailwind classes deduplicated. Dark mode stub resolved (either implement or remove). Zero dead imports. Navigation centralized. Non-null assertion eliminated. |

---

## Wave 1 — Blockers (must ship first, unblocks downstream)

### P1-01: Add rate limiting and CSRF protection to all public API endpoints

| Field | Value |
|-------|-------|
| **Findings** | SEC-001, SA-019, SEC-011 |
| **Effort** | 1.5 days |
| **Risk** | HIGH (changes all public endpoint behavior) |
| **Dependencies** | None |
| **Blocks** | P1-02, P1-03, P5-03, P5-05 |
| **Files** | `backend/config/middlewares.ts`, all 5 custom route files in `backend/src/api/*/routes/`, `frontend/src/app/api/*/route.ts`, `frontend/src/components/newsletter-subscription-form.tsx` |
| **Description** | Wire Strapi's bundled `koa2-ratelimit` into all 5 public `auth: false` endpoints. Registration/contact: 5 req/min per IP. Analytics: 30/min. Newsletter: 10/min. Course application: 5/min. Add CSRF token validation middleware for all mutating endpoints. Create `frontend/src/app/api/newsletter-subscriptions/subscribe/route.ts` proxy to stop direct browser→Strapi calls. |
| **Validation** | `curl -X POST` in a tight loop against each endpoint → confirm 429 after threshold. CSRF middleware rejects requests missing token. Newsletter subscription routes through Next.js proxy. |
| **Acceptance** | All endpoints return 429 after rate threshold. `NEXT_PUBLIC_STRAPI_URL` no longer exposed client-side. Consistent proxy architecture for all form endpoints. |

### P1-04: Upgrade backend dependencies to fix 14 HIGH vulnerabilities

| Field | Value |
|-------|-------|
| **Findings** | SEC-008 |
| **Effort** | 2 days |
| **Risk** | HIGH (breaking changes from Strapi upgrade) |
| **Dependencies** | None |
| **Blocks** | P3-01 (and transitively all phases 4–7) |
| **Files** | `backend/package.json`, `backend/package-lock.json` |
| **Description** | Run `npm audit fix`. Add `lodash` to `overrides` to pin >= 4.17.24 (prototype pollution fix). Upgrade `@strapi/strapi` and plugins to latest compatible versions. Test full admin panel and API surface after upgrade. |
| **Validation** | `npm audit` returns 0 HIGH/CRITICAL. `npm run build:backend && npm run seed:demo` passes. Full manual regression of admin panel and all custom endpoints. |
| **Acceptance** | Zero high-severity vulnerabilities. All existing functionality intact. `lodash` pinned above vulnerable version. |

### P7-01: Fix all 16 pre-existing test failures

| Field | Value |
|-------|-------|
| **Findings** | TC-008, TC-009, TC-010, TC-012, TC-014 |
| **Effort** | 1.5 days |
| **Risk** | LOW |
| **Dependencies** | None |
| **Files** | `backend/tests/contact-submission*.test.*`, `backend/tests/tckn*.test.*`, `backend/tests/spl-check*.test.*`, test fixtures |
| **Description** | Three groups: (1) 9 contact-submission tests fail because `kvkkConsent` field is missing from fixtures — add `kvkkConsent: true`. (2) 3 TCKN masking tests have outdated expected hash values — update. (3) 4 SPL/SOAP XML parsing tests need fast-xml-parser v5 compatibility updates. Also: replace loose regex assertions with exact matches; add `beforeEach`/`afterEach` database reset hooks. |
| **Validation** | `npm run test --prefix backend` passes with 0 failures. All 16 previously-failing tests now green. |
| **Acceptance** | Backend test suite fully green. No more documented-but-unfixed failures. Tests isolated with DB reset hooks. |

---

## Wave 2 — After P1-01

### P1-02: Fix registration race condition, KVKK consent validation, and PII leaks

| Field | Value |
|-------|-------|
| **Findings** | SEC-002, SEC-004, SEC-012 |
| **Effort** | 1.5 days |
| **Risk** | HIGH |
| **Dependencies** | P1-01 |
| **Files** | `backend/src/api/registration/services/registration.ts`, `backend/src/api/registration/controllers/registration.ts`, `backend/src/api/registration/content-types/registration/schema.json` |
| **Description** | Add compound UNIQUE index on `(event, student)` to prevent duplicate registrations at the database level. Add server-side `kvkkConsent` validation in controller — reject if consent is not explicitly `true`. Trim registration response to exclude student PII (email, phone). Replace check-then-act with database-enforced uniqueness. |
| **Validation** | Send 2 concurrent POST registrations for same student+event → exactly 1 created. POST without `kvkkConsent: true` → 400 error. Response body does not contain `student.email` or `student.phone`. |
| **Acceptance** | Race condition closed at database level. KVKK consent enforced server-side. PII scrubbed from API responses. |

### P1-03: Harden email sending endpoint and proxy newsletter through API layer

| Field | Value |
|-------|-------|
| **Findings** | SEC-010, SEC-013, PP-003 |
| **Effort** | 2 days |
| **Risk** | MEDIUM |
| **Dependencies** | P1-01 |
| **Files** | `backend/src/api/event/controllers/event.ts`, `backend/src/api/event/routes/custom-event.ts`, `backend/src/api/event/services/event.ts`, `frontend/src/app/api/newsletter-subscriptions/subscribe/route.ts` (NEW), `frontend/src/components/newsletter-subscription-form.tsx` |
| **Description** | Require admin role for `send-registration-email` endpoint. Validate `from` address against environment-configured allowlist. Reject unauthorized sender addresses. Route newsletter subscription through Next.js API proxy (not direct browser→Strapi). Send registration emails in parallel batches via `Promise.all` instead of sequentially. |
| **Validation** | `curl -X POST /api/events/:id/send-registration-email` without admin token → 401. With admin token but unauthorized `from` → 400. Newsletter form uses proxy (check browser network tab). Emails sent in parallel (check Strapi logs for interleaved timestamps). |
| **Acceptance** | Email endpoint requires admin auth with sender validation. Newsletter uses proxy architecture consistent with other forms. Emails no longer sent sequentially. |

### P2-01: Harden DOMPurify configuration and fix PII sanitization recursion

| Field | Value |
|-------|-------|
| **Findings** | SEC-005, SA-008, SA-013, SEC-006 |
| **Effort** | 1.5 days |
| **Risk** | MEDIUM |
| **Dependencies** | None |
| **Files** | `frontend/src/components/content/rich-text-content.tsx`, `frontend/src/components/content/visual-story-section.tsx`, `backend/src/api/analytics-event/lib/constants.ts` |
| **Description** | Configure DOMPurify with explicit `ALLOWED_TAGS` and `ALLOWED_ATTR` whitelists (not default). Replace VisualStorySection's inline `style={{ backgroundImage }}` with Next.js `Image` component. Make `sanitizeProperties` recursively handle nested objects/arrays in analytics PII filtering — `{ user: { email: "x" } }` must be caught. |
| **Validation** | Inject `<script>alert(1)</script>` via Strapi richtext → rendered as text, not executed. POST `{ nested: { email: "x" } }` to analytics → nested email stripped. VisualStorySection uses Image component (check rendered DOM). |
| **Acceptance** | DOMPurify whitelist defined. Nested PII stripped recursively. Inline backgroundImage eliminated. |

### P2-02: Fix TCKN sessionStorage exposure and unify TCKN validation

| Field | Value |
|-------|-------|
| **Findings** | SEC-003, AR-002, AR-008 |
| **Effort** | 2 days |
| **Risk** | MEDIUM |
| **Dependencies** | None |
| **Files** | `frontend/src/hooks/use-event-registration-form.ts`, `frontend/src/lib/form-storage.ts`, `frontend/src/lib/tckn.ts`, `backend/src/utils/tckn.ts` |
| **Description** | Filter `tckn` field out of FormStorage.save() so it never hits sessionStorage. Create `useFormPersistence` hook to further centralize save/restore logic shared between event registration and intent lead form. Add cross-reference comments between frontend and backend TCKN implementations (or extract into shared module). |
| **Validation** | Fill registration form with TCKN → reload page → TCKN field is empty (not restored). Run identical TCKN validation inputs on frontend and backend → identical pass/fail results. `npm run test` passes on both stacks. |
| **Acceptance** | TCKN never stored in sessionStorage. Form persistence hook deduplicated. TCKN validation consistency ensured. |

### P5-02: Consolidate shared utilities and error handling across frontend/backend

| Field | Value |
|-------|-------|
| **Findings** | AR-003, DM-010, AR-020, AR-019, SA-007 |
| **Effort** | 2.5 days |
| **Risk** | MEDIUM |
| **Dependencies** | None |
| **Files** | `frontend/src/lib/event-registration.ts`, `backend/src/services/event-registration.ts`, `backend/src/api/registration/controllers/`, `backend/src/api/contact-submission/controllers/`, `backend/src/api/course-application/controllers/`, `backend/src/api/analytics-event/controllers/`, `frontend/src/app/api/registrations/register/route.ts`, `frontend/src/app/api/contact-submissions/submit/route.ts` |
| **Description** | Make backend the single source of truth for event registration window logic (frontend queries `GET /api/events/:id/registration-status` instead of duplicating). Create shared controller helper utilities (`formatError`, `formatSuccess`, `validateBody`) used by all 4 custom controllers. Consolidate date formatting to a shared `Intl.DateTimeFormat('tr-TR')` utility. Add try-catch error handling to frontend API proxy routes (contact-submissions, registrations). |
| **Validation** | Event registration status determined by API call, not frontend logic. All controllers return errors in consistent `{ error, status }` format. Frontend proxy routes return structured JSON errors on backend failure (502). Date formatting consistent across stacks. |
| **Acceptance** | Zero duplicated business logic between stacks. Consistent error responses from all endpoints. Shared controller helper used by all 4 custom controllers. API proxy routes handle errors gracefully. |

---

## Wave 3 — After P1-04 + P1-01 (Core Architecture)

### P3-01: Split monolithic strapi.ts (429 lines) into domain modules

| Field | Value |
|-------|-------|
| **Findings** | AR-001, SA-004, DM-002, DM-003, AR-015 |
| **Effort** | 3.5 days |
| **Risk** | HIGH (touches every frontend page import) |
| **Dependencies** | P1-04 |
| **Blocks** | P3-02, P3-03, P4-01..P4-04, P5-01, P5-05, P6-02, P7-03, P7-04 |
| **Files** | `frontend/src/lib/strapi.ts` → split into `strapi-types.ts`, `strapi-client.ts`, `strapi-courses.ts`, `strapi-events.ts`, `strapi-blog.ts`, `strapi-teachers.ts`, `strapi-media.ts`. Update imports in all files under `frontend/src/app/` and `frontend/src/components/`. |
| **Description** | Mechanical refactor — no behavior change. Each domain file: type definitions + dedicated fetch functions + field selection queries. `strapi-client.ts`: base `fetchStrapi` + error handling. `strapi-types.ts`: all `StrapiCourse`, `StrapiEvent`, etc. types. `strapi-media.ts`: `getStrapiMediaUrl`, `toStrapiAssetUrl`. No file exceeds 200 lines. |
| **Validation** | `npm run build:frontend` passes. Every page renders same content as before. `tsc --noEmit` strict mode passes. No functional regressions. |
| **Acceptance** | 7 focused modules replace 1 monolithic file. All consuming files updated. Type safety maintained. Zero behavior change. |

### P5-03: Standardize backend patterns, naming conventions, and seed script

| Field | Value |
|-------|-------|
| **Findings** | AR-007, AR-011, AR-018, SA-002, SA-018, AR-013, AR-014, DM-014 |
| **Effort** | 3.5 days |
| **Risk** | MEDIUM |
| **Dependencies** | P3-01, P1-01 |
| **Files** | `backend/src/api/*/content-types/*/schema.json`, `backend/src/api/*/routes/custom-*.ts` → rename to `custom.ts`, `backend/scripts/seed-demo.js` → split into `backend/scripts/seed/`, `backend/src/api/course-application/services/`, `backend/src/api/event/controllers/event.ts` |
| **Description** | Rename all custom route files to `custom.ts`. Remove `as any` casts from Strapi controller/service factory calls — use proper generic types. Remove unnecessary `blog-author` from PUBLIC_READ_ACTIONS (or document as reserved). Split 714-line `seed-demo.js` into per-content-type seed modules with shared factory. Decompose `course-application` service: extract SPL orchestration into sub-service. Fix event controller to use `strapi.service()` instead of direct notification import. Standardize field naming to camelCase across all content types. |
| **Validation** | `npm run seed:demo` works. All custom routes respond at same paths. `npm run build:backend && npm run build:frontend` passes. No field reference breaks. |
| **Acceptance** | Consistent `custom.ts` naming. Zero `as any` casts. Modular seed script. Decomposed course-application service. Clean service boundaries. |

---

## Wave 4 — After P3-01 (Largely Parallelizable)

### All Wave 4 PRs can be worked on in parallel by different developers once P3-01 is merged.

### P3-02: Add Zod runtime type safety to API responses

| Field | Value |
|-------|-------|
| **Findings** | SA-016, AR-017 |
| **Effort** | 3 days |
| **Risk** | MEDIUM |
| **Dependencies** | P3-01 |
| **Files** | `frontend/src/lib/strapi-types.ts` (Zod schemas added), `frontend/src/lib/strapi-client.ts`, `frontend/src/components/contact/*`, `backend/src/api/contact-submission/`, `backend/src/api/registration/` |
| **Description** | Add Zod schema for each `Strapi*` response type. Validate API responses before returning from fetch functions. Make backend controllers the authoritative validators — frontend Zod schemas mirror backend rules, not duplicate them. |
| **Validation** | Mutation test: change a Strapi field name → frontend build fails AND runtime returns validation error, not `undefined` access. All form validation consistent between frontend and backend. |
| **Acceptance** | Every `get*` function validates response with Zod. API boundary is type-safe at runtime, not just compile time. |

### P3-03: Unify frontend caching strategy

| Field | Value |
|-------|-------|
| **Findings** | SA-006, SA-014, SA-017, PP-007, PP-009, PP-016 |
| **Effort** | 1.5 days |
| **Risk** | MEDIUM |
| **Dependencies** | P3-01 |
| **Files** | All domain files under `frontend/src/lib/strapi-*.ts`, `frontend/src/app/egitimler/page.tsx`, `etkinlikler/page.tsx`, `blog-yazilari/page.tsx`, `hakkimizda/page.tsx`, `page.tsx` (home) |
| **Description** | Standardize: all `get*BySlug` use `force-cache` or ISR tags. All listing pages use ISR with 60s revalidation. Blog slugs and content use matching strategy (currently slugs=force-cache, content=no-store — mismatch). Home page fetches parallelized with `Promise.all`. Remove unnecessary `export const dynamic = 'force-dynamic'` from pages using cached fetches. Add `force-cache` to `getLatestCourses` (high-traffic /hakkimizda). |
| **Validation** | Set Strapi `updatedAt` to 5 min ago → page shows updated content within 60s (ISR). Home page network tab shows parallel fetch waterfalls. No stale content contradictions. |
| **Acceptance** | Consistent caching strategy documented per content type. Zero contradictory cache directives. Home page loads faster via parallelization. |

### P4-01: Add loading states, error boundaries, and shared page shells

| Field | Value |
|-------|-------|
| **Findings** | PP-001, AR-012, AR-005, AR-006 |
| **Effort** | 2.5 days |
| **Risk** | LOW |
| **Dependencies** | P3-01 |
| **Files** | `frontend/src/app/*/loading.tsx` (6+ new files), `frontend/src/app/error.tsx`, `frontend/src/app/*/error.tsx`, `frontend/src/components/content/content-detail-page-shell.tsx` (NEW), `frontend/src/components/content/content-list-page.tsx` (NEW), detail and list page refactors |
| **Description** | Create `ContentDetailPageShell` component with slots (hero, body, sidebar) — adopt in all 3 detail pages. Create `ContentListPage` component accepting a fetcher + list component — adopt in all 3 list pages. Add `loading.tsx` (skeleton/spinner) and `error.tsx` (branded retry UI) to every route group. |
| **Validation** | Throttle network to Slow 3G → loading skeletons visible during navigation. Kill Strapi backend → error page with retry button renders. All pages render identically to pre-refactor. |
| **Acceptance** | Every route has loading and error states. Detail and list page boilerplate eliminated via shared shells. |

### P4-02: Image optimization pipeline

| Field | Value |
|-------|-------|
| **Findings** | PP-005, PP-010, PP-014 |
| **Effort** | 1.5 days |
| **Risk** | LOW |
| **Dependencies** | P3-01 |
| **Files** | `frontend/src/lib/strapi-media.ts`, `frontend/src/lib/strapi-blog.ts`, `frontend/src/components/blog-card.tsx`, `frontend/src/components/content/rich-text-content.tsx` |
| **Description** | Add `populate[coverImage][fields]=formats` to blog post queries. `getStrapiMediaUrl` selects `large`/`medium` format based on viewport. Move `dompurify` to server-only rendering — client components receive pre-sanitized HTML. |
| **Validation** | Lighthouse audit on `/blog-yazilari` → image LCP passes. Bundle analyzer → `isomorphic-dompurify` not in client bundle. Blog card images load appropriate resolution. |
| **Acceptance** | Image LCP within acceptable range. dompurify not bundled client-side. Responsive image formats used. |

### P4-03: Fix performance anti-patterns — retry, filtering, debounce, virtualization

| Field | Value |
|-------|-------|
| **Findings** | PP-002, PP-004, PP-008, PP-013 |
| **Effort** | 1.5 days |
| **Risk** | LOW |
| **Dependencies** | P3-01 |
| **Files** | `frontend/src/lib/strapi-client.ts`, `frontend/src/lib/strapi-events.ts`, `frontend/src/components/course-catalog-list.tsx`, `frontend/src/components/content/blog-search.tsx` |
| **Description** | Implement exponential backoff retry in `fetchStrapi` (3 attempts, 1s/2s/4s). Pass `eventType` filter to Strapi query param instead of client-side filter in `getEvents`. Add `react-window` virtualization to `CourseCatalogList` for lists > 50 items. Add 300ms debounce to blog search input. |
| **Validation** | Simulate Strapi timeout → retry succeeds on 2nd or 3rd attempt. GET `/api/events?filters[eventType][$eq]=etkinlik` returns only etkinlik events server-side. Scroll 200 courses → only visible rows in DOM (check inspector). Type fast in search → only 1 fetch after typing stops. |
| **Acceptance** | Resilient fetch with retry. Server-side filtering eliminates client-side filter pass. Large lists virtualized. Search debounced. |

### P4-04: Backend performance fixes — analytics retention and SPL parse hardening

| Field | Value |
|-------|-------|
| **Findings** | PP-015, PP-006, SEC-009 |
| **Effort** | 1 day |
| **Risk** | LOW |
| **Dependencies** | P3-01 |
| **Files** | `backend/src/api/analytics-event/services/`, `backend/src/services/spl-check/xml.ts` |
| **Description** | Add analytics event retention policy: delete events older than 90 days (cron job or on-insert cleanup). Fix `fast-xml-parser` config (done in P7-06, included here for completeness). `getCourseSlugs` already correctly optimized — document only. |
| **Validation** | Insert analytics event with `createdAt` > 90 days ago → deleted by cleanup. Analytics table size stays bounded. |
| **Acceptance** | Analytics data has TTL. No unbounded storage growth. SPL parser hardened. |

### P6-02: Add API proxy error handling and Strapi error logging

| Field | Value |
|-------|-------|
| **Findings** | SA-007, SA-009 |
| **Effort** | 0.5 days |
| **Risk** | LOW |
| **Dependencies** | P3-01 |
| **Files** | `frontend/src/app/api/contact-submissions/submit/route.ts`, `frontend/src/app/api/registrations/register/route.ts`, `frontend/src/lib/strapi-client.ts` |
| **Description** | Add try-catch blocks to both API proxy routes (following pattern from analytics/events route). Log errors via `console.error` in all strapi.ts catch blocks before returning defaults. Callers can monitor console for backend health. |
| **Validation** | Kill Strapi backend → API proxy returns `502 { error: "..." }`. Browser console shows structured error logs when Strapi is unreachable. |
| **Acceptance** | All proxy routes have error handling. Errors are logged, not silently swallowed. |

### P5-05: Convert internal notifications to a Strapi plugin

| Field | Value |
|-------|-------|
| **Findings** | AR-009 |
| **Effort** | 2.5 days |
| **Risk** | MEDIUM |
| **Dependencies** | P3-01, P1-01 |
| **Files** | `backend/src/services/internal-notifications/` → `backend/src/plugins/internal-notifications/` |
| **Description** | Convert notification routing service into a Strapi plugin with admin UI for configuration, lifecycle hooks (register/bootstrap/destroy), and independent testability. Consumers (registration, course-application, contact-submission) call `strapi.plugin('internal-notifications').service(...)` instead of direct imports. |
| **Validation** | Registration, course application, and contact submission flows all send correct notification emails. Plugin appears in Strapi admin panel with configurable routing. |
| **Acceptance** | Notifications configurable via admin UI. Plugin follows Strapi lifecycle. Consumers use plugin API. Independent test suite. |

---

## Wave 5 — After P3-02

### P5-01: Refactor IntentLeadForm god component (489 lines → composable hooks)

| Field | Value |
|-------|-------|
| **Findings** | AR-004, SA-005, SA-011, DM-004, DM-012 |
| **Effort** | 2.5 days |
| **Risk** | MEDIUM |
| **Dependencies** | P3-02 |
| **Files** | `frontend/src/components/contact/intent-lead-form.tsx` → split into `intent-lead-tabs.tsx`, `contact-form-fields.tsx`, `use-lead-form.ts`, `use-lead-validation.ts`, `submission-success.tsx`, `types.ts` (NEW) |
| **Description** | Extract tab UI into `IntentLeadTabs`. Extract form fields into `ContactFormFields`. Extract validation logic into `useLeadValidation` hook. Extract form state management into `useLeadForm` hook. Extract success state into `SubmissionSuccess`. Create shared `types.ts` to break circular imports between `intent-field-sections.tsx` and `intent-lead-form.tsx`. Fix `useEffect` dependency array (remove eslint-disable). No file exceeds 200 lines. |
| **Validation** | All existing contact form flows work identically: tab switching, form validation, submission, localStorage persistence, KVKK consent, analytics events. `npm run build` passes. |
| **Acceptance** | No file exceeds 200 lines. Circular import eliminated. eslint-disable removed. All functionality preserved. |

---

## Wave 6 — Foundation established (test expansion)

### P7-03: Add missing test coverage — backend services and schemas

| Field | Value |
|-------|-------|
| **Findings** | TC-001, TC-011, TC-015, TC-016 |
| **Effort** | 3.5 days |
| **Risk** | LOW |
| **Dependencies** | P3-01, P5-03 |
| **Files** | `backend/src/api/*/services/__tests__/`, `backend/src/api/*/content-types/*/schema.test.ts`, `backend/src/services/internal-notifications/__tests__/` |
| **Description** | Add unit tests for all 6 untested backend services (course, event, blog-post, blog-author, student, teacher). Add /iletisim route test covering form validation errors and success states. Add schema snapshot tests for all 9 content types to catch schema drift. Add notification failure scenario tests (provider down, invalid email, empty recipient list). |
| **Validation** | `npm run test --prefix backend -- --coverage` shows >60% coverage on services. Schema snapshot tests fail if schema.json changes unexpectedly. |
| **Acceptance** | All content-type services tested. Schema changes caught by snapshot tests. Notification failure paths tested. |

### P7-04: Add frontend component and library tests

| Field | Value |
|-------|-------|
| **Findings** | TC-002, TC-005, TC-006 |
| **Effort** | 4 days |
| **Risk** | LOW |
| **Dependencies** | P3-01, P3-02 |
| **Files** | `frontend/src/__tests__/components/`, `vitest.setup.ts`, `frontend/vitest.config.ts`, lib test files |
| **Description** | Set up Vitest + `@testing-library/react` test infrastructure. Add component render tests for EventCard, CourseCard, BlogCard, ContentCardShell, IntentLeadForm, NewsletterSubscriptionForm. Add [slug] detail page tests with mock Strapi data. Add unit tests for `tckn.ts`, `form-storage.ts`, `content-taxonomy.ts`, `page-visual-sections.ts`, `utils.ts`. |
| **Validation** | `npm run test --prefix frontend` renders components. Coverage >50% across components and lib. |
| **Acceptance** | Frontend has runtime component tests (not just string matching). Core components and utilities tested. |

### P7-05: Add E2E test infrastructure and critical path tests

| Field | Value |
|-------|-------|
| **Findings** | TC-003 |
| **Effort** | 2 days |
| **Risk** | LOW |
| **Dependencies** | P7-04, P4-01 |
| **Files** | `e2e/playwright.config.ts` (NEW), `e2e/tests/registration.spec.ts`, `contact.spec.ts`, `course-browsing.spec.ts`, `blog.spec.ts` |
| **Description** | Install Playwright. Create E2E tests for 4 critical paths: (1) Event registration — fill form, submit, see success. (2) Contact form — fill, validate, submit. (3) Course browsing — list → detail → back. (4) Blog reading — list → detail. |
| **Validation** | `npx playwright test` passes against local dev server. All critical paths covered. |
| **Acceptance** | 4 critical-path E2E tests pass. Uses `testids.ts` selectors. CI step added (or documented as manual). |

### P7-02: Add test scripts, CI configuration, and test hygiene

| Field | Value |
|-------|-------|
| **Findings** | TC-013, TC-017, TC-018, TC-007 |
| **Effort** | 1.5 days |
| **Risk** | LOW |
| **Dependencies** | P7-01 |
| **Files** | `frontend/package.json`, `.github/workflows/ci.yml` (NEW), test files |
| **Description** | Add `"test": "vitest run"` script to frontend package.json. Create GitHub Actions CI workflow: `lint → test → build` on push and PR. Replace re-implemented test ID constants with imports from `testids.ts`. Remove tautological assertions (`expect(true).toBe(true)`). |
| **Validation** | Push to any branch → CI runs tests on both stacks. `npm test` works in frontend. No tautological assertions in codebase. |
| **Acceptance** | CI pipeline configured. Consistent test ID imports. Zero meaningless assertions. |

---

## Summary Table — All 27 PRs

| # | PR | Title | Phase | Effort | Risk | Findings | Blocks |
|---|----|-------|-------|--------|------|----------|--------|
| 1 | P1-01 | Rate limiting + CSRF on all public endpoints | Sec | 1.5d | HIGH | 3 | 4 PRs |
| 2 | P1-02 | Registration race condition, KVKK consent, PII leaks | Sec | 1.5d | HIGH | 3 | — |
| 3 | P1-03 | Email endpoint hardening + newsletter proxy | Sec | 2d | MED | 3 | — |
| 4 | P1-04 | Upgrade backend deps (14 HIGH vulns) | Sec | 2d | HIGH | 1 | Many |
| 5 | P1-05 | Secure credentials + TCKN pepper docs | Sec | 0.5d | LOW | 2 | — |
| 6 | P2-01 | DOMPurify hardening + PII sanitization recursion | Sec | 1.5d | MED | 4 | — |
| 7 | P2-02 | TCKN exposure fix + validation unification | Sec | 2d | MED | 3 | — |
| 8 | P3-01 | Split strapi.ts into domain modules | Arch | 3.5d | HIGH | 5 | Most of Phases 4–7 |
| 9 | P3-02 | Zod runtime type safety on API responses | Arch | 3d | MED | 2 | — |
| 10 | P3-03 | Unify frontend caching strategy | Arch | 1.5d | MED | 6 | — |
| 11 | P4-01 | Loading states, error boundaries, shared shells | Perf | 2.5d | LOW | 4 | — |
| 12 | P4-02 | Image optimization pipeline | Perf | 1.5d | LOW | 3 | — |
| 13 | P4-03 | Perf anti-patterns: retry, filter, debounce, virtual | Perf | 1.5d | LOW | 4 | — |
| 14 | P4-04 | Backend perf: analytics retention, SPL hardening | Perf | 1d | LOW | 3 | — |
| 15 | P5-01 | Refactor IntentLeadForm god component | Arch | 2.5d | MED | 5 | — |
| 16 | P5-02 | Consolidate shared utils + error handling | Arch | 2.5d | MED | 5 | — |
| 17 | P5-03 | Standardize backend patterns + seed script | Arch | 3.5d | MED | 8 | — |
| 18 | P5-04 | Frontend architecture cleanup (dead code, styles) | QW | 1.5d | LOW | 8 | — |
| 19 | P5-05 | Convert internal-notifications to Strapi plugin | Arch | 2.5d | MED | 1 | — |
| 20 | P6-01 | Fix KVKK lint errors + wire Haberler data | QW | 0.5d | LOW | 3 | — |
| 21 | P6-02 | API proxy error handling + Strapi error logging | QW | 0.5d | LOW | 2 | — |
| 22 | P7-01 | Fix all 16 pre-existing test failures | Test | 1.5d | LOW | 5 | — |
| 23 | P7-02 | Add test scripts, CI config, test hygiene | Test | 1.5d | LOW | 4 | — |
| 24 | P7-03 | Add backend service + schema tests | Test | 3.5d | LOW | 4 | — |
| 25 | P7-04 | Add frontend component + library tests | Test | 4d | LOW | 3 | — |
| 26 | P7-05 | Add E2E test infrastructure + critical paths | Test | 2d | LOW | 1 | — |
| 27 | P7-06 | Fix XML parser security config | QW | 0.25d | LOW | 1 | — |

**9 findings are observations** — no code changes needed:
DM-001, DM-007, DM-008, DM-009, DM-011, DM-013, DM-015, PP-011, PP-012

---

## Merge Order — Topological Sort

```
WAVE 0 (ship immediately, any order):
  P1-05, P6-01, P7-06, P5-04

WAVE 1 (blockers):
  P1-01, P1-04, P7-01

WAVE 2 (after P1-01):
  P1-02, P1-03, P2-01, P2-02, P5-02

WAVE 3 (after P1-04 + P1-01):
  P3-01, P5-03

WAVE 4 (after P3-01 — parallelizable):
  P3-02, P3-03, P4-01, P4-02, P4-03, P4-04, P6-02, P5-05

WAVE 5 (after P3-02):
  P5-01

WAVE 6 (after foundations):
  P7-03, P7-04, P7-05, P7-02
```

### Maximum parallelism: 8 PRs in Wave 4 can be worked simultaneously by different developers.

---

## What Each Finding Needs for Implementation

Every finding in `.kilo/audit/findings.json` now includes:

| Field | What it provides |
|-------|-----------------|
| `id` | Unique identifier (e.g., `SEC-001`) |
| `pr_group` | Which PR this belongs to (e.g., `P1-01`) |
| `title` | One-line summary |
| `file` + `line_range` | Exact location in codebase |
| `description` | What's wrong and why it matters |
| `remediation` | Specific fix recommendation with code examples |
| `effort` | Estimated time: xs (15min), s (0.5d), m (1.5d), l (3.5d), xl (5d+) |
| `severity` | Agent-specific severity (unified to critical/high/medium/low in report) |
| `cross_refs` | Other modules affected if this isn't fixed |
| `implementation_notes` | (Critical/High only) Estimated days, test required, rollback risk |

### To start implementing a PR, you need:
1. **The finding IDs** included in that PR (from this document or the `pr_group` field in findings.json)
2. **The files and line ranges** from each finding
3. **The remediation description** which contains specific fix guidance
4. **The validation steps** from the PR table above

This is sufficient for an experienced developer to implement. No additional research needed per finding — the agents already did the deep analysis.

---

*Strategy generated by Lead Architect Agent. All 103 findings mapped to 27 PRs + 9 observations. Zero unassigned findings.*
