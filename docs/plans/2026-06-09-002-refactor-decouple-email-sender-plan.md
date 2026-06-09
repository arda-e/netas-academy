---
title: "refactor: Decouple email sending from Strapi plugin"
type: refactor
status: active
date: 2026-06-09
---

# refactor: Decouple email sending from Strapi plugin

## Summary

Introduces an `EmailSender` interface and a thin Strapi adapter so that all email-sending services call a typed abstraction instead of `strapi.plugin('email').service('email').send(...)` directly. The four active call sites — `confirmation-service.ts`, `manual-email-service.ts`, and the two internal-notifications wiring files — are updated to receive an injected `EmailSender`. A deprecated email path (`event/services/event.ts`) is removed in the same pass. When the team later migrates away from Strapi, swapping the email provider requires replacing one adapter file; no service logic changes.

---

## Problem Frame

Every current email send is a hard dependency on Strapi's plugin registry: `strapi.plugin('email').service('email').send(...)`. This coupling means migrating the email transport (to a direct SMTP client, Brevo SDK, Resend, etc.) requires touching every service that sends email. The `service-core.ts` pattern for internal-notifications already shows the correct architecture — Strapi-agnostic core + thin adapter — but email sending was not structured the same way when the iletisim-merkezi plugin was built.

---

## Requirements

- R1. A typed `EmailSender` interface and `EmailMessage` type exist in a standalone module importable by any backend code.
- R2. A Strapi adapter implements `EmailSender` by delegating to `strapi.plugin('email').service('email').send(...)` — this adapter is the single file to replace when migrating away from Strapi email.
- R3. `confirmation-service.ts` and `manual-email-service.ts` call `emailSender.send()` only — no `strapi.plugin('email')` anywhere in those files.
- R4. Both iletisim-merkezi services receive the `emailSender` as an injected parameter; the Strapi adapter is wired at the plugin's service-registration layer, not inside the service factories.
- R5. `internal-notifications/server/services/index.ts` and `internal-notifications/strapi-service.ts` use `createStrapiEmailSender` instead of inlining the `strapi.plugin('email')` call.
- R6. The deprecated `sendRegistrationEmail` endpoint (service, controller method, and route entry) is deleted.
- R7. Existing iletisim-merkezi tests are updated to inject a mock `EmailSender` directly — no more `strapi.plugin('email')` mock path needed for email assertions.
- R8. All affected tests pass after the refactor; no new failures introduced.

---

## Scope Boundaries

- Does not decouple DB access from Strapi — services still receive `strapi` for `strapi.db.query(...)` calls. Full Strapi removal from services is a separate future iteration.
- Does not change the underlying SMTP transport or email provider configuration (`backend/config/plugins.ts` is untouched).
- Does not add a new email transport implementation (Brevo SDK direct, Resend, etc.) — the Strapi adapter remains the only concrete implementation.
- Does not refactor `service-core.ts` or the internal-notifications notification-routing logic — only the `sendEmail` wiring line in two files changes.
- Does not touch frontend code.

### Deferred to Follow-Up Work

- Full Strapi decoupling for services (DB access via injected query callbacks, matching the `service-core.ts` model) — future iteration once migration away from Strapi is actively planned.
- Adding a non-Strapi `EmailSender` implementation (e.g., Brevo SDK adapter) — future iteration; the interface defined here is the prep work.

---

## Context & Research

### Relevant Code and Patterns

**Active call sites of `strapi.plugin('email').service('email').send(...)`:**

| File | Line | Shape |
|------|------|-------|
| `backend/src/plugins/iletisim-merkezi/server/services/confirmation-service.ts` | 63 | `send({ to, subject, html })` — single recipient, HTML |
| `backend/src/plugins/iletisim-merkezi/server/services/manual-email-service.ts` | 75 | `send({ to, subject, html })` — loop per recipient, HTML |
| `backend/src/plugins/iletisim-merkezi/server/services/manual-email-service.ts` | 136 | `send({ to, subject, html })` — single test recipient, HTML |
| `backend/src/plugins/internal-notifications/server/services/index.ts` | 27 | `send({ to, subject, text })` — plain text, comma-joined recipient string |
| `backend/src/services/internal-notifications/strapi-service.ts` | 26 | `send({ to, subject, text })` — plain text, comma-joined recipient string |

**Deprecated call site (being deleted in U13):**

| File | Line | Shape |
|------|------|-------|
| `backend/src/api/event/services/event.ts` | 80 | `sendTemplatedEmail(...)` — unique method, no `send()`, already `@deprecated` |

**Canonical DI pattern to follow — `service-core.ts`:**
- `backend/src/services/internal-notifications/service-core.ts` — pure function, accepts `sendEmail`, `loadRoutingByKey`, `warn`, `error` as typed function arguments; zero Strapi imports.
- `backend/src/services/internal-notifications/strapi-service.ts` — thin adapter that wires concrete Strapi deps into `service-core`'s parameters.

**Service factory registration — iletisim-merkezi:**
- `backend/src/plugins/iletisim-merkezi/server/services/index.ts` — exports `{ templateService, confirmationService, manualEmailService }`. Strapi calls each as a factory with `{ strapi }`. The wiring change in U10/U11 happens here — wrapping the factories to inject the adapter.
- `backend/src/plugins/iletisim-merkezi/strapi-server.ts` — assembles `services` from the services index; no changes needed here.

**Existing decoupled email path — internal-notifications:**
- `backend/src/services/internal-notifications/service-core.ts` — already Strapi-agnostic; zero changes in this plan.
- The `sendEmail` callback wired at lines 23–34 of `internal-notifications/server/services/index.ts` and line 23–27 of `strapi-service.ts` is where the two-line change in U12 lands.

**Deprecated endpoint wiring (U13 deletions):**
- `backend/src/api/event/services/event.ts` — only contains `sendRegistrationEmail`; the file can be deleted entirely.
- `backend/src/api/event/controllers/event.ts` lines 6–17 — `sendRegistrationEmail` controller method; `registrationStatus` (lines 19–41) stays.
- `backend/src/api/event/routes/custom-event.ts` lines 4–7 — the `POST /events/:documentId/send-registration-email` route entry; the `GET registration-status` entry (lines 8–13) stays.

### External References

- No external research needed. `service-core.ts` is the canonical example and pattern source.

---

## Key Technical Decisions

- **`EmailSender` interface lives in `backend/src/services/email/`** (not inside the plugin): parallel to `spl-check/` and `internal-notifications/`, importable by any backend code without circular deps. If the confirmation service later moves out of iletisim-merkezi, the interface moves with it without refactoring.

- **`to` is typed as `string` (not `string[]`) in `EmailMessage`**: All HTML email senders pass a single string already. The internal-notifications path receives `to: string[]` from `service-core.ts` and joins it to a comma-separated string before calling the adapter — this join already exists in the current code and stays in the wiring layer, not in the interface.

- **Adapter is injected at the service-registration layer, not inside service factories**: `confirmation-service.ts` and `manual-email-service.ts` factories take `{ strapi, emailSender }`. The `iletisim-merkezi/server/services/index.ts` wraps each factory so Strapi still calls them with `{ strapi }` only, while the wrapper creates and forwards the concrete adapter. This keeps service factories testable with any injected `EmailSender` mock without also needing to mock `strapi.plugin('email')`.

- **`from` and `replyTo` are not included in `EmailMessage`**: The only call site that used them was the deprecated `sendRegistrationEmail`. Default from/replyTo are configured globally in `backend/config/plugins.ts` and applied by the Strapi email plugin automatically — no service needs to pass them explicitly.

- **Deprecated `sendRegistrationEmail` is deleted, not adapted**: It uses `sendTemplatedEmail` (not `send`), passes `from`/`replyTo`, and is already fully superseded by `iletisim-merkezi.manualEmailService.sendManualEmail`. Adapting it would add interface complexity for zero benefit.

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
backend/src/services/email/
├── index.ts          ← EmailSender interface, EmailMessage type  (U8)
└── strapi-adapter.ts ← createStrapiEmailSender(strapi): EmailSender  (U9)

iletisim-merkezi plugin
├── server/services/index.ts   ← wraps confirmationService & manualEmailService
│                                 factories to inject createStrapiEmailSender(strapi)  (U10, U11)
├── server/services/confirmation-service.ts
│   ← factory: ({ strapi, emailSender }) instead of ({ strapi })
│   ← line 63: emailSender.send({...}) replaces strapi.plugin('email')...  (U10)
└── server/services/manual-email-service.ts
    ← factory: ({ strapi, emailSender })
    ← lines 75, 136: emailSender.send({...}) replace strapi.plugin('email')...  (U11)

internal-notifications
├── server/services/index.ts line 27
│   ← createStrapiEmailSender(strapi).send({...}) replaces inline call  (U12)
└── strapi-service.ts line 26
    ← createStrapiEmailSender(strapi).send({...}) replaces inline call  (U12)

Deleted (U13)
├── api/event/services/event.ts  (entire file)
├── api/event/controllers/event.ts  lines 6–17  (sendRegistrationEmail method)
└── api/event/routes/custom-event.ts  lines 4–7  (send-registration-email route entry)
```

---

## Implementation Units

### U8. Create EmailSender interface and EmailMessage type

**Goal:** Define the typed contract that all email senders and their consumers will depend on.

**Requirements:** R1

**Dependencies:** None

**Files:**
- Create: `backend/src/services/email/index.ts`

**Approach:**

Export two types from this file:

- `EmailMessage`: `{ to: string; subject: string; html?: string; text?: string }` — covers all current call shapes. `to` is a single address string. Both `html` and `text` are optional so the same type works for HTML emails (iletisim-merkezi) and plain-text emails (internal-notifications).

- `EmailSender`: interface with a single method `send(message: EmailMessage): Promise<void>`.

No implementation code, no imports, no Strapi types in this file.

**Test scenarios:**
Test expectation: none — pure type definitions, no runtime behavior.

**Verification:**
- File exists and exports both types.
- `npx tsc --noEmit` passes (run from `backend/`).

---

### U9. Create Strapi email adapter

**Goal:** Provide the single concrete implementation of `EmailSender` that the codebase uses today — a thin wrapper around `strapi.plugin('email').service('email').send(...)`. This is the only file that needs to change when the email transport is replaced.

**Requirements:** R2

**Dependencies:** U8

**Files:**
- Create: `backend/src/services/email/strapi-adapter.ts`
- Create: `backend/tests/services/email/strapi-adapter.test.ts`

**Approach:**

`createStrapiEmailSender(strapi: Core.Strapi): EmailSender` — factory function. Its `send(message)` implementation calls `strapi.plugin('email').service('email').send(message)` verbatim, forwarding the `EmailMessage` fields. The adapter does not catch errors — it lets the caller decide on error handling (as the current code already does: `confirmation-service.ts` catches internally, `manual-email-service.ts` catches per-recipient).

**Patterns to follow:**
- `backend/src/services/internal-notifications/strapi-service.ts` — same thin-adapter shape: receives `strapi`, wires a concrete dep into a callback.

**Test scenarios:**

All tests use a mock that captures what the fake `strapi.plugin('email').service('email').send` was called with.

- Happy path: `send({ to: 'a@example.com', subject: 'S', html: '<p>H</p>' })` → forwards `to`, `subject`, `html` to the underlying mock unchanged; mock is called exactly once.
- Plain text: `send({ to: 'b@example.com', subject: 'S', text: 'body' })` → `text` field forwarded, `html` not added.
- Error propagation: underlying mock rejects with `new Error('SMTP fail')` → `send()` rejects with the same error (adapter does not swallow it).

**Verification:**
- `npx vitest run tests/services/email/strapi-adapter.test.ts` passes all 3 tests.

---

### U10. Wire EmailSender into confirmation-service

**Goal:** Remove the `strapi.plugin('email')` call from `confirmation-service.ts` and replace it with an injected `emailSender`. Wire the Strapi adapter at the plugin service-registration layer.

**Requirements:** R3, R4

**Dependencies:** U8, U9

**Files:**
- Modify: `backend/src/plugins/iletisim-merkezi/server/services/confirmation-service.ts`
- Modify: `backend/src/plugins/iletisim-merkezi/server/services/index.ts`
- Modify: `backend/tests/plugins/iletisim-merkezi/confirmation-service.test.ts`

**Approach:**

**`confirmation-service.ts`:**

- Line 1: add import for `EmailSender` from `'../../../../services/email'` and `Core` from `'@strapi/strapi'` (already present).
- Line 6: change factory parameter type from `{ strapi: Core.Strapi }` to `{ strapi: Core.Strapi; emailSender: EmailSender }`.
- Lines 63–67: replace
  ```
  strapi.plugin('email').service('email').send({
    to: student.email,
    subject: `Kaydınız Onaylandı — ${event.title}`,
    html,
  });
  ```
  with
  ```
  emailSender.send({
    to: student.email,
    subject: `Kaydınız Onaylandı — ${event.title}`,
    html,
  });
  ```
- No other changes to this file.

**`server/services/index.ts`:**

- Add import for `createStrapiEmailSender` from `'../../../../services/email/strapi-adapter'`.
- Change the `confirmationService` export from the bare factory reference to a wrapper function:
  ```
  // Before:
  confirmationService,

  // After:
  confirmationService: ({ strapi }) =>
    confirmationService({ strapi, emailSender: createStrapiEmailSender(strapi) }),
  ```
- `templateService` and `manualEmailService` entries are untouched in this unit (`manualEmailService` gets its wrapper in U11).

**`confirmation-service.test.ts`:**

- The `makeContext` function builds the `strapi` stub. Remove the `plugin: vi.fn(...)` branch that handles `'email'` from the strapi mock — it is no longer needed for email assertions.
- The factory call `confirmationServiceFactory({ strapi } as never)` changes to `confirmationServiceFactory({ strapi: strapi as never, emailSender: { send: emailSend } })` where `emailSend = vi.fn().mockResolvedValue(undefined)` already exists.
- All existing test assertions on `emailSend` remain identical — the mock function is the same, only how it reaches the service changes.

**Patterns to follow:**
- `backend/tests/services/email/strapi-adapter.test.ts` (U9) for the mock shape.
- `backend/tests/plugins/iletisim-merkezi/confirmation-service.test.ts` (existing) for the test structure to preserve.

**Test scenarios:**

The existing 7 test scenarios in `confirmation-service.test.ts` are the verification for this unit — no new tests needed. Each scenario should produce identical outcomes after the refactor:

- Happy path: `emailSend` called with `{ to: 'ada@example.com', subject: expect.stringContaining('Siber Güvenlik Webinar'), html: expect.stringContaining('Siber Güvenlik Webinar') }`.
- `autoConfirmationEnabled: false` → `emailSend` not called.
- Template disabled → `emailSend` not called, `log.warn` called.
- Registration not found → `emailSend` not called, `log.warn` called.
- Student has no email → `emailSend` not called, `log.warn` called.
- `emailSend` throws → promise resolves, `log.error` called, `registrationUpdate` not called.
- Template variable replacement → `emailSend` html contains resolved values, no `{{ ... }}` tokens.

**Verification:**
- `npx vitest run tests/plugins/iletisim-merkezi/confirmation-service.test.ts` passes all 7 tests.
- `npx tsc --noEmit` passes.

---

### U11. Wire EmailSender into manual-email-service

**Goal:** Remove both `strapi.plugin('email')` calls from `manual-email-service.ts` and replace them with an injected `emailSender`.

**Requirements:** R3, R4

**Dependencies:** U8, U9, U10 (U10 establishes the wiring pattern in `services/index.ts`)

**Files:**
- Modify: `backend/src/plugins/iletisim-merkezi/server/services/manual-email-service.ts`
- Modify: `backend/src/plugins/iletisim-merkezi/server/services/index.ts`
- Modify: `backend/tests/plugins/iletisim-merkezi/manual-email-service.test.ts`

**Approach:**

**`manual-email-service.ts`:**

- Line 1: add import for `EmailSender` from `'../../../../services/email'`.
- Line 17: change factory parameter type from `{ strapi: Core.Strapi }` to `{ strapi: Core.Strapi; emailSender: EmailSender }`.
- Lines 75–79: replace
  ```
  strapi.plugin('email').service('email').send({
    to: email,
    subject,
    html: finalHtml,
  });
  ```
  with
  ```
  emailSender.send({
    to: email,
    subject,
    html: finalHtml,
  });
  ```
- Lines 136–140: replace
  ```
  strapi.plugin('email').service('email').send({
    to: adminEmail,
    subject: `[TEST] ${subject}`,
    html: finalHtml,
  });
  ```
  with
  ```
  emailSender.send({
    to: adminEmail,
    subject: `[TEST] ${subject}`,
    html: finalHtml,
  });
  ```
- No other changes.

**`server/services/index.ts`:**

- Add wrapper for `manualEmailService` identical in shape to the `confirmationService` wrapper added in U10:
  ```
  manualEmailService: ({ strapi }) =>
    manualEmailService({ strapi, emailSender: createStrapiEmailSender(strapi) }),
  ```

**`manual-email-service.test.ts`:**

- In `makeContext`: remove the `'email'` branch from `strapi.plugin(...)` mock.
- Change factory call from `manualEmailServiceFactory({ strapi } as never)` to `manualEmailServiceFactory({ strapi: strapi as never, emailSender: { send: emailSend } })`.
- All 11 existing test assertions on `emailSend` remain identical.

**Patterns to follow:**
- U10 — identical approach.

**Test scenarios:**

The existing 11 test scenarios in `manual-email-service.test.ts` are the verification — no new tests needed. All 11 should produce identical outcomes:

- `sendManualEmail` happy path: `emailSend` called twice (once per confirmed registrant), `registrationUpdate` called twice.
- Meeting link appended: `emailSend.mock.calls[0][0].html` contains the meeting link URL.
- Email deduplication: `emailSend` called once when two registrations share a lowercased email.
- Default status filter: `emailSend` called once (pending registration excluded).
- Custom status filter `['confirmed', 'pending']`: `emailSend` called twice.
- Partial failure: first `emailSend` rejects → second recipient still sent; `failedRecipients: 1`; `registrationUpdate` called once (not for failed).
- Event not found: throws `'Event not found'`.
- No matching registrations: throws `'No matching registrations'`.
- `sendTestEmail` happy path: `emailSend` called with `to: 'admin@netas.com'`, subject contains `'[TEST]'`; `registrationUpdate` not called.
- `sendTestEmail` meeting link: html contains meeting link.
- `sendTestEmail` event not found: throws.

**Verification:**
- `npx vitest run tests/plugins/iletisim-merkezi/manual-email-service.test.ts` passes all 11 tests.
- `npx tsc --noEmit` passes.

---

### U12. Wire EmailSender into internal-notifications

**Goal:** Replace the two inline `strapi.plugin('email')` calls in the internal-notifications wiring layer with `createStrapiEmailSender`.

**Requirements:** R5

**Dependencies:** U8, U9

**Files:**
- Modify: `backend/src/plugins/internal-notifications/server/services/index.ts`
- Modify: `backend/src/services/internal-notifications/strapi-service.ts`

**Approach:**

Both files wire a `sendEmail` callback into `deliverCore`. The callback currently inlines the `strapi.plugin('email')` call. Change both to use the adapter instead.

**`internal-notifications/server/services/index.ts`:**

- Add import: `import { createStrapiEmailSender } from '../../../../services/email/strapi-adapter'`
- Lines 23–34 (the `sendEmail` async callback): replace the try/catch block that calls `strapi.plugin('email').service('email').send(...)` with a direct call via the adapter. The adapter already propagates errors (no swallowing), so the try/catch logging in the existing code can be preserved or simplified — preserving it is safer during this refactor pass.

  Change line 27:
  ```
  // Before:
  await strapi.plugin('email').service('email').send({ to: toStr, subject, text });

  // After:
  await createStrapiEmailSender(strapi).send({ to: toStr, subject, text });
  ```

  The `const toStr = to.join(', ')` on line 24 and the surrounding console.log calls are unchanged.

**`services/internal-notifications/strapi-service.ts`:**

- Add import: `import { createStrapiEmailSender } from '../email/strapi-adapter'`
- Line 26: replace
  ```
  await strapi.plugin('email').service('email').send({ to: toStr, subject, text });
  ```
  with
  ```
  await createStrapiEmailSender(strapi).send({ to: toStr, subject, text });
  ```
  The surrounding `const toStr = to.join(', ')` and console.log lines are unchanged.

**Test scenarios:**
Test expectation: none for new tests — the internal-notifications test files (`strapi-service.test.ts`, `service-core.test.ts`) are already drifted from the current implementation (documented in `FAILING_TESTS.md` and deferred to a separate plan). The change in U12 is purely mechanical: one call site swapped per file. Verify by running the full suite and confirming the failure count does not increase.

**Verification:**
- `npx vitest run` failure count does not increase (pre-existing failures remain, no new failures added).
- `npx tsc --noEmit` passes.

---

### U13. Delete deprecated sendRegistrationEmail endpoint

**Goal:** Remove the deprecated email endpoint — service method, controller method, and route entry — that called `sendTemplatedEmail` and has been superseded by `iletisim-merkezi.manualEmailService.sendManualEmail`.

**Requirements:** R6

**Dependencies:** None (can run independently; no tests to update since no test coverage exists for this deprecated path)

**Files:**
- Delete: `backend/src/api/event/services/event.ts`
- Modify: `backend/src/api/event/controllers/event.ts`
- Modify: `backend/src/api/event/routes/custom-event.ts`

**Approach:**

**`event/services/event.ts`:** The file contains only the `sendRegistrationEmail` factory extension. Delete the file entirely. Strapi will fall back to the default generated event service, which is correct behavior — no custom service methods are needed for the event content type after this deletion.

**`event/controllers/event.ts`:** Remove the `sendRegistrationEmail` method (lines 6–17 inclusive). The `registrationStatus` method (lines 19–41) is unrelated and stays. The file retains the `factories.createCoreController` call with only `registrationStatus`.

**`event/routes/custom-event.ts`:** Remove the first route entry (lines 4–7):
```
{
  method: 'POST',
  path: '/events/:documentId/send-registration-email',
  handler: 'event.sendRegistrationEmail',
},
```
The second entry (`GET /events/:documentId/registration-status`) stays unchanged.

**Test scenarios:**
Test expectation: none — this is a deletion of deprecated, untested code. Confirm no existing test references `sendRegistrationEmail`.

**Verification:**
- `grep -r 'sendRegistrationEmail' backend/src/` returns zero results.
- `npx tsc --noEmit` passes (no dangling type references).
- `npm run build:backend` passes.

---

## System-Wide Impact

- **Unchanged invariants:** All email behavior — recipients, subjects, HTML content, meeting-link appending, deduplication, fire-and-forget error handling — is preserved exactly. Only the mechanism by which `send()` is dispatched changes.
- **Adapter as the migration seam:** After this refactor, replacing the email provider (Brevo SDK directly, Resend, nodemailer without Strapi) means: implement a new class/function satisfying `EmailSender`, swap `createStrapiEmailSender` for `createBrevoEmailSender` (or similar) in `iletisim-merkezi/server/services/index.ts` and both internal-notifications files. No service logic changes.
- **Test mock simplification:** Tests for `confirmation-service` and `manual-email-service` no longer need to mock `strapi.plugin('email')` for email assertions — they inject `{ send: vi.fn() }` directly, which is simpler and more stable.
- **Deleted API surface:** `POST /api/events/:documentId/send-registration-email` is removed. Any client (admin panel, external tooling) calling this endpoint must migrate to `POST /api/iletisim-merkezi/manual-email/send`. Confirm no active callers before deploying.
- **No DB changes, no migration, no frontend changes.**

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| External callers of the deprecated `send-registration-email` route still exist | Grep the frontend and admin panel code for the route path before deploying U13. The frontend uses `iletisim-merkezi` routes; the admin panel's `EmailComposePanel` should be checked. |
| `createStrapiEmailSender(strapi)` called once per `send()` in internal-notifications wiring | The adapter is a lightweight factory; no state is allocated. If performance becomes a concern, cache the result in the wiring closure: `const emailSender = createStrapiEmailSender(strapi)` above the `sendEmail` callback. |
| Strapi plugin `services/index.ts` wrappers mean factory types diverge from Strapi's expectations | Strapi accepts any function returning a plain object as a service factory. The wrapper signature `({ strapi }) => factory({ strapi, emailSender })` is valid. Verify with `npm run build:backend`. |

---

## Sources & References

- Pattern source: `backend/src/services/internal-notifications/service-core.ts` — the established DI pattern for decoupled services in this repo
- Email provider strategy: `docs/superpowers/specs/2026-04-22-email-provider-strategy.md`
- Email notification system spec: `docs/superpowers/specs/2026-04-12-email-notification-system.md`
- Decoupled SPL check plan (parallel pattern): `docs/plans/2026-04-24-001-feat-decoupled-spl-check-plan.md`
- Source files modified: `backend/src/plugins/iletisim-merkezi/server/services/confirmation-service.ts`, `manual-email-service.ts`, `index.ts`; `backend/src/plugins/internal-notifications/server/services/index.ts`; `backend/src/services/internal-notifications/strapi-service.ts`
- Source files deleted: `backend/src/api/event/services/event.ts`
