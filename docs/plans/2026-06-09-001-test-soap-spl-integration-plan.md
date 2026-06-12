---
title: "test: SOAP/SPL integration and event registration field-requirement contract"
type: fix
status: active
date: 2026-06-09
origin: docs/superpowers/specs/2026-04-21-sap-soap-integration.md
---

# test: SOAP/SPL integration and event registration field-requirement contract

## Summary

Two related gaps addressed together. First: adds an HTTP-level integration test for the SAP SOAP adapter, fills unit-test gaps in the adapter and config layers, and fixes a mock-pattern mismatch in the `course-application` service test. Second: fixes a null-safety bug in the event-type field-requirement guards (both backend service and frontend hook) where `null`/`undefined` eventType incorrectly triggered TCKN validation, then adds a full contract test matrix for all three event types (etkinlik / egitim / kurs) to lock down which fields are required for which event.

---

## Problem Frame

**SOAP/SPL layer:** The existing test suite covers the XML layer and the fetch-mocked adapter thoroughly, but has no test that exercises real HTTP I/O. Three behavioral paths in the adapter (HTTP error responses, `Reference` element enrichment, `maxAttempts` override) are also untested at the unit level. One course-application service test has been failing since the notification delivery was refactored from plugin-dispatch to direct module import — the mock targets the old pattern and `deliverFn` is never invoked.

**Event registration field requirements:** The backend registration service and the frontend hook both gate TCKN and KVKK requirements using negative matching (`eventType !== 'etkinlik'`). When `eventType` is `null` or `undefined` — possible for legacy Strapi records or when the field is not populated — the condition evaluates as `true` and TCKN validation fires unexpectedly, blocking registration. This was reported as a real user-facing registration failure. The field requirement contract (which fields are required for which event type) has no dedicated test coverage, meaning a future accidental change would go undetected.

---

## Requirements

- R1. A test that uses a real in-process HTTP server proves the SOAP adapter handles accepted, rejected, HTTP-error, and malformed-Status responses correctly end-to-end.
- R2. Adapter unit tests cover HTTP non-2xx errors and `Reference` element enrichment.
- R3. Adapter unit tests cover `maxAttempts` override and absence of `SOAPAction` header.
- R4. Config unit tests cover `SAP_SOAP_ENDPOINT` fallback, `SPL_CHECK_TIMEOUT_MS`, and `SPL_CHECK_SOAP_ACTION`.
- R5. The failing course-application service test ("creates an application, maps an accepted SPL result...") passes after the notification mock is corrected.
- R6. The backend registration service uses positive matching for event-type guards so that `null`/`undefined` eventType never triggers TCKN or KVKK validation (safe default = etkinlik behavior).
- R7. The frontend hook `requiresTckn` also uses positive matching, consistent with `requiresKvkkConsent` which was already correct.
- R8. A dedicated test suite documents and locks down the field-requirement contract for all three event types and the null case.
- R9. The three failing `registration/service.test.ts` tests pass after the null-safety fix and notification mock correction.

---

## Scope Boundaries

- Does not fix the `internal-notifications` test drift (`service-core.test.ts`, `strapi-service.test.ts`) — those tests describe abandoned role-based recipient resolution and the old plugin-dispatch pattern; that is a separate clean-up.
- Does not add timeout/retry to the HTTP integration test — those paths are better tested with mocked `fetch` since they require timing control (exponential backoff `setTimeout`). Unit tests already cover them.
- Frontend field-requirement fix is a one-line change (positive matching); no wider frontend refactor.
- Does not add frontend component tests (no JSDOM harness available in the Node test runner setup).

### Deferred to Follow-Up Work

- Fix `internal-notifications` test drift (6 failing tests): update `strapi-service.test.ts` to match current direct-import architecture; remove/update role-recipient tests in `service-core.test.ts` that describe unimplemented behavior — separate session.
- Fix cascading notification mock failures in `contact-submission/service.test.ts` (same internal-notifications drift as above) — separate session after internal-notifications fix lands.
- `registration/service.test.ts` three failures ARE fixed in this plan (U5 removes the null-eventType TCKN error; U7 adds the correct notification mock).

---

## Context & Research

### Relevant Code and Patterns

- Adapter: `backend/src/services/spl-check/sap-soap-adapter.ts` — `runSapSoapSplCheck({ endpoint, requestXml, timeoutMs, soapAction?, fetchImpl?, maxAttempts? })`; HTTP error path (`!response.ok`) is untested; `Reference` enrichment on both rejection and HTTP error is untested; `maxAttempts=1` behavior is untested.
- Config: `backend/src/services/spl-check/config.ts` — `loadSplCheckConfig` reads `SPL_CHECK_ENDPOINT ?? SAP_SOAP_ENDPOINT`, `SPL_CHECK_TIMEOUT_MS`, `SPL_CHECK_SOAP_ACTION`; only the missing-endpoint path is currently tested.
- Existing unit tests to extend: `backend/tests/services/spl-check/sap-soap-adapter.test.ts`, `backend/tests/services/spl-check/service.test.ts`.
- Failing test to fix: `backend/tests/api/course-application/service.test.ts` line 211 — `deliverFn` assertion fails because the test mocks `strapi.plugin('internal-notifications')` but the service imports `deliverInternalNotificationViaStrapi` directly from `services/internal-notifications/strapi-service`.
- Notification import in service: `backend/src/api/course-application/services/course-application.ts` — `import { deliverInternalNotificationViaStrapi } from "../../../services/internal-notifications/strapi-service"`.
- Pattern reference for module mock: `course-application/service.test.ts` already mocks `runSplCheck` via `vi.mock("../../../src/services/spl-check/service", ...)` — apply the same pattern for `deliverInternalNotificationViaStrapi`.
- HTTP server pattern: Node built-in `node:http` `createServer` + `server.listen(0)` (random port) + `server.address()` for the port; `beforeAll`/`afterAll` for lifecycle; standard in Vitest.
- Null-safety bug: `backend/src/api/registration/services/registration.ts` line 53 — `event.eventType !== 'etkinlik'` evaluates `true` for `null`/`undefined`; fix: change to `event.eventType === 'egitim' || event.eventType === 'kurs'`. Same negative-match pattern exists for KVKK at line 62 (`event.eventType === 'egitim' || event.eventType === 'kurs'`) — already correct, no change needed there.
- Frontend hook bug: `frontend/src/hooks/use-event-registration-form.ts` line 87 — `requiresTckn = eventType !== "etkinlik"` evaluates `true` for `undefined`; fix: `requiresTckn = eventType === "egitim" || eventType === "kurs"` (matches the already-correct `requiresKvkkConsent` pattern on line 84).
- Registration test failures root cause: `backend/tests/api/registration/service.test.ts` — mock events have no `eventType` field → `undefined !== 'etkinlik'` → TCKN validation triggers → `"12345678901"` (invalid checksum) throws before notification step. Secondary cause: tests use old `strapi.plugin('internal-notifications')` mock pattern instead of module-level mock for `deliverInternalNotificationViaStrapi`.
- Event-type field-requirement matrix (spec): etkinlik → no TCKN, no KVKK; egitim → TCKN required, KVKK required; kurs → TCKN required, KVKK required; null/undefined → same as etkinlik (safe default).

### External References

- `node:http` `createServer` + `listen(0)` for random-port test servers — standard Node.js pattern, no external dependency needed.

---

## Key Technical Decisions

- **`node:http` test server, not `msw` or `nock`**: `msw` requires a service worker or Node adapter install; `nock` patches `http.request` globally. The `node:http` server is zero-dependency and proves real socket I/O without monkey-patching. The adapter's `fetch` is the global `fetch` (Node 22), which goes through real sockets — a `node:http` server exercises the full path.
- **HTTP integration test file separate from unit tests**: Keeps the `sap-soap-adapter.test.ts` unit tests fast and free of async server lifecycle; integration test can have a higher timeout if needed.
- **`deliverInternalNotificationViaStrapi` mocked at module level**: Matching the existing `runSplCheck` mock pattern — clean and isolates the course-application service from the notification delivery internals.

---

## Implementation Units

### U1. Add SOAP HTTP integration test

**Goal:** Prove the full SOAP adapter HTTP I/O path — real fetch, real sockets, real XML parsing — with an in-process test server.

**Requirements:** R1

**Dependencies:** None

**Files:**
- Create: `backend/tests/services/spl-check/http-integration.test.ts`

**Approach:**
- `beforeAll`: `createServer((req, res) => handler(req, res))`, `listen(0, '127.0.0.1')`, derive `endpoint = http://127.0.0.1:${port}`
- `afterAll`: `server.close()`
- Per-test: reassign `handler` to control the response for each scenario
- Call `runSapSoapSplCheck({ endpoint, requestXml: '<soap />', timeoutMs: 2000 })` directly — no `fetchImpl` injection, uses real `fetch`
- Verify the request the server received (method `POST`, Content-Type header, body non-empty) in the accepted test

**Patterns to follow:**
- `backend/tests/services/spl-check/sap-soap-adapter.test.ts` for the `runSapSoapSplCheck` call shape and result assertions.

**Test scenarios:**
- Happy path: server returns `<Status>10</Status>` → `decision: "accepted"`, `statusCode: "10"`, server received POST with `Content-Type: text/xml; charset=utf-8`
- Rejected: server returns `<Status>42</Status>` → `decision: "rejected"`, `statusCode: "42"`, `errorReason` contains `"42"`
- HTTP error (500): server returns status 500 with empty body → `decision: "manual_review"`, `errorReason` contains `"500"`
- Missing Status: server returns `<soap:Envelope />` (no Status element) → `decision: "manual_review"`, `errorReason` contains `"did not contain a Status value"`
- SOAPAction header forwarded: call with `soapAction: "test-action"`, verify server received `SOAPAction: test-action` header

**Verification:**
- `npx vitest run tests/services/spl-check/http-integration.test.ts` passes all 5 tests
- Tests use real `node:http` — no `fetchImpl` injection

---

### U2. Fill sap-soap-adapter unit test gaps

**Goal:** Cover HTTP error responses, `Reference` enrichment, `maxAttempts` override, and missing `SOAPAction`.

**Requirements:** R2, R3

**Dependencies:** None

**Files:**
- Modify: `backend/tests/services/spl-check/sap-soap-adapter.test.ts`

**Approach:** Append new `it` blocks to the existing `describe` — same mock pattern.

**Test scenarios:**
- HTTP error no Reference: `ok: false, status: 500`, body `<soap:Envelope />` → `decision: "manual_review"`, `errorReason: "SOAP request failed with HTTP 500"`
- HTTP error with Reference: `ok: false, status: 403`, body `<Reference>ACCESS-DENIED</Reference>` → `errorReason` contains `"ACCESS-DENIED"`
- Rejected with Reference: `ok: true, status: 200`, body contains `<Status>88</Status><Reference>REF-88</Reference>` → `decision: "rejected"`, `errorReason` contains `"REF-88"`
- `maxAttempts: 1` — network error → `fetchImpl` called exactly once (no retry), `decision: "manual_review"`
- No SOAPAction — call without `soapAction` → fetch called with headers that do NOT contain a `SOAPAction` key

**Verification:**
- `npx vitest run tests/services/spl-check/sap-soap-adapter.test.ts` shows existing 4 + new 5 = 9 passing

---

### U3. Fill config/service unit test gaps

**Goal:** Verify the three untested environment variable paths in `loadSplCheckConfig`.

**Requirements:** R4

**Dependencies:** None

**Files:**
- Modify: `backend/tests/services/spl-check/service.test.ts`

**Approach:** Use `vi.stubEnv` (already used in existing test) to set each variable and assert the resolved config is forwarded to the adapter. Because the service passes config to the adapter via `fetchImpl` injection, mock `fetchImpl` and capture the `fetch` call to verify `endpoint`, `headers.SOAPAction`, and that a non-15000 timeout is applied (verified indirectly via the `AbortController` — too tight to test exactly, but endpoint and SOAPAction are directly observable).

Simpler approach: test `loadSplCheckConfig` directly for `SAP_SOAP_ENDPOINT` fallback and `SPL_CHECK_TIMEOUT_MS`; test `runSplCheck` for `SPL_CHECK_SOAP_ACTION` forwarding via the fetch call's headers.

**Test scenarios:**
- `SAP_SOAP_ENDPOINT` fallback: stub `SPL_CHECK_ENDPOINT=""`, `SAP_SOAP_ENDPOINT="https://sap.example.com"` → `loadSplCheckConfig()` returns `endpoint: "https://sap.example.com"`
- `SPL_CHECK_TIMEOUT_MS`: stub value `"5000"` → `loadSplCheckConfig()` returns `timeoutMs: 5000`
- `SPL_CHECK_SOAP_ACTION`: stub `SPL_CHECK_ENDPOINT="https://sap.example.com"`, `SPL_CHECK_SOAP_ACTION="MySoapAction"` → `runSplCheck(request)` calls fetch with `SOAPAction: "MySoapAction"` header

**Patterns to follow:**
- `vi.stubEnv` / `vi.unstubAllGlobals()` already in `service.test.ts`
- Import `loadSplCheckConfig` from `../../../src/services/spl-check/config` for the direct config tests

**Verification:**
- `npx vitest run tests/services/spl-check/service.test.ts` shows existing 3 + new 3 = 6 passing

---

### U4. Fix course-application service test notification mock

**Goal:** Make the failing "creates an application, maps an accepted SPL result..." test pass by mocking `deliverInternalNotificationViaStrapi` at the module level instead of through `strapi.plugin('internal-notifications')`.

**Requirements:** R5

**Dependencies:** None

**Files:**
- Modify: `backend/tests/api/course-application/service.test.ts`

**Approach:**
- Add at the top of the file (alongside the existing `vi.mock` for `runSplCheck`):
  ```
  vi.mock("../../../src/services/internal-notifications/strapi-service", () => ({
    deliverInternalNotificationViaStrapi: deliverFn,
  }));
  ```
- The `deliverFn` variable already exists and is already used in assertions — no other changes needed.
- Remove or simplify the `strapi.plugin` mock in `createStrapiMock` since it no longer needs to handle `internal-notifications`.

**Patterns to follow:**
- Existing `vi.mock("../../../src/services/spl-check/service", ...)` at the top of the same file — identical pattern.

**Test scenarios:**
- No new test scenarios — this is a mock fix. The existing test at line 44 should now pass.
- Confirm `deliverFn` is called with `key: "course_payment_pending"` and TCKN masked as `"****"` in the payload.

**Verification:**
- `npx vitest run tests/api/course-application/service.test.ts` shows all 12 tests passing (was 1 failing).

---

### U5. Fix null-safe event-type guards (production fix)

**Goal:** Eliminate the user-facing registration failure where `etkinlik` events incorrectly triggered TCKN validation by switching from negative to positive matching in both backend and frontend.

**Requirements:** R6, R7

**Dependencies:** None

**Files:**
- Modify: `backend/src/api/registration/services/registration.ts`
- Modify: `frontend/src/hooks/use-event-registration-form.ts`

**Approach:**

Backend (`registration.ts` line 53): Change the TCKN guard from negative matching to positive:
```
// Before (broken): event.eventType !== 'etkinlik'
// After (fix):     event.eventType === 'egitim' || event.eventType === 'kurs'
```
The KVKK guard at line 62 already uses positive matching (`event.eventType === 'egitim' || event.eventType === 'kurs'`) — no change needed there.

Frontend (`use-event-registration-form.ts` line 87): Apply the same pattern to `requiresTckn`:
```
// Before (broken): requiresTckn = eventType !== "etkinlik"
// After (fix):     requiresTckn = eventType === "egitim" || eventType === "kurs"
```
The `requiresKvkkConsent` on line 84 already uses positive matching — no change needed there.

Both fixes make `null`/`undefined` eventType behave like `etkinlik` (the safe default: no TCKN, no KVKK required).

**Verification:**
- `npx vitest run tests/api/registration/` passes (all formerly-failing tests that blocked on null eventType now pass, addressed further in U7)
- `npm run build:frontend` passes (no TypeScript errors)

---

### U6. Add event-type field-requirement contract tests

**Goal:** Lock down the field-requirement matrix for all three event types and the null case so that any future accidental regression is caught immediately.

**Requirements:** R8

**Dependencies:** U5 (backend null-safety fix must be in place before these tests can pass)

**Files:**
- Create: `backend/tests/api/registration/field-requirements.test.ts`

**Approach:**

Import the registration service directly and exercise `registerForEvent` with a mocked strapi. Each test varies only the event's `eventType` and the submitted field values to isolate the field-requirement guard logic from unrelated service behavior (notification dispatch, duplicate check).

Mock shape: a minimal `strapi` stub with `db.query` returning a mock event and a mock student (both found). Notification delivery should be mocked at module level (`vi.mock` for `deliverInternalNotificationViaStrapi`) so notification failures don't interfere. The idempotent-check query should return `null` (no existing registration).

**Test scenarios (field-requirement matrix):**

| eventType | TCKN | kvkkConsent | Expected |
|-----------|------|-------------|----------|
| `etkinlik` | absent | absent | succeeds (no TCKN/KVKK required) |
| `egitim` | `"10000000078"` (valid) | `true` | succeeds |
| `kurs` | `"10000000078"` (valid) | `true` | succeeds |
| `egitim` | absent / `""` | `true` | throws — TCKN required |
| `egitim` | `"10000000078"` (valid) | `false` | throws — kvkkConsent required |
| `kurs` | absent / `""` | `true` | throws — TCKN required |
| `kurs` | `"10000000078"` (valid) | `false` | throws — kvkkConsent required |
| `null` | absent | absent | succeeds (null treated as etkinlik — safe default) |
| `undefined` | absent | absent | succeeds (undefined treated as etkinlik — safe default) |

Use a valid Turkish TCKN (`"10000000078"`) for success cases. This value was verified against the checksum algorithm in `backend/src/utils/tckn.ts`.

**Patterns to follow:**
- `backend/tests/api/registration/service.test.ts` for the `registerForEvent` call shape and strapi mock structure

**Verification:**
- `npx vitest run tests/api/registration/field-requirements.test.ts` passes all 9 tests

---

### U7. Fix registration service test notification mock

**Goal:** Make the three currently-failing `registration/service.test.ts` tests pass by (a) adding `eventType` to mock events so the U5 fix can resolve correctly, and (b) replacing the old `strapi.plugin('internal-notifications')` mock with a module-level mock for `deliverInternalNotificationViaStrapi`.

**Requirements:** R9

**Dependencies:** U5 (null-safety fix must be in place; without it, adding eventType alone may still cause TCKN errors on the wrong event type)

**Files:**
- Modify: `backend/tests/api/registration/service.test.ts`

**Approach:**

1. Add `vi.mock` at the top of the file (alongside any existing module mocks):
   ```
   vi.mock("../../../src/services/internal-notifications/strapi-service", () => ({
     deliverInternalNotificationViaStrapi: vi.fn().mockResolvedValue(undefined),
   }));
   ```
2. For each mock event object in the test helpers, add `eventType: "etkinlik"` so the positive-matching guard from U5 evaluates correctly (no TCKN/KVKK required for these tests).
3. Remove or simplify the `strapi.plugin('internal-notifications')` mock in any `createStrapiMock` helper — it is no longer needed for notification delivery.

The three currently-failing tests all follow the happy-path or notification-resilience flow; they fail because `undefined !== 'etkinlik'` triggers TCKN validation on `"12345678901"` (a deliberately short/invalid TCKN used in those tests). With eventType set and the notification mock at module level, all three should pass.

**Patterns to follow:**
- `backend/tests/api/course-application/service.test.ts` for the `vi.mock` module-level notification pattern (the same fix applied in U4)

**Verification:**
- `npx vitest run tests/api/registration/service.test.ts` passes all 5 tests (was 3 failing)

---

## System-Wide Impact

- **Production source changes:** U5 touches two files — `backend/src/api/registration/services/registration.ts` (one-line guard change) and `frontend/src/hooks/use-event-registration-form.ts` (one-line guard change). All other production files are unchanged.
- **Test isolation:** The HTTP integration test uses a random port via `listen(0)` — no port collisions with other tests or the dev server.
- **Existing test count:** Current baseline is 15 failing / 124 passing. After all 7 units: expect 7 failing / 150 passing.
  - Fixed: course-application 1 (U4) + registration 3 (U5+U7) = 4 fixed
  - New passing: U1 adds 5, U2 adds 5, U3 adds 3, U6 adds 9 = 22 new tests
  - Remaining failures: analytics-event 2 + internal-notifications 6 + contact-submission 3 = 11 (deferred per Scope Boundaries)

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `node:http` test server adds async lifecycle complexity | Use `beforeAll`/`afterAll` with Promise-based `listen` and `close` — standard Vitest pattern |
| Random port `listen(0)` may not be available in CI sandbox | All CI environments allow localhost random-port binding; no firewall concern for loopback |
| Worktree test contamination (`.kilo/worktrees/` tests picked up by Vitest) | Out of scope for this plan; addressed by adding `exclude` to `vitest.config.ts` separately |
| Valid TCKN needed for U6 test cases | Use `"10000000078"` — verified against the checksum algorithm in `backend/src/utils/tckn.ts` |
| U6 depends on U5 | Sequence U5 before U6 in implementation; run U6 tests only after the null-safety fix is in place |

---

## Sources & References

- **Origin document:** [docs/superpowers/specs/2026-04-21-sap-soap-integration.md](docs/superpowers/specs/2026-04-21-sap-soap-integration.md)
- Related plan: [docs/plans/2026-04-24-001-feat-decoupled-spl-check-plan.md](docs/plans/2026-04-24-001-feat-decoupled-spl-check-plan.md)
- Source under test: [backend/src/services/spl-check/sap-soap-adapter.ts](backend/src/services/spl-check/sap-soap-adapter.ts)
- Source under test: [backend/src/services/spl-check/config.ts](backend/src/services/spl-check/config.ts)
- Source fixed: [backend/src/api/registration/services/registration.ts](backend/src/api/registration/services/registration.ts)
- Source fixed: [frontend/src/hooks/use-event-registration-form.ts](frontend/src/hooks/use-event-registration-form.ts)
- Failing test to fix: [backend/tests/api/course-application/service.test.ts](backend/tests/api/course-application/service.test.ts)
- Failing tests to fix: [backend/tests/api/registration/service.test.ts](backend/tests/api/registration/service.test.ts)
- Existing test baseline: [backend/tests/FAILING_TESTS.md](backend/tests/FAILING_TESTS.md)
