# Codebase Audit Report — netas_academy

## Generated: 2026-05-01T11:30:00Z | Auditors: Multi-Agent Swarm (6 agents + 1 Lead Architect)

---

## Executive Summary

- **Total findings**: 103
- **Critical**: 4 | **High**: 31 | **Medium**: 29 | **Low**: 39
- **Estimated total remediation**: ~78 developer-days (P1+P2: ~25 days, P3+P4: ~53 days)
- **Cross-agent conflicts**: 0 (all findings complementary; no TIEBREAKERs needed)
- **Monorepo boundary violations**: 0 (clean frontend↔backend separation)
- **Circular dependencies**: 1 (type-only, non-breaking)
- **Orphan/dead code files**: 2
- **Test failures (pre-existing)**: 16 documented, all triaged

### Agent Contributions

| Agent | Findings | Focus |
|-------|----------|-------|
| Static Analysis | 20 | Lint, type safety, complexity, pattern violations |
| Performance Profiling | 16 | I/O latency, bundle size, runtime, memory |
| Architecture & Refactoring | 20 | DRY, modularity, coupling, design patterns |
| Security Audit | 14 | Authorization, PII, injection, credential exposure |
| Dependency Mapping | 15 | Import graph, circular deps, orphans, stability |
| Test Coverage | 18 | Coverage gaps, assertion quality, failure triage |

---

## Module Health Scores

| Module | Health | Critical | High | Medium | Low | Score* |
|--------|--------|----------|------|--------|-----|--------|
| FRONT-ARCH | D | 1 | 1 | 5 | 2 | 25.0 |
| FRONT-COMP | D | 0 | 6 | 4 | 7 | 35.5 |
| FRONT-DATA | D | 1 | 5 | 3 | 6 | 39.0 |
| FRONT-FORMS | D | 0 | 5 | 2 | 4 | 26.0 |
| FRONT-STYLES | A | 0 | 0 | 0 | 2 | 1.0 |
| BACK-API | F | 1 | 6 | 7 | 5 | 50.5 |
| BACK-DOMAIN | A | 0 | 0 | 0 | 2 | 1.0 |
| BACK-INT | B | 0 | 1 | 1 | 2 | 7.0 |
| SHARED-UTIL | C | 0 | 3 | 1 | 1 | 14.5 |
| TEST-QUALITY | F | 1 | 4 | 6 | 7 | 41.5 |

*\*Score = critical×10 + high×4 + medium×2 + low×0.5. Health: F≥35, D≥25, C≥15, B≥8, A>0, A+=0*

### Health Score Commentary

- **BACK-API (F)**: Highest-scoring module. Contains the most critical security vulnerabilities (no rate limiting, race conditions, PII exposure), plus significant type safety and caching issues. This is the highest remediation priority.
- **TEST-QUALITY (F)**: 13 source files with zero coverage, 6 backend services untested, zero runtime frontend tests, zero E2E infrastructure. The 16 pre-existing failures block meaningful CI adoption.
- **FRONT-DATA (D)**: Monolithic `strapi.ts` (429 lines) with inconsistent caching, no retry logic, silent error swallowing, and unsafe type assertions. The entire frontend data layer depends on this single file.
- **FRONT-COMP (D)**: Performance issues from missing image optimization, heavy isomorphic-dompurify client bundle, and missing loading states. Components are well-structured architecturally.
- **BACK-DOMAIN (A)**: Clean service layer with well-scoped notification routing. No critical or high findings.
- **FRONT-STYLES (A)**: CSS architecture is sound. Only cosmetic findings (repeated utility classes, dark mode stub).

---

## Critical Findings (P1 — Act Now)

### SEC-001 — No rate limiting on any public custom endpoint
- **Module**: BACK-API | **Severity**: CRITICAL | **Effort**: M
- **Files**: All 5 custom endpoints (registration, contact-submission, analytics-event, course-application, newsletter-subscription)
- **Description**: All public `auth: false` endpoints have zero rate limiting. Attackers can flood registrations, contact submissions, and analytics capture with unbounded throughput. The analytics endpoint has a `// TODO(U14): Add rate limiting` comment acknowledging the gap. Strapi bundles `koa2-ratelimit` as a dependency but it is not wired into any route.
- **Remediation**: Implement rate limiting via Strapi's koa2-ratelimit middleware. Minimum: 5-10 req/min per IP for registration/contact, 30/min for analytics. Add IP-based cooldown in service layer as defense-in-depth.
- **Blast Radius**: ALL public endpoints. Entire user-facing API surface.

### SEC-002 — Race condition: duplicate registration prevention is not atomic
- **Module**: BACK-API | **Severity**: HIGH (elevated to CRITICAL by Lead Architect) | **Effort**: M
- **Files**: `backend/src/api/registration/services/registration.ts:42-68`
- **Description**: Check-then-act pattern with no database transaction or unique constraint. Two concurrent requests for the same student+event can both pass the existence check, creating duplicate registrations. No unique constraint on (event, student) in the schema.
- **Remediation**: (1) Add compound UNIQUE index on (event, student) in the registration schema. (2) Wrap check+create in a database transaction. (3) Use the `isUniqueConstraintError` retry pattern already present in course-application services.
- **Blast Radius**: All event registrations. Data integrity risk.

### SEC-004 — KVKK consent not validated server-side for event registrations
- **Module**: BACK-API | **Severity**: HIGH (elevated to CRITICAL by Lead Architect) | **Effort**: S
- **Files**: `backend/src/api/registration/controllers/registration.ts:9-31`
- **Description**: The registration controller does NOT check `kvkkConsent` server-side. An attacker can POST directly to the API, bypassing the frontend consent check, submitting PII (name, email, phone, TCKN) without consent. This is a KVKK compliance gap — Turkish data protection law requires explicit consent. Compare with contact-submission which correctly validates consent server-side.
- **Remediation**: Add `kvkkConsent` validation in the registration controller or service. Reject registrations where consent is not explicitly true.
- **Blast Radius**: All event registrations. Legal/compliance risk under KVKK.

### TC-001 — Six backend service modules with zero test coverage
- **Module**: TEST-QUALITY | **Severity**: CRITICAL | **Effort**: L
- **Files**: `backend/src/api/blog-author/services/`, `blog-post/services/`, `course/services/`, `event/services/`, `student/services/`, `teacher/services/`
- **Description**: Six core content-type services have NO tests at all. These serve the entire frontend. Any regression in these services goes undetected. Combined with the security issues in BACK-API, this means the most vulnerable code also has the least test protection.
- **Remediation**: Add service-level tests for all six. Prioritize `course`, `event`, and `registration` services (highest traffic + security exposure).
- **Blast Radius**: Full backend reliability.

---

## High Findings (P2 — Plan)

### Security (High)

**SEC-008** — Backend has 14 HIGH severity npm vulnerabilities including lodash prototype pollution (CVSS 8.1)
- **Effort**: L | `npm audit` reports lodash code injection (CWE-94), markdown-it ReDoS, vite path traversal, esbuild origin validation bypass
- **Remediation**: Update `@strapi/strapi` to 4.26.1+/5.9.0+, add `lodash` override in package.json

**SEC-010** — send-registration-email endpoint allows sender spoofing
- **Effort**: S | Authenticated users can set arbitrary `from`/`replyTo` addresses, potentially sending phishing emails to all event registrants
- **Remediation**: Verify admin role, whitelist sender addresses, restrict `from` to configured `EMAIL_DEFAULT_FROM`

**SEC-006** — Analytics PII sanitization only checks top-level properties — nested PII passes through
- **Effort**: S | `sanitizeProperties` doesn't recursively sanitize nested objects/arrays, allowing `{ user: { email: "..." } }` to bypass
- **Remediation**: Make sanitization recursive with the same `containsPII` check at all nesting levels

**SEC-003** — TCKN stored in plaintext in sessionStorage via event registration form
- **Effort**: S | FormStorage persists all form values including plaintext TCKN to sessionStorage on every keystroke. XSS on any page could exfiltrate.
- **Remediation**: Exclude `tckn` from persisted fields in FormStorage.save()

### Performance (High)

**PP-001** — No loading.tsx or error.tsx in any route segment
- **Effort**: M | Users see frozen UI during page transitions. LCP penalty: +500ms–2s per navigation
- **Remediation**: Add loading.tsx (skeleton/spinner) and error.tsx (branded retry boundary) per route group

**PP-002** — fetchStrapi() has zero retry/backoff logic
- **Effort**: M | Any transient network failure causes pages to render empty. No resilience.
- **Remediation**: Implement exponential backoff (3 attempts, 1s/2s/4s delays)

**PP-003** — Event emails sent sequentially (N × SMTP RTT)
- **Effort**: L | 100 registrations can block the endpoint for minutes
- **Remediation**: Use `Promise.all` for parallel sending or queue-based approach

**PP-005** — Blog card cover images load at full resolution — no responsive formats requested
- **Effort**: S | LCP penalty: +500ms–2s on blog listing pages
- **Remediation**: Add format field selection to coverImage populate in blog fetch functions

**PP-010** — isomorphic-dompurify bundles 30KB+ gzipped into client-side code
- **Effort**: M | Heavy library loaded client-side when sanitization should be server-side
- **Remediation**: Use dompurify only in server components; sanitize at build time

**PP-014** — No image optimization pipeline — Strapi images served at original resolution
- **Effort**: S | Blog queries don't request image formats, so all images are full-resolution
- **Remediation**: Add format fields to coverImage populate; use Next.js Image with sizes/quality

### Architecture (High)

**AR-001** — Monolithic strapi.ts (429 lines) serves as entire frontend data layer
- **Effort**: L | Every page depends on it; type changes risk cascading breakage
- **Remediation**: Split into per-content-type modules: strapi-types.ts, strapi-client.ts, strapi-courses.ts, etc.

**AR-002** — TCKN validation logic duplicated byte-for-byte between frontend and backend
- **Effort**: M | Identical checksum validation in both stacks with no shared source of truth
- **Remediation**: Extract into shared package or maintain via build script

**AR-003** — Event registration window logic duplicated across stacks
- **Effort**: M | `isRegistrationOpen`, `getRegistrationStatus` implemented identically in both stacks
- **Remediation**: Make backend the source of truth; frontend queries status endpoint

**AR-004** — IntentLeadForm is a 489-line god component with 3 layers of validation
- **Effort**: L | Combines tab UI, form state, validation, analytics, localStorage, and error handling
- **Remediation**: Extract into composable hooks + sub-components

**AR-017** — Form validation exists in 3 separate layers with potential drift
- **Effort**: L | Frontend Zod, backend controller validation, backend service validation can drift independently
- **Remediation**: Make backend the authoritative validator; frontend Zod mirrors backend rules

**AR-019** — Duplicate error handling and response formatting across custom controllers
- **Effort**: M | All 5 custom controllers duplicate try-catch, error formatting, and validation patterns
- **Remediation**: Create shared controller helper utility (formatError, formatSuccess, validateBody)

### Test Quality (High)

**TC-002** — Zero runtime frontend tests — all 26 test files use readFileSync string matching
- **Effort**: XL | No component rendering, no user interaction, no state management tested
- **Remediation**: Add Vitest + @testing-library/react; add Playwright for E2E

**TC-003** — Zero E2E test infrastructure — no Playwright or Cypress installed
- **Effort**: L | Most interactive flows (registration, contact, course browsing) untested
- **Remediation**: Install Playwright; create E2E tests for critical user paths

**TC-004** — Two routes have zero test coverage: /kvkk and /haberler
- **Effort**: S | Static legal page and empty placeholder completely untested
- **Remediation**: Add tests for both routes

**TC-005** — No tests for [slug] detail pages in egitimler, etkinlikler, blog-yazilari
- **Effort**: M | Detail pages have no test coverage at all
- **Remediation**: Add tests with mock Strapi data for detail page rendering

---

## Medium & Low Findings Summary

### Medium (P3 — Week 5-8, 29 findings)
- **Type safety**: 5 findings — `as` assertions, non-null assertions, unsafe type casts
- **DRY violations**: 8 findings — duplicated layout patterns, card components, form storage, date formatting
- **Caching**: 4 findings — inconsistent no-store vs force-cache across content types
- **Complexity**: 3 findings — seed-demo.js (714 lines), course catalog no virtualization, blog search no debounce
- **Coverage gaps**: 5 findings — untested lib files, form interactions, schema validations
- **Pre-existing failures**: 3 groups (contact-submission kvkkConsent, TCKN masking, SPL XML parsing)
- **Error handling**: 1 finding — frontend API proxy routes missing try-catch

### Low (P4 — Backlog, 39 findings)
- **Cosmetic**: Tailwind class duplication, dark mode stub, unused CSS variables
- **Documentation**: Missing JSDoc, navigation config centralization, barrel export hygiene
- **Observations**: Clean architecture (content component tree, notification service scope, monorepo boundary)
- **Orphans**: blog-search.tsx (dead code), separator.tsx (zero consumers)
- **Utilities**: Date formatting duplication, testids re-implementation, missing test script

---

## Cross-Cutting Concerns

### Turkish Content & Accessibility
- KVKK page has 13 unescaped Turkish entity violations (SA-001) — the only lint-blocking error
- `lang="tr"` usage verified in layout — correct
- ARIA labels: Not systematically evaluated (low priority for this audit phase)
- Character encoding: UTF-8 consistent across Strapi and frontend

### Architectural Health
- **Positive**: Clean monorepo boundary — zero cross-stack imports (DM-011). Frontend↔Backend separation via HTTP API proxies is well-maintained.
- **Positive**: Content component tree is well-layered (shells → domain leaves, zero cycles) (DM-008).
- **Positive**: Notification service scope is clean — consumed by exactly 3 services, no leaks (DM-009).
- **Concerning**: 1 type-only circular dependency (intent-field-sections ↔ intent-lead-form) — not breaking but fragile (DM-004).

### Pre-existing Test Failures (16 total)
| Group | Count | Impact | Fix Effort |
|-------|-------|--------|-----------|
| Contact-submission missing kvkkConsent | 9 | HIGH — >50% service code untested | XS (add one field to fixtures) |
| TCKN masking assertion mismatch | 3 | LOW — single assertion per test | XS (update expected values) |
| SPL/SOAP XML parsing (fast-xml-parser v5) | 4 | MEDIUM — spl-check coverage understated | M (investigate parser migration) |

---

## Appendix A: Agent Summary

| Agent | Findings | Top Severity | Key Issue |
|-------|----------|-------------|-----------|
| Static Analysis | 20 | Error (lint) | 13 unescaped entities blocking lint pipeline |
| Performance Profiling | 16 | Major | No loading states, no retry, sequential emails |
| Architecture & Refactoring | 20 | Critical debt | Monolithic strapi.ts, duplicated TCKN/event logic |
| Security Audit | 14 | Critical | No rate limiting, race condition, PII leaks |
| Dependency Mapping | 15 | Warning | strapi.ts blast radius, 2 orphans found |
| Test Coverage | 18 | Critical | 6 services untested, zero runtime tests |

## Appendix B: Tooling Used

| Tool | Agent | Purpose |
|------|-------|---------|
| ESLint v9 | Static Analysis | Lint violation detection |
| npm audit | Security | Dependency vulnerability scan |
| Manual code review | All agents | Deep source analysis per agent persona |
| Import graph analysis | Dependency Mapping | Coupling, orphans, circular deps |
| Test file mapping | Test Coverage | Coverage gap identification |

---

*Report generated by the Lead Architect Agent after synthesizing findings from 6 specialized audit agents running against commit snapshot from 2026-05-01.*
