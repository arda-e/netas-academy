# Failing Test Analysis

**Date:** 2026-05-03
**Branch:** wave4-integration
**Test run:** `npm run test` (vitest run)
**Results:** 2 failed / 105 passed / 107 total (1 test file failed / 23 total)

---

## Remaining Failures (2 tests in 1 file)

### `tests/api/analytics-event/routes.test.ts` — 2 failures

**Root cause:** The analytics-event controller sets `ctx.body = { error: { ... } }` instead of throwing an Error. The test asserts `rejects.toThrow(...)`, but the controller resolves the promise with the error assigned to `ctx.body`. This is a pre-existing controller pattern mismatch — Strapi controllers typically set `ctx.body` directly rather than throwing, and the test was written expecting thrown errors.

**Resolution:** Either refactor the controller to throw errors and let Strapi handle them, or update the tests to assert against `ctx.body` instead of expecting rejection. Both approaches require careful consideration of Strapi's error handling conventions. Defer to a future error-handling normalization pass.

| Test | Error |
|------|-------|
| rejects unknown eventType | promise resolved "undefined" instead of rejecting |
| rejects unknown eventId | promise resolved "undefined" instead of rejecting |

---

## Resolved Failures

All failures documented in the 2026-04-28 baseline have been resolved:

| Category | Count | Resolution |
|----------|-------|------------|
| contact-submission kvkkConsent | 9 | FIXED — test inputs include `kvkkConsent: true` |
| TCKN masking (registration + course-application) | 3 | FIXED — test values match updated masking behavior |
| SPL/SOAP XML parsing | 4 | FIXED — XML parser depth limit and namespace handling resolved |
| blog-author schema | 1 | FIXED — test uses `.toMatchObject()` with separate assertion for `targetField` |

## Summary

| Metric | Value |
|--------|-------|
| Total tests | 107 |
| Passed | 105 |
| Failed | 2 |
| Test files | 23 (22 pass, 1 fail) |
| New regressions | 0 |
| Pre-existing failures | 2 (analytics-event controller pattern) |
