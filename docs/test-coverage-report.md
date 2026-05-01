# Test Coverage Report

**Date:** 2026-04-30
**Scope:** One-time snapshot of the Netas Academy monorepo
**Repository root:** `/Users/arda/Desktop/development/netas_academy`

---

## Executive Summary

| Layer | Test Runner | Test Files | Coverage (Lines) | Pass/Fail |
|-------|------------|-----------|-----------------|-----------|
| Backend (Strapi 5) | Vitest v4.1.5 | 22 `.test.ts` + 1 `.test.js` | **62.50% lines, 53.90% branches, 68.47% functions** | 73 passed / 16 failed |
| Frontend (Next.js 16) | `node:test` (built-in) | 26 `.test.mjs` + 1 `.test.ts` | **99.50% lines\*** (see methodology caveat) | 26 passed / 0 failed |
| End-to-End | None | 0 | **0%** | N/A |

**\*Frontend coverage methodology caveat:** The 26 `.test.mjs` files are static source-code analysis tests — they use `readFileSync` to read source files as strings and assert on string content. They do NOT execute React components or exercise runtime code paths. The 99.50% coverage figure reflects Node's instrumentation of the test harness files themselves, not application source code. **This is NOT runtime code coverage.**

### Top 3 Gaps

1. **Zero end-to-end test infrastructure** — no Playwright, Cypress, or any browser-testing framework installed anywhere in the monorepo.
2. **16 pre-existing backend test failures** — documented in `backend/tests/FAILING_TESTS.md`; these inflate the uncovered-code count because failing tests abort early and skip later assertions.
3. **Frontend tests are source-analysis only** — no runtime component/DOM tests exist. The 26 `.test.mjs` files verify that source files contain expected strings but never render a component or exercise a runtime code path.

---

## Backend Coverage

### Test Results

| Metric | Value |
|--------|-------|
| Total tests | 89 |
| Passed | 73 |
| Failed | 16 |
| Skipped | 0 |
| Test files | 22 `.test.ts` + 1 `.test.js` |
| Duration | ~2.5s |

### Coverage Summary

| Metric | Percentage |
|--------|-----------|
| Lines | 62.50% |
| Branches | 53.90% |
| Functions | 68.47% |
| Statements | 60.53% |

### Per-File Coverage (Source Files Under `src/`)

#### Fully Covered (100% lines)

| File | Lines | Branches | Functions |
|------|-------|----------|-----------|
| `src/api/analytics-event/controllers/analytics-event.ts` | 100.00% | 83.33% | 100.00% |
| `src/api/analytics-event/lib/constants.ts` | 100.00% | 100.00% | 100.00% |
| `src/api/newsletter-subscription/controllers/newsletter-subscription.ts` | 100.00% | 83.33% | 100.00% |
| `src/api/newsletter-subscription/services/newsletter-subscription.ts` | 100.00% | 93.33% | 100.00% |
| `src/api/registration/services/registration.ts` | 100.00% | 100.00% | 100.00% |
| `src/services/course-application/domain/course-application-status.ts` | 100.00% | 100.00% | 100.00% |
| `src/services/internal-notifications/recipient-utils.ts` | 100.00% | 100.00% | 100.00% |
| `src/utils/event-registration.ts` | 100.00% | 80.00% | 100.00% |
| `src/utils/tckn.ts` | 100.00% | 81.25% | 100.00% |

#### Well Covered (80-99% lines)

| File | Lines | Branches | Functions |
|------|-------|----------|-----------|
| `src/api/analytics-event/services/analytics-event.ts` | 94.12% | 95.00% | 100.00% |
| `src/api/course-application/services/course-application.ts` | 97.83% | 75.81% | 100.00% |
| `src/services/internal-notifications/service-core.ts` | 96.23% | 85.00% | 100.00% |
| `src/services/internal-notifications/strapi-service.ts` | 83.33% | 0.00% | 60.00% |
| `src/services/spl-check/config.ts` | 80.00% | 46.15% | 100.00% |
| `src/services/spl-check/sap-soap-adapter.ts` | 80.65% | 57.14% | 75.00% |
| `src/services/spl-check/service.ts` | 90.91% | 85.71% | 100.00% |
| `src/services/spl-check/xml.ts` | 100.00% | 69.57% | 100.00% |

#### Partially Covered

| File | Lines | Branches | Functions |
|------|-------|----------|-----------|
| `src/api/contact-submission/services/contact-submission.ts` | 42.19% | 30.61% | 55.56% |
| `src/services/internal-notifications/templates.ts` | 75.61% | 57.14% | 80.00% |

#### Uncovered (0% lines)

These are primarily Strapi boilerplate files (controllers, routes, services) that are auto-generated or thin wrappers:

- `src/api/analytics-event/routes/custom-analytics-event.ts`
- `src/api/blog-author/controllers/blog-author.ts`
- `src/api/blog-author/routes/blog-author.ts`
- `src/api/blog-author/services/blog-author.ts`
- `src/api/blog-post/controllers/blog-post.ts`
- `src/api/blog-post/routes/blog-post.ts`
- `src/api/blog-post/services/blog-post.ts`
- `src/api/contact-submission/controllers/contact-submission.ts`
- `src/api/contact-submission/routes/contact-submission.ts`
- `src/api/contact-submission/routes/custom-contact-submission.ts`
- `src/api/course-application/controllers/course-application.ts`
- `src/api/course-application/routes/course-application.ts`
- `src/api/course-application/routes/custom-course-application.ts`
- `src/api/course/controllers/course.ts`
- `src/api/course/routes/course.ts`
- `src/api/course/services/course.ts`
- `src/api/event/controllers/event.ts`
- `src/api/event/routes/custom-event.ts`
- `src/api/event/routes/event.ts`
- `src/api/event/services/event.ts`
- `src/api/newsletter-subscription/routes/custom-newsletter-subscription.ts`
- `src/api/notification-routing/controllers/notification-routing.ts`
- `src/api/notification-routing/routes/notification-routing.ts`
- `src/api/notification-routing/services/notification-routing.ts`
- `src/api/registration/controllers/registration.ts`
- `src/api/registration/routes/custom-registration.ts`
- `src/api/registration/routes/registration.ts`
- `src/api/student/controllers/student.ts`
- `src/api/student/routes/student.ts`
- `src/api/student/services/student.ts`
- `src/api/teacher/controllers/teacher.ts`
- `src/api/teacher/routes/teacher.ts`
- `src/api/teacher/services/teacher.ts`
- `src/index.ts`
- `src/services/internal-notifications/keys.ts`
- `src/services/internal-notifications/types.ts`
- `src/services/spl-check/types.ts`

**Note:** Many of these "uncovered" files are Strapi-generated boilerplate (controllers, routes) that contain minimal logic. The meaningful uncovered business logic is in `src/api/blog-author/`, `src/api/blog-post/`, `src/api/course/`, `src/api/event/`, `src/api/student/`, `src/api/teacher/` services — these have zero test coverage.

### Known Failures

The 16 pre-existing failures documented in `backend/tests/FAILING_TESTS.md` all appeared during the coverage run. They fall into three categories:

| Category | Count | Root Cause | Impact on Coverage |
|----------|-------|-----------|-------------------|
| `contact-submission/service.test.ts` | 9 | Tests omit `kvkkConsent: true` field added after tests were written | Service coverage is understated (42.19%) because tests fail before reaching later assertions |
| `course-application/service.test.ts` | 1 | TCKN masking format changed (`*******0146` → `****`) | Minimal impact — single assertion failure |
| `registration/service.test.ts` | 2 | Same TCKN masking change | Minimal impact — single assertion failures |
| `spl-check/` (xml, adapter, service) | 4 | SOAP XML namespace parsing with `fast-xml-parser` | SPL service coverage is understated because tests fail before reaching later assertions |

**These failures are documented only — no fix plan is included in this report.**

---

## Frontend Coverage

### Test Results

| Metric | Value |
|--------|-------|
| Total `.test.mjs` files | 26 |
| Passed | 26 (129 subtests) |
| Failed | 0 |
| Total `.test.ts` files | 1 |
| Passed | 1 (2 subtests) |
| Failed | 0 |

### Coverage Summary (`.test.mjs` files)

| Metric | Percentage |
|--------|-----------|
| Lines | 99.50% |
| Branches | 95.57% |
| Functions | 100.00% |
| Statements | 99.50% |

### Coverage Summary (`responsive-layout.test.ts`)

| Metric | Percentage |
|--------|-----------|
| Lines | 100.00% |
| Branches | 83.33% |
| Functions | 91.67% |

### Methodology Caveat — CRITICAL

**The 99.50% coverage figure is misleading and must be interpreted correctly:**

1. **Source-analysis tests:** All 26 `.test.mjs` files use `readFileSync` to read source files as strings and assert on their content using `assert.match()`. They do NOT import or execute any application code (components, pages, utilities). They verify that certain strings exist in source files — nothing more.

2. **Coverage reflects test harness code:** Node's `--experimental-test-coverage` instruments the test files themselves. The 99.50% figure represents coverage of the test harness logic (import-time parsing, assertion calls), NOT coverage of the application source code.

3. **No application source files appear in coverage:** The coverage report shows only the test `.mjs` files and the runner script. No files from `src/app/`, `src/components/`, or `src/lib/` appear as covered modules because they are never imported — only read as strings.

4. **The `.test.ts` file is different:** `responsive-layout.test.ts` is a genuine runtime test that imports `responsiveLayoutClasses` from `responsive-layout.ts` and asserts on exported values. This test provides real coverage of the `responsive-layout.ts` module (100% lines, 83.33% branches, 91.67% functions). It runs via `tsx --test --experimental-test-coverage`.

### Per-File Coverage (Test Files)

| File | Lines | Branches | Functions |
|------|-------|----------|-----------|
| `scripts/run-tests-with-coverage.mjs` | 89.66% | 83.33% | 100.00% |
| `src/__tests__/about-cta-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/about-measurement-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/about-narrative-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/about-teacher-section-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/blog-detail-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/blog-discovery-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/blog-strapi-contract-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/content-testids-source.test.mjs` | 97.10% | 66.67% | 100.00% |
| `src/__tests__/event-detail-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/event-newsletter-fallback-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/events-list-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/form-testids-source.test.mjs` | 96.72% | 66.67% | 100.00% |
| `src/__tests__/home-hero-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/home-measurement-source.test.mjs` | 100.00% | 62.50% | 100.00% |
| `src/__tests__/home-narrative-order-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/intent-lead-form-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/intent-lead-links-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/lead-analytics-events-source.test.mjs` | 100.00% | 91.67% | 100.00% |
| `src/__tests__/route-testids-source.test.mjs` | 97.65% | 66.67% | 100.00% |
| `src/__tests__/site-shell-testids-source.test.mjs` | 97.26% | 66.67% | 100.00% |
| `src/__tests__/solution-partner-page-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/task-3-responsive-shells.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/teacher-detail-narrative-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/teacher-listing-contract-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/teacher-listing-page-source.test.mjs` | 100.00% | 100.00% | 100.00% |
| `src/__tests__/testids-source.test.mjs` | 100.00% | 100.00% | 100.00% |

### What the Frontend Tests Actually Cover

The 26 `.test.mjs` files verify the presence and correctness of specific strings in source files. They cover:

- **Route paths and labels** — verifying that route constants match expected URL patterns
- **Test IDs** — verifying that `data-testid` attributes exist in component source
- **Content strings** — verifying that specific Turkish text appears in page components
- **Component structure** — verifying that JSX contains expected class names and element types
- **Data contracts** — verifying that Strapi response shapes match expected field names

These tests provide **documentation-level confidence** that source files contain expected content, but **zero confidence** that the application renders correctly, handles user interactions, or manages state properly.

---

## End-to-End Coverage

### Current State

| Category | Status |
|----------|--------|
| E2E framework installed | None |
| E2E config files | None |
| E2E test files | None |
| Browser-test artifacts | None |
| E2E coverage | **0%** |

The monorepo has zero end-to-end test infrastructure. No Playwright, Cypress, Selenium, or any other browser-testing framework is installed in any `package.json` (root, frontend, or backend). No e2e config files, test files, or artifacts exist anywhere in the repository.

### Prioritized Route List for Future E2E Investment

#### High Priority (form submission flows)

| Route | Rationale | Suggested Test Coverage |
|-------|-----------|----------------------|
| `/etkinlikler/[slug]/kayit` | Registration form with backend submission — the most complex user interaction. Involves form validation, API POST to `/api/registrations/register`, upsert logic, and duplicate detection. | Fill registration form, submit, verify success; attempt duplicate registration and verify rejection; verify validation errors for empty/invalid inputs |
| `/iletisim` | Contact form — another form submission surface. Currently client-side only with no backend API. Prime candidate for e2e to catch regressions when backend is connected. | Fill contact form, submit, verify client-side validation; verify error states for invalid email/empty required fields |

#### Medium Priority (data-driven content pages)

| Route | Rationale | Suggested Test Coverage |
|-------|-----------|----------------------|
| `/egitimler` + `/egitimler/[slug]` | Courses listing and detail — data-driven content from Strapi. Tests verify correct rendering of course cards, navigation, and detail content. | Verify cards render with title/description/image; click card and verify navigation; verify 404 for invalid slugs |
| `/etkinlikler` + `/etkinlikler/[slug]` | Events listing and detail — data-driven with upcoming/past distinction. Critical path for the registration funnel. | Verify event cards with date/title; verify CTA links to registration form; verify 404 for invalid slugs |
| `/blog-yazilari` + `/blog-yazilari/[slug]` | Blog listing and detail — data-driven content. | Verify post cards with title/excerpt/date; verify navigation to detail; verify 404 for invalid slugs |
| `/egitmenler` + `/egitmenler/[slug]` | Teachers/instructors listing and detail — data-driven. | Verify instructor cards with name/title/image; verify navigation to detail; verify 404 for invalid slugs |

#### Low Priority (static content)

| Route | Rationale |
|-------|-----------|
| `/haberler` | News listing — primarily informational, low interaction complexity |
| `/hakkimizda` | About page — static content, no user interaction |
| `/cozum-ortagi` | Solution partner page — static or semi-static content |
| `/kvkk` | Privacy policy / KVKK page — static legal content |
| `/` | Marketing hero — static content with no forms or data fetching |

---

## Known Failures

The 16 pre-existing backend test failures are documented in detail in `backend/tests/FAILING_TESTS.md`. This section provides a summary only — no fix proposals are included.

| Test File | Failures | Root Cause |
|-----------|----------|------------|
| `tests/api/contact-submission/service.test.ts` | 9 | Tests omit `kvkkConsent: true` — field was added to service after tests were written |
| `tests/api/course-application/service.test.ts` | 1 | TCKN masking format changed (`*******0146` → `****`) |
| `tests/api/registration/service.test.ts` | 2 | Same TCKN masking change |
| `tests/services/spl-check/xml.test.ts` | 1 | SOAP XML namespace parsing issue with `fast-xml-parser` |
| `tests/services/spl-check/sap-soap-adapter.test.ts` | 2 | Same XML parsing issue propagating from utilities |
| `tests/services/spl-check/service.test.ts` | 1 | Same XML parsing issue propagating from adapter layer |

**Impact on coverage accuracy:** These failures cause tests to abort early, meaning later assertions and code paths in those files are never reached. The coverage numbers for `contact-submission` (42.19% lines) and `spl-check` services are understated as a result.

---

## Infrastructure Changes Made

During this analysis, the following infrastructure was added to enable coverage collection:

### Backend

- **`backend/vitest.config.ts`** — Created Vitest configuration with v8 coverage provider, text/json/html/clover reporters, output to `./coverage/`
- **`backend/package.json`** — Added `"test:coverage": "vitest run --coverage || true"` script (the `|| true` tolerates the 16 known failures)
- **`backend/node_modules`** — Installed `@vitest/coverage-v8` (v4.1.5) and `@vitest/coverage-istanbul` (v4.1.5) as devDependencies

### Frontend

- **`frontend/scripts/run-tests-with-coverage.mjs`** — Created aggregator runner that dynamically `import()`s all 26 `.test.mjs` files sequentially within a single Node process for aggregated coverage
- **`frontend/package.json`** — Added `"test:coverage": "node --experimental-test-coverage --test-reporter=spec scripts/run-tests-with-coverage.mjs"` script

---

## Recommendations

### Comprehensive Roadmap

#### 1. Add End-to-End Testing Framework (High Priority)

**Recommendation:** Install Playwright and create e2e tests for the highest-value routes first.

**Rationale:** Zero e2e coverage is the single largest testing gap. Form submission flows (registration, contact) are the most complex user interactions and the most likely to regress.

**Suggested approach:**
- Install `@playwright/test` in the frontend or root `package.json`
- Create `frontend/e2e/` directory with tests for `/etkinlikler/[slug]/kayit` and `/iletisim`
- Use the existing `data-testid` attributes (verified by the source-analysis tests) as selectors
- Run against the production-like build (`next build && next start`) with the backend running

**Estimated effort:** 2-3 days for initial setup + registration flow; 1-2 days for contact form.

#### 2. Add Test Runner Script for Frontend Tests (High Priority)

**Recommendation:** Add a `"test"` script to `frontend/package.json` that runs the `.test.mjs` files without coverage (for fast feedback during development).

**Status:** The `test:coverage` script exists. A plain `"test"` script should be added:
```json
"test": "node --test --test-reporter=spec scripts/run-tests-with-coverage.mjs"
```

**Rationale:** Developers need a fast feedback loop. The coverage flag adds overhead (~1-2s) that is unnecessary during active development.

**Estimated effort:** 5 minutes.

#### 3. Convert Frontend Source-Analysis Tests to Runtime Component Tests (Medium Priority)

**Recommendation:** Migrate the 26 `.test.mjs` source-analysis tests to proper runtime tests using Vitest (already in the monorepo) or a React Testing Library setup.

**Rationale:** The current tests provide documentation-level confidence but zero runtime coverage. Converting them would:
- Provide real coverage metrics for frontend code
- Catch actual regressions (not just string-content changes)
- Enable meaningful coverage thresholds

**Suggested approach:**
- Install `@testing-library/react` and `jsdom` in the frontend
- Add Vitest config for frontend with jsdom environment
- Rewrite source-analysis tests as component tests that render components and assert on DOM output
- Keep the source-analysis tests as a secondary safety net during migration

**Estimated effort:** 3-5 days for full migration (26 test files).

#### 4. Add CI Pipeline with Test Execution on PRs (Medium Priority)

**Recommendation:** Add a GitHub Actions workflow (or equivalent) that runs:
- `npm run lint` across both packages
- `npm run test:coverage` for backend (tolerating known failures)
- `npm run test:coverage` for frontend
- Optional: e2e tests once Playwright is added

**Rationale:** Without CI, test failures go unnoticed until someone runs tests locally. CI ensures tests are run on every PR.

**Estimated effort:** 1 day for initial setup.

#### 5. Fix 16 Known Backend Test Failures (Medium Priority)

**Recommendation:** Fix the 16 pre-existing failures to achieve a clean test run.

**Rationale:** Failing tests reduce confidence in the test suite and understate coverage numbers. Developers learn to ignore test output when failures are expected.

**Breakdown:**
- 9 `kvkkConsent` failures: Add `kvkkConsent: true` to test inputs (5 minutes)
- 3 TCKN masking failures: Update expected values to match new masking format (5 minutes)
- 4 SPL/SOAP XML failures: Investigate `fast-xml-parser` namespace handling (1-2 hours)

**Estimated effort:** 2-3 hours total.

#### 6. Set Coverage Thresholds for Backend (Low Priority)

**Recommendation:** Once the 16 failures are fixed, set coverage thresholds in `vitest.config.ts`:
```typescript
coverage: {
  thresholds: {
    lines: 70,
    branches: 60,
    functions: 70,
    statements: 70,
  },
}
```

**Rationale:** Thresholds prevent coverage from regressing. The current 62.50% lines would need improvement to reach 70%, but this is achievable by adding tests for the uncovered service files.

**Estimated effort:** 30 minutes to configure; ongoing maintenance.

#### 7. Add Coverage Collection for Frontend Runtime Tests (Low Priority)

**Recommendation:** Once frontend tests are migrated to Vitest (recommendation #3), configure Vitest coverage collection for frontend code.

**Rationale:** The current `--experimental-test-coverage` approach only instruments test files, not application code. Vitest's coverage would instrument actual components and provide meaningful metrics.

**Estimated effort:** Part of recommendation #3.

#### 8. Expand Backend Test Coverage for Uncovered Modules (Low Priority)

**Recommendation:** Add tests for the uncovered service files:
- `src/api/blog-author/services/blog-author.ts`
- `src/api/blog-post/services/blog-post.ts`
- `src/api/course/services/course.ts`
- `src/api/event/services/event.ts`
- `src/api/student/services/student.ts`
- `src/api/teacher/services/teacher.ts`

**Rationale:** These are the meaningful business logic files with zero coverage. The other uncovered files (controllers, routes) are Strapi boilerplate with minimal logic.

**Estimated effort:** 2-3 hours per service file.

#### 9. Add E2E Coverage for Remaining Routes (Low Priority)

**Recommendation:** After the high-priority e2e tests are in place (recommendation #1), expand coverage to medium and low priority routes.

**Rationale:** Comprehensive e2e coverage provides the highest confidence in application correctness but has the highest maintenance cost. Prioritize form flows first.

**Estimated effort:** 1-2 days for all remaining routes.

---

## Appendix: How to Run Coverage

### Backend

```bash
cd backend
npm run test:coverage
```

Coverage output: Printed to stdout. Note: Due to the 16 known test failures causing a non-zero exit code, Vitest does not write HTML/JSON coverage reports to disk. Coverage data is only available via the text reporter in stdout. Once the 16 failures are fixed, HTML reports will be generated at `backend/coverage/index.html`.

### Frontend

```bash
cd frontend
npm run test:coverage
```

Coverage output: Printed to stdout (Node's `--experimental-test-coverage` does not generate HTML reports).

To run the single `.test.ts` file with coverage:
```bash
cd frontend
npx tsx --test --experimental-test-coverage src/components/content/responsive-layout.test.ts
```

### All Tests (from repo root)

```bash
# Backend
cd backend && npm run test:coverage

# Frontend
cd frontend && npm run test:coverage
```
