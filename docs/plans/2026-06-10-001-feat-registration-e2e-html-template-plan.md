---
title: "feat: Registration E2E Tests & HTML Confirmation Template"
type: feat
status: completed
date: 2026-06-10
origin: docs/brainstorms/2026-06-10-registration-e2e-and-html-templates-requirements.md
---

# feat: Registration E2E Tests & HTML Confirmation Template

## Summary

Adds Playwright E2E coverage for the event registration flow (`/etkinlikler/[slug]/kayit`) across all three event types, and wires the polished `emails/01_registration_confirmation.html` template into the `iletisim-merkezi` plugin's auto-confirmation flow. The E2E suite extends `seed-demo.js` with four dedicated test fixtures and writes a new spec mirroring the conventions in `e2e/tests/iletisim-form.spec.ts`. The template work renames the template utility to `applyTemplateParams`, adopts `{{params.xxx}}` variable syntax, and replaces the inline generic default in `bootstrap.ts` with a disk read.

---

## Problem Frame

The registration form at `/etkinlikler/[slug]/kayit` has never had E2E coverage despite being a primary user conversion point. The form's conditional shape — TCKN field and KVKK consent appear only for `egitim`/`kurs` event types — is enforced both client-side and server-side, making it a meaningful regression surface. Separately, `emails/01_registration_confirmation.html` was designed and built but has never been connected to any delivery path; the plugin bootstraps a plain inline HTML string instead.

---

## Requirements

- R1. E2E happy-path submission succeeds for all three event types (`etkinlik`, `egitim`, `kurs`).
- R2. TCKN field is visible for `egitim`/`kurs` and absent for `etkinlik`; KVKK checkbox follows the same rule.
- R3. Client-side TCKN validation error is visible when an invalid TCKN is submitted for `egitim`.
- R4. Client-side KVKK error is visible when KVKK is unchecked on `egitim`.
- R5. The registration-closed state (`page.event-registration.closed-state`) renders when registration is not open.
- R6. Duplicate registration (same student + event) succeeds idempotently.
- R7. `emails/01_registration_confirmation.html` is the template used when `autoConfirmationEnabled` is true on an event.
- R8. The template receives all 16 named `{{params.xxx}}` variables populated from registration, event, and student data.
- R9. `bootstrap.ts` reads the HTML file from disk and seeds it as the default; the idempotency guard (`existing?.id`) is preserved.

---

## Scope Boundaries

- E2E tests do not assert email delivery — only browser-visible form behavior and server response.
- Templates 02–05 are not updated in this pass.
- No template versioning, audit log, or admin UI changes.
- No env-var indirection for static params (`academyName`, `timezone`, etc.) — constants in the service for now.
- Existing dev DB records are not migrated — reset manually via admin UI "Reset to Default" if needed.
- `logoPngUrl` uses a placeholder value acceptable in dev; production URL is not configured here.

### Deferred to Follow-Up Work

- ICS / calendar attachment and `calendarUrl` generation: separate PR when calendar feature lands.
- `logoPngUrl` pointing to a real production CDN path: deferred until hosting is finalised.

---

## Context & Research

### Relevant Code and Patterns

- E2E pattern to mirror: `e2e/tests/iletisim-form.spec.ts` — `switchTab`, `fillCommonFields`, `waitForStorageWrite` helpers; `data-testid` selectors; `test.describe` grouping
- Playwright config: `e2e/playwright.config.ts` — `testDir: "./tests"`, Chromium only; new spec is auto-discovered
- Registration form component: `frontend/src/components/event-registration-form.tsx` — test IDs `event-registration.form`, `event-registration.field.*`, `event-registration.submit`, `event-registration.success`, `event-registration.error`
- Registration page: `frontend/src/app/[locale]/etkinlikler/[slug]/kayit/page.tsx` — `page.event-registration.closed-state` rendered when `!registrationOpen`
- Seed upsert helper: `backend/scripts/seed-demo.js` → `upsertPublishedDocument(strapi, uid, uniqueField, uniqueValue, data, result, summaryKey)` — idempotent by slug
- Valid TCKN constant: `"10000000078"` — established in `backend/tests/api/registration/field-requirements.test.ts`
- Template utility to refactor: `backend/src/plugins/iletisim-merkezi/server/services/utils/template.ts` — `replaceTemplateVariables`
- Confirmation service: `backend/src/plugins/iletisim-merkezi/server/services/confirmation-service.ts`
- Bootstrap: `backend/src/plugins/iletisim-merkezi/server/bootstrap.ts` — `ensureDefaultTemplate` with `existing?.id` guard
- Email HTML template: `emails/01_registration_confirmation.html` — 16 `{{params.xxx}}` placeholders
- Parallel renderer: `backend/src/services/email-templates/renderer.ts` — uses same `{{params.xxx}}` format; confirms the convention

### Institutional Learnings

- No directly applicable `docs/solutions/` entries found for these tracks.

---

## Key Technical Decisions

- **Standalone E2E fixtures section in seed-demo.js (not appended to `demoEvents`):** The existing `demoEvents` loop throws when `courseSlug` is absent. E2E test events do not need a course relation (the schema makes it optional). A separate `e2eFixtures` seeding step uses `upsertPublishedDocument` directly, keeping test infrastructure decoupled from demo content.
- **`keepRegistrationsOpen: true` for open fixture events (not future `startsAt`):** All existing demo events use past dates. Using `keepRegistrationsOpen: true` makes fixtures registration-open regardless of clock, so the tests stay green as the project ages without date maintenance.
- **`VALID_TCKN` defined locally in the spec file:** Test isolation is more important than DRY across the backend/e2e boundary. The constant is a known-valid value, not generated logic.
- **`applyTemplateParams` adopts `{{params.xxx}}` format:** This aligns with `renderer.ts`'s existing convention and matches the 16 placeholders already in `emails/01_registration_confirmation.html`. The old `{{ event.xxx }}` format is abandoned — no production data exists to migrate.
- **Static params as constants in `confirmation-service.ts`:** `academyName`, `timezone`, `supportEmail`, `preparationNote` are defined as constants inside the service. No env-var indirection until a genuine configuration need arises.
- **`bootstrap.ts` uses synchronous `fs.readFileSync`:** Strapi's bootstrap function runs once at startup before any requests are served. Synchronous disk read is appropriate here and consistent with similar Strapi patterns.

---

## Open Questions

### Resolved During Planning

- **Does the E2E spec need a separate Playwright project or config?** No — `playwright.config.ts` uses `testDir: "./tests"` and the new spec is auto-discovered.
- **Can events exist without a course in the schema?** Yes — `course` is an optional `manyToOne` relation (see `backend/src/api/event/content-types/event/schema.json`).
- **What is the canonical valid TCKN for tests?** `"10000000078"` — already the constant in `backend/tests/api/registration/field-requirements.test.ts`.

### Deferred to Implementation

- **Exact path resolution in `bootstrap.ts`:** `path.resolve(__dirname, '..', '..', '..', '..', '..', 'emails', '01_registration_confirmation.html')` — the precise `..` count from the plugin directory to repo root should be verified during implementation by checking actual directory depth.
- **`logoPngUrl` value:** Implementer should use a dev-accessible placeholder (e.g. `""` or a relative path) and leave a `// TODO: set production URL` comment.

---

## Implementation Units

### U1. Add E2E seed fixtures to seed-demo.js

**Goal:** Ensure four published events with known slugs exist in the Strapi DB whenever the seed runs — one per event type (open) plus one closed registration event.

**Requirements:** R1, R2, R5

**Dependencies:** None

**Files:**
- Modify: `backend/scripts/seed-demo.js`

**Approach:**
- Define a `e2eFixtures` array of four event objects at the bottom of the seed data section:
  - `e2e-test-etkinlik`: `eventType: 'etkinlik'`, `keepRegistrationsOpen: true`, future-ish `startsAt`
  - `e2e-test-egitim`: `eventType: 'egitim'`, `keepRegistrationsOpen: true`
  - `e2e-test-kurs`: `eventType: 'kurs'`, `keepRegistrationsOpen: true`
  - `e2e-test-kapali`: `eventType: 'etkinlik'`, `keepRegistrationsOpen: false`, past `startsAt` (e.g. `2020-01-01T09:00:00.000Z`)
- Add a dedicated seeding step (after the `demoEvents` loop) that iterates `e2eFixtures` and calls `upsertPublishedDocument(app, 'api::event.event', 'slug', event.slug, { ...fields, course: null }, result, 'events')` — no course association, no `courseSlug` lookup
- Events should have minimal but valid fields: `title`, `slug`, `summary`, `startsAt`, `eventType`, `keepRegistrationsOpen`, `publishedAt` (handled by `upsertPublishedDocument`)

**Patterns to follow:**
- `upsertPublishedDocument` function signature already in `seed-demo.js`
- Existing `demoEvents` entries as field shape reference

**Test scenarios:**
- Test expectation: none — this unit is seed/fixture infrastructure, not application behavior

**Verification:**
- Running `npm run seed:demo` twice is idempotent (no duplicate slugs created)
- All four events appear as published in the Strapi admin with correct `eventType` and `keepRegistrationsOpen` values

---

### U2. Write event-registration.spec.ts

**Goal:** Full Playwright E2E coverage of the registration form across all three event types, validation errors, closed state, and idempotent duplicate registration.

**Requirements:** R1, R2, R3, R4, R5, R6

**Dependencies:** U1 (fixtures must exist before the suite runs)

**Files:**
- Create: `e2e/tests/event-registration.spec.ts`

**Approach:**
- Define `VALID_TCKN = "10000000078"` as a module-level constant
- Write a `fillRegistrationBase(page, data)` helper (firstName, lastName, email, phone) — mirrors `fillCommonFields` in `iletisim-form.spec.ts`
- Group all scenarios in one `test.describe("Etkinlik Kaydı")` block
- Navigation: use locale-prefixed paths `/tr/etkinlikler/<slug>/kayit`; the `playwright.config.ts` sets `baseURL: "http://localhost:3000"` so no prefix needed for `page.goto`
- Use `getByTestId` selectors throughout — no CSS/XPath

**Test scenarios:**
- Happy path / `etkinlik`: navigate to `e2e-test-etkinlik/kayit` → `event-registration.form` visible → TCKN field NOT present → KVKK checkbox NOT present → fill base + notes → submit → `event-registration.success` visible (covers R1, R2)
- Happy path / `egitim`: navigate to `e2e-test-egitim/kayit` → TCKN field present → KVKK checkbox present → fill base + `VALID_TCKN` + check KVKK → submit → success (covers R1, R2)
- Happy path / `kurs`: same shape as `egitim` using `e2e-test-kurs` (covers R1, R2)
- Edge case / TCKN validation: `e2e-test-egitim` → fill base + invalid TCKN "12345" + check KVKK → submit → `event-registration.error` visible, `event-registration.success` NOT present (covers R3)
- Edge case / KVKK not checked: `e2e-test-egitim` → fill base + `VALID_TCKN`, leave KVKK unchecked → submit → `event-registration.error` visible (covers R4)
- Closed state: navigate to `e2e-test-kapali/kayit` → `page.event-registration.closed-state` visible → `event-registration.form` NOT present (covers R5)
- Integration / idempotent duplicate: `e2e-test-etkinlik` → submit valid registration → success → reload → fill same email → submit again → success (covers R6)

**Patterns to follow:**
- `e2e/tests/iletisim-form.spec.ts` — helper functions, `test.describe`, `expect(...).toBeVisible({ timeout: 10_000 })` for network-dependent assertions, `page.waitForTimeout(100)` for effect settle where needed

**Verification:**
- `npx playwright test event-registration` (from `e2e/`) runs all 7 scenarios green against a running dev stack with demo seed applied
- No scenario passes vacuously (e.g., checking `.not.toBeVisible` on an element that never existed)

---

### U3. Rename template utility and adopt {{params.xxx}} format

**Goal:** Replace `replaceTemplateVariables` with `applyTemplateParams` that accepts `Record<string, string>` and replaces `{{params.<key>}}` placeholders.

**Requirements:** R8

**Dependencies:** None (parallel with U4, U5)

**Files:**
- Modify: `backend/src/plugins/iletisim-merkezi/server/services/utils/template.ts`
- Create: `backend/tests/plugins/iletisim-merkezi/utils/template.test.ts`

**Approach:**
- Remove the existing `replaceTemplateVariables` function and its `{{ event.xxx }}` replacements
- Export `applyTemplateParams(html: string, params: Record<string, string>): string` — iterates `Object.entries(params)` and calls `String.replaceAll` for each `{{params.<key>}}` placeholder
- The function signature is a pure string transform; no Strapi dependency

**Patterns to follow:**
- `backend/src/services/email-templates/renderer.ts` — same `{{params.<key>}}` pattern, same `split().join()` / `replaceAll` idiom

**Test scenarios:**
- Happy path: `applyTemplateParams('Hello {{params.firstName}}', { firstName: 'Ada' })` → `'Hello Ada'`
- Edge case / unknown key: `applyTemplateParams('{{params.x}}', { y: 'Ada' })` → `'{{params.x}}'` (unreplaced, no error)
- Edge case / empty params: `applyTemplateParams('Hello', {})` → `'Hello'` (unchanged)
- Edge case / multiple occurrences: same key appearing twice in template is replaced in both positions

**Verification:**
- New unit tests for `applyTemplateParams` cover all four test scenarios above
- TypeScript compilation passes (`npm run build:backend`)

---

### U4. Enrich confirmation service with full variable set

**Goal:** Supply all 16 `{{params.xxx}}` variables the HTML template expects; call `applyTemplateParams` instead of `replaceTemplateVariables`.

**Requirements:** R7, R8

**Dependencies:** U3

**Files:**
- Modify: `backend/src/plugins/iletisim-merkezi/server/services/confirmation-service.ts`

**Approach:**
- Update the `strapi.db.query` populate call to also fetch `endsAt`, `meetingLink`, and `eventType` from the event
- Define module-level constants for the four static params: `ACADEMY_NAME`, `SUPPORT_EMAIL`, `TIMEZONE`, `LOGO_PNG_URL` (placeholder value with `// TODO: set production URL` comment)
- Compute all 16 variables before calling `applyTemplateParams`:
  - `firstName` ← `student.firstName`
  - `programTitle` ← `event.title`
  - `programDate` ← `new Date(event.startsAt).toLocaleDateString('tr-TR', { dateStyle: 'full' })`
  - `programTime` ← `new Date(event.startsAt).toLocaleTimeString('tr-TR', { timeStyle: 'short' })`
  - `programType` ← map `eventType`: `etkinlik→'Etkinlik'`, `egitim→'Eğitim'`, `kurs→'Kurs'`, default `'Etkinlik'`
  - `duration` ← if `event.endsAt` exists, compute minutes difference and format (e.g. `"3 saat"`), else `""`
  - `deliveryMode` ← `event.meetingLink ? "Çevrimiçi" : (event.location ?? "Yüz Yüze")`
  - `joinUrl` ← `event.meetingLink ?? ""`
  - `registrationId` ← `String(registration.id)`
  - `calendarUrl` ← `""` (placeholder)
  - `academyName` ← `ACADEMY_NAME`
  - `logoPngUrl` ← `LOGO_PNG_URL`
  - `preheader` ← `\`${event.title} etkinliğine kaydınız alındı.\``
  - `preparationNote` ← `""`
  - `supportEmail` ← `SUPPORT_EMAIL`
  - `timezone` ← `TIMEZONE`
- Replace `const html = replaceTemplateVariables(htmlBody, {...})` with `const html = applyTemplateParams(htmlBody, params)`
- Import `applyTemplateParams` from `./utils/template`

**Patterns to follow:**
- Existing `sendAutoConfirmation` structure — error handling, guard clauses, and fire-and-forget logging remain unchanged
- `replaceTemplateVariables` call pattern for reference on how html was previously generated

**Test scenarios:**
- Happy path / `etkinlik` event with meetingLink: `deliveryMode` is `"Çevrimiçi"`, `joinUrl` is the link value
- Happy path / `egitim` event without meetingLink but with location: `deliveryMode` is the location string
- Happy path / event with `endsAt`: `duration` is non-empty formatted string
- Edge case / event without `endsAt`: `duration` is `""`
- Edge case / `eventType` null or unknown: `programType` defaults to `"Etkinlik"` without throwing
- Integration: when `autoConfirmationEnabled` is true, `emailSender.send` is called with an `html` body that contains the interpolated `firstName` value (not the raw `{{params.firstName}}` placeholder)

**Verification:**
- `npm run build:backend` compiles without error
- Manual smoke test: create an `egitim` event with `autoConfirmationEnabled: true`, register a student, confirm the received email body contains the student's first name and event title (not raw placeholders)

---

### U5. Update bootstrap to read HTML template from disk

**Goal:** Replace the inline `DEFAULT_TEMPLATE` string in `bootstrap.ts` with the contents of `emails/01_registration_confirmation.html` read from disk at startup.

**Requirements:** R7, R9

**Dependencies:** U3 (template format is `{{params.xxx}}`, which the HTML file already uses)

**Files:**
- Modify: `backend/src/plugins/iletisim-merkezi/server/bootstrap.ts`

**Approach:**
- Add `import fs from 'node:fs'` and `import path from 'node:path'` at the top
- In `ensureDefaultTemplate`, read the file: `const htmlBody = fs.readFileSync(path.resolve(__dirname, '..', '..', '..', '..', '..', 'emails', '01_registration_confirmation.html'), 'utf-8')`
- Remove the `DEFAULT_TEMPLATE` constant
- The `existing?.id` guard that prevents re-seeding when a record already exists is preserved unchanged
- Note: the exact `path.resolve` depth must be verified during implementation by checking `__dirname` at the plugin directory level (see Open Questions → Deferred to Implementation)

**Patterns to follow:**
- `backend/src/services/email-templates/renderer.ts` — same file-loading approach using `path.resolve` and `fs.readFile` (sync variant acceptable at bootstrap time)

**Test scenarios:**
- Test expectation: none — this is a startup-only configuration step. Correct behaviour is confirmed by the U4 manual smoke test (receiving an email with the polished template body, not the old inline HTML).

**Verification:**
- After restarting the backend with a fresh DB (or after deleting the existing confirmation-template record via Strapi admin), the seeded template body matches `emails/01_registration_confirmation.html`
- The `existing?.id` guard prevents re-seeding on normal restarts — confirmed by checking that a manually-edited template is not overwritten on server restart

---

## System-Wide Impact

- **Interaction graph:** U4 changes what `sendAutoConfirmation` passes to `emailSender.send`. Any other caller of `replaceTemplateVariables` (if one exists outside of `confirmation-service.ts`) must be updated to `applyTemplateParams`. Verify with a grep before implementing U3.
- **Error propagation:** Bootstrap disk-read failure (file not found) will surface as a Strapi startup error — intentional, since a missing template file is a deployment configuration error that should fail loudly.
- **State lifecycle risks:** The `existing?.id` guard means an already-seeded DB record (with the old inline template) will NOT be replaced on restart. Developers must manually delete/reset the record after deploying U5 for the first time.
- **API surface parity:** No public API surface changes.
- **Integration coverage:** The U4 + U5 chain (bootstrap seeds template → service reads template → service calls `applyTemplateParams` → `emailSender.send`) is only verifiable end-to-end with a running Strapi instance. Unit tests in U3 cover the utility function; the integration smoke test in U4's verification covers the full chain.
- **Unchanged invariants:** The `iletisim-merkezi` admin UI (template editor, reset route) is unchanged. The `autoConfirmationEnabled` flag logic is unchanged. The `iletisim-form.spec.ts` contact form tests are unaffected.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `__dirname` depth in `bootstrap.ts` is wrong → file read fails at startup | Verify with a `console.log(__dirname)` run during development before finalising the `path.resolve` call |
| Existing dev DB has the old inline template → U5 has no visible effect | Document the manual reset step; admin UI "Reset to Default" button already exists for this purpose |
| E2E fixtures created by U1 pollute demo-mode UX (test slugs appear in listings) | Prefix slugs with `e2e-test-` (already planned); these are clearly non-editorial and can be filtered out if needed |
| `isValidTckn("10000000078")` might fail after a future TCKN algorithm change | TCKN validation is algorithm-based (Luhn-like); `"10000000078"` passes the current algorithm — no expected change |
| `applyTemplateParams` leaves unreplaced `{{params.xxx}}` placeholders if a key is missing | The function silently leaves placeholders unreplaced (same behaviour as `renderer.ts`); the U4 variable list covers all 16 placeholders in the HTML file — no gaps expected |

---

## Sources & References

- **Origin document:** [docs/brainstorms/2026-06-10-registration-e2e-and-html-templates-requirements.md](docs/brainstorms/2026-06-10-registration-e2e-and-html-templates-requirements.md)
- Related code: `e2e/tests/iletisim-form.spec.ts`, `backend/tests/api/registration/field-requirements.test.ts`
- Email template: `emails/01_registration_confirmation.html`
- Plugin entry points: `backend/src/plugins/iletisim-merkezi/server/bootstrap.ts`, `backend/src/plugins/iletisim-merkezi/server/services/confirmation-service.ts`, `backend/src/plugins/iletisim-merkezi/server/services/utils/template.ts`
