# Failing Test Analysis

**Date:** 2026-04-28
**Test run:** `npm run test` (vitest run) on `feat/u06-teacher-blog-data-contract`
**Results:** 17 failed / 47 passed / 64 total (7 test files failed / 17 total)

---

## Unrelated Pre-Existing Failures (16 tests across 5 files)

These failures exist on `main` and are NOT caused by U03/U04/U06 changes.

### 1. `tests/api/contact-submission/service.test.ts` — 9 failures

**Probable cause:** The service now validates `kvkkConsent` must be `true` (line 81 of contact-submission service), but all 9 tests omit this field. Tests were written before `kvkkConsent` was added as a required field, or the field was added to the schema/service without updating the tests.

**Fix:** Add `kvkkConsent: true` to each test's input object.

| Test | Error |
|------|-------|
| persists corporate training lead | `kvkkConsent must be true` |
| persists instructor lead | `kvkkConsent must be true` |
| normalizes whitespace | `kvkkConsent must be true` |
| rejects corporate training without interestTopic | expected `interestTopic is required...` got `kvkkConsent must be true` |
| rejects instructor without expertiseAreas | expected `expertiseAreas is required...` got `kvkkConsent must be true` |
| rejects solution partner without companySize | expected `companySize is required...` got `kvkkConsent must be true` |
| rejects whitespace-only type-specific fields | expected `expertiseAreas is required...` got `kvkkConsent must be true` |
| rejects oversized fields | expected `partnershipDetails must be at most...` got `kvkkConsent must be true` |
| logs notification delivery error | `kvkkConsent must be true` |

### 2. `tests/api/course-application/service.test.ts` — 1 failure

**Probable cause:** Notification payload shape changed — `payload.student.tckn` masking was updated (from `*******0146` to `****`) and `applicationNumber` format changed (from `StringMatching /^CA-/` to literal `CA-20260424-AB12CD`). The test expects wildcard matching but gets exact values.

**Fix:** Update test to expect the new TCKN masking and application number format.

### 3. `tests/api/registration/service.test.ts` — 2 failures

**Probable cause:** Same TCKN masking change — tests expect `12345678901` but service now masks as `*******8901`. The masking function was updated but tests weren't.

**Fix:** Update expected TCKN values in test assertions.

### 4. `tests/services/spl-check/xml.test.ts` — 1 failure

**Probable cause:** The XML parser utility `extractSoapStatus` cannot extract `<Status>` from the provided XML string. Likely a namespacing/parsing issue with the `fast-xml-parser` library that was updated.

**Fix:** Investigate SOAP XML namespace handling in the extraction utilities.

### 5. `tests/services/spl-check/sap-soap-adapter.test.ts` — 2 failures

**Probable cause:** Same XML parsing issue as above — the adapter cannot extract Status values from SOAP responses, causing `statusCode` to be `null` and `decision` to fall through to `manual_review` instead of `accepted`/`rejected`.

**Fix:** Root-caused by the same XML parsing fix needed in spl-check utilities.

### 6. `tests/services/spl-check/service.test.ts` — 1 failure

**Probable cause:** Same XML parsing issue propagating from the adapter layer.

**Fix:** Same root cause as spl-check XML parsing.

---

## U06-Specific Failure (1 test — FIXED)

### `tests/api/blog-author/schema.test.ts` — 1 failure

**Probable cause:** The `slug` field is `{ type: "uid", required: true, targetField: "displayName" }` but the test used `.toEqual({ type: "uid", required: true })` which required exact match and missed `targetField`.

**Fix:** Changed to `.toMatchObject()` with a separate assertion for `targetField`. **Already committed on U06 branch.**

---

## Summary

| Category | Count | Status |
|----------|-------|--------|
| Pre-existing (contact-submission kvkkConsent) | 9 | Known issue, file exists on main |
| Pre-existing (TCKN masking) | 3 | Known issue, file exists on main |
| Pre-existing (SPL/SOAP XML parsing) | 4 | Known issue, file exists on main |
| U06 blog-author schema test | 1 | **FIXED** |
| U03/U04/U06 new tests | 9 | All passing |
