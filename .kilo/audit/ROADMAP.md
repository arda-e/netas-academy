# Remediation Roadmap — netas_academy

## Generated: 2026-05-01 | Based on: Multi-Agent Codebase Audit (103 findings, 6 agents)

---

## Phase 1 — Critical (Week 1–2)
**Focus**: Security vulnerabilities, data integrity, KVKK compliance, broken tests

### Security Hardening (P1)
- [ ] **SEC-001**: Add rate limiting to all 5 public custom endpoints (koa2-ratelimit middleware) — **M effort**
- [ ] **SEC-002**: Fix race condition in registration duplicate prevention — add UNIQUE constraint on (event, student) + transaction — **M effort**
- [ ] **SEC-004**: Add server-side kvkkConsent validation to event registration controller — **S effort**
- [ ] **SEC-006**: Make analytics PII sanitization recursive (nested object support) — **S effort**
- [ ] **SEC-003**: Exclude TCKN from sessionStorage persistence in FormStorage — **S effort**
- [ ] **SEC-007**: Move backend secrets from `.env` to external config; harden `.gitignore` — **S effort**

### Critical Test Fixes
- [ ] **TC-008**: Fix 9 contact-submission test failures (add `kvkkConsent: true` to fixtures) — **XS effort**
- [ ] **TC-009**: Fix 3 TCKN masking test assertion updates — **XS effort**
- [ ] **TC-001**: Begin service-level tests for registration and course services (highest risk) — **L effort**
- [ ] **CC**: Fix 13 unescaped entity lint errors in kvkk/page.tsx (SA-001) — the only lint-blocking error — **S effort**

### Dependencies
- [ ] **SEC-008**: Audit and fix 14 HIGH severity npm vulnerabilities (lodash override, Strapi upgrade path) — **L effort**

### Estimated Effort: ~15 developer-days

---

## Phase 2 — High (Week 3–4)
**Focus**: Performance bottlenecks, data layer resilience, large file refactoring

### Data Layer Resilience
- [ ] **PP-002**: Implement retry/backoff in fetchStrapi() (3 attempts, exponential backoff) — **M effort**
- [ ] **PP-005**: Add responsive image format selection to blog coverImage queries — **S effort**
- [ ] **PP-014**: Enable Strapi image format fallbacks for all content type image queries — **S effort**
- [ ] **SA-016**: Add runtime response validation (Zod) to fetchStrapi() to catch schema drift — **L effort**

### Performance
- [ ] **PP-001**: Add loading.tsx and error.tsx to all route segments — **M effort**
- [ ] **PP-003**: Parallelize event email sending (Promise.all or queue) — **L effort**
- [ ] **PP-010**: Move dompurify to server-only; reduce client bundle by ~30KB gzipped — **M effort**
- [ ] **SA-017**: Align route-level `force-dynamic` with fetch-level caching strategy — **S effort**

### Large File Refactoring
- [ ] **AR-001**: Split monolithic `strapi.ts` (429 lines) into per-content-type modules — **L effort**
- [ ] **AR-011**: Modularize `seed-demo.js` (714 lines) into per-content-type seed files — **M effort**
- [ ] **AR-004**: Refactor IntentLeadForm (489 lines) into composable hooks + sub-components — **L effort**

### Architectural Cleanup
- [ ] **AR-019**: Create shared controller helper utility for error/response formatting — **M effort**
- [ ] **SEC-010**: Harden send-registration-email endpoint (admin auth check, sender whitelist) — **S effort**
- [ ] **DM-005**: Remove dead code: blog-search.tsx — **XS effort**

### Estimated Effort: ~20 developer-days

---

## Phase 3 — Medium (Week 5–8)
**Focus**: Code quality, DRY consolidation, type safety, test coverage expansion

### DRY Consolidation
- [ ] **AR-002**: Unify TCKN validation logic (frontend + backend) into shared source of truth — **M effort**
- [ ] **AR-003**: Make backend the authoritative source for event registration window logic — **M effort**
- [ ] **AR-005**: Extract ContentDetailPageShell component from duplicated detail page layouts — **M effort**
- [ ] **AR-006**: Extract ContentListPage component from duplicated list page patterns — **M effort**
- [ ] **SA-010**: Extract repeated Tailwind utility classes into @apply component classes — **S effort**
- [ ] **AR-008**: Create useFormPersistence hook to further centralize FormStorage patterns — **S effort**

### Type Safety
- [ ] **SA-002**: Remove `as any` casts in Strapi controller/service factory calls — **XS effort**
- [ ] **SA-003**: Replace non-null assertion in ContentCardShell with proper type guard — **XS effort**
- [ ] **SA-009**: Add error logging before silent returns in strapi.ts catch blocks — **S effort**
- [ ] **SA-016**: Add Zod/Valibot validation at API response boundary (strapi.ts) — already in Phase 2
- [ ] **DM-004**: Break type-only circular dependency in intent-field-sections ↔ intent-lead-form — **XS effort**

### Caching Strategy
- [ ] **SA-006**: Unify caching policy (no-store vs force-cache) across all Strapi fetch functions — **S effort**
- [ ] **SA-014**: Add caching to getLatestCourses (high-traffic /hakkimizda page) — **XS effort**

### Test Coverage Expansion
- [ ] **TC-001** (continued): Complete service tests for all 6 untested backend services — **L effort**
- [ ] **TC-002** (begin): Add Vitest + @testing-library/react for frontend component tests — **XL effort**
- [ ] **TC-005**: Add tests for [slug] detail pages — **M effort**
- [ ] **TC-004**: Add tests for /kvkk and /haberler routes — **S effort**
- [ ] **TC-006**: Add unit tests for form-storage.ts, tckn.ts, and other uncovered lib files — **M effort**
- [ ] **TC-010**: Fix 4 SPL/SOAP XML parsing tests (fast-xml-parser v5 migration) — **M effort**
- [ ] **TC-011**: Add form interaction tests for /iletisim (submission, validation, error states) — **M effort**

### Error Handling
- [ ] **SA-007**: Add try-catch blocks to contact-submissions and registrations API proxy routes — **XS effort**
- [ ] **AR-012**: Add shared error boundary with branded recovery UI — **S effort**

### Estimated Effort: ~28 developer-days

---

## Phase 4 — Low (Backlog)
**Focus**: Cosmetic improvements, documentation, style consistency

### Cosmetic & Style
- [ ] **SA-020**: Clean up `.dark` class in globals.css (either implement dark mode or remove stub) — **S effort**
- [ ] **DM-006**: Remove unused separator.tsx or replace manual `<hr>` elements — **XS effort**
- [ ] **SA-011**: Fix eslint-disable suppression in intent-lead-form useEffect — **XS effort**
- [ ] **SA-012**: Fix unused `searchOnly` prop with underscore convention — **XS effort**

### Navigation & Config
- [ ] **AR-016**: Centralize navigation items from site-header into shared config — **XS effort**
- [ ] **AR-018**: Standardize custom route file naming (custom.ts per content type) — **S effort**
- [ ] **AR-020**: Consolidate date formatting utilities (Intl.DateTimeFormat with tr-TR) — **S effort**

### Documentation & DX
- [ ] **TC-013**: Add `npm test` script to frontend package.json — **XS effort**
- [ ] **TC-017**: Add CI pipeline configuration (GitHub Actions) for automated testing — **M effort**
- [ ] **TC-018**: Consolidate test ID imports from testids.ts instead of redefining — **XS effort**

### Future Consideration
- [ ] **AR-009**: Convert internal-notifications to a Strapi plugin (for admin UI + lifecycle hooks) — **L effort**
- [ ] **AR-013**: Decompose course-application service into sub-services — **M effort**
- [ ] **PP-008**: Add virtualization to CourseCatalogList (react-window/react-virtuoso) — **M effort**
- [ ] **TC-003**: Add Playwright E2E test infrastructure — **L effort**
- [ ] **SA-015**: Implement /haberler data fetching (currently hardcoded empty list) — **S effort**

### Estimated Effort: ~15 developer-days

---

## Summary

| Phase | Focus Area | Effort | Timeline | Key Deliverable |
|-------|-----------|--------|----------|-----------------|
| 1 | Critical (Security, Data Integrity, KVKK, Tests) | ~15 days | Week 1–2 | Zero critical vulnerabilities, no lint-blocking errors |
| 2 | High (Performance, Data Layer, Large Files) | ~20 days | Week 3–4 | Resilient data layer, loading states, modular strapi.ts |
| 3 | Medium (DRY, Type Safety, Test Coverage) | ~28 days | Week 5–8 | Unified patterns, type-safe API boundary, 80%+ test coverage for critical paths |
| 4 | Low (Cosmetic, Docs, Style, Futures) | ~15 days | Backlog | Clean codebase, CI pipeline, E2E infrastructure |
| **Total** | | **~78 days** | **~8 weeks** | **Production-grade codebase** |

---

## Progress Tracking

| Phase | Status | Start | Complete | Findings Closed |
|-------|--------|-------|----------|-----------------|
| 1 — Critical | ⬜ Not Started | — | — | 0/14 |
| 2 — High | ⬜ Not Started | — | — | 0/20 |
| 3 — Medium | ⬜ Not Started | — | — | 0/40 |
| 4 — Low | ⬜ Not Started | — | — | 0/29 |

---

*Roadmap generated by the Lead Architect Agent. Prioritization based on impact/effort matrix: Critical×High-Impact first, then High×Medium-Effort, then Medium×Variable-Effort, finally Low×Backlog.*
