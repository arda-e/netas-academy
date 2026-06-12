# Registration E2E Tests & HTML Template Hook-up — Requirements

**Date:** 2026-06-10  
**Status:** Ready for planning

---

## Background

The registration flow at `/etkinlikler/[slug]/kayit` has never been covered by E2E tests. Three event types (`etkinlik`, `egitim`, `kurs`) have meaningfully different form shapes — TCKN field and KVKK consent appear only for `egitim`/`kurs`. This distinction is enforced both client-side (field visibility) and server-side (validation), so it is a meaningful test boundary.

Separately, a polished HTML email template (`emails/01_registration_confirmation.html`) exists but is not wired to the registration confirmation flow. The `iletisim-merkezi` plugin currently seeds a plain inline HTML string as the default template at startup.

---

## Track 1: E2E Registration Tests

### Goals

1. Confirm the registration form submits successfully for all three event types.
2. Verify that TCKN and KVKK consent fields appear only for `egitim` and `kurs`.
3. Cover the registration-closed state.
4. Cover client-side validation errors (missing TCKN, KVKK not checked).
5. Match the structure and conventions of `e2e/tests/iletisim-form.spec.ts`.

### Seed Requirements

Tests depend on live events in Strapi. The demo seed (`backend/scripts/seed-demo.js`) must guarantee at least one published event per type with a future `startsAt` date (or `keepRegistrationsOpen: true`) so registration is open. It must also seed one event with a past `startsAt` and `keepRegistrationsOpen: false` to test the closed state.

The seeded events must have known, stable slugs so tests can navigate directly (e.g. `e2e-test-etkinlik`, `e2e-test-egitim`, `e2e-test-kurs`, `e2e-test-kapali`).

TCKN: use a known valid test TCKN constant (the same one already used in backend unit tests) to avoid hardcoding a magic number in multiple test files.

### Test Scenarios

**Shared helper** (`fillRegistrationBase`): fills firstName, lastName, email, phone — used in all three happy-path tests.

#### `etkinlik` — happy path
- Navigate to `/tr/etkinlikler/e2e-test-etkinlik/kayit`
- Confirm `event-registration.form` is visible
- Confirm TCKN field (`event-registration.field.tckn`) is **not** present
- Confirm KVKK checkbox (`event-registration.field.kvkk-consent`) is **not** present
- Fill base fields + optional notes
- Submit → assert `event-registration.success` visible

#### `egitim` — happy path
- Navigate to `/tr/etkinlikler/e2e-test-egitim/kayit`
- Confirm TCKN field is visible
- Confirm KVKK checkbox is visible
- Fill base fields + valid TCKN + check KVKK
- Submit → assert success

#### `kurs` — happy path
- Navigate to `/tr/etkinlikler/e2e-test-kurs/kayit`
- Same shape as `egitim` test above

#### `egitim` — TCKN validation error
- Navigate to egitim event
- Fill base fields + enter invalid TCKN (e.g. "12345") + check KVKK
- Submit → assert `event-registration.error` visible (client-side rejection before network call)

#### `egitim` — KVKK not checked
- Navigate to egitim event
- Fill base fields + valid TCKN, leave KVKK unchecked
- Submit → assert `event-registration.error` visible

#### Closed registration state
- Navigate to `/tr/etkinlikler/e2e-test-kapali/kayit`
- Assert `page.event-registration.closed-state` is visible
- Assert `event-registration.form` is **not** present

#### Duplicate registration (idempotent)
- Navigate to an open event (e.g. `etkinlik`)
- Submit a valid registration
- Wait for success
- Submit same registration again (reload, fill same email)
- Assert success again — the backend is idempotent on (student email × event)

### File Location

`e2e/tests/event-registration.spec.ts`

### Non-Goals

- Asserting email delivery from the browser
- Testing the Strapi admin panel
- Performance / load testing

---

## Track 2: HTML Template Hook-up

### Goal

Replace the inline generic `DEFAULT_TEMPLATE` in `backend/src/plugins/iletisim-merkezi/server/bootstrap.ts` with the polished `emails/01_registration_confirmation.html` template. The template is DB-editable via the admin UI after seeding; this only changes the default.

### Variable Format Decision

The HTML file uses `{{params.xxx}}` (15 variables, `renderer.ts` convention).  
The existing `replaceTemplateVariables` utility uses `{{ event.xxx }}` (4 variables, spaced).  

**Decision:** Adopt `{{params.xxx}}` as the canonical format. Update `replaceTemplateVariables` to accept a flat `Record<string, string>` and replace `{{params.<key>}}` placeholders. Rename the function to `applyTemplateParams` to signal the format change. The old DB records will need to be reset (only affects development — no production data at this stage).

### Variables Required by the HTML Template

| Placeholder | Source |
|---|---|
| `{{params.firstName}}` | `registration.student.firstName` |
| `{{params.programTitle}}` | `registration.event.title` |
| `{{params.programDate}}` | `registration.event.startsAt` (date, tr-TR locale) |
| `{{params.programTime}}` | `registration.event.startsAt` (time, tr-TR locale) |
| `{{params.programType}}` | `registration.event.eventType` mapped: `etkinlik→Etkinlik`, `egitim→Eğitim`, `kurs→Kurs` |
| `{{params.duration}}` | Derived from `endsAt - startsAt` if available, else empty string |
| `{{params.deliveryMode}}` | `"Çevrimiçi"` if `meetingLink` exists, else `"Yüz Yüze"` or `event.location` |
| `{{params.joinUrl}}` | `registration.event.meetingLink` (empty string if null) |
| `{{params.registrationId}}` | `String(registration.id)` |
| `{{params.calendarUrl}}` | Empty string for now (no calendar generation yet) |
| `{{params.academyName}}` | Static: `"Netas Academy"` |
| `{{params.logoPngUrl}}` | Static: logo URL served from the frontend (absolute URL) |
| `{{params.preheader}}` | Static: `"${programTitle} etkinliğine kaydınız alındı."` |
| `{{params.preparationNote}}` | Static: empty string for now |
| `{{params.supportEmail}}` | Static: configured in `backend/config/` or env var |
| `{{params.timezone}}` | Static: `"Europe/Istanbul"` |

### Changes Required

1. **`backend/src/plugins/iletisim-merkezi/server/bootstrap.ts`** — read `emails/01_registration_confirmation.html` from disk (via `fs.readFileSync`) at startup; use it as `htmlBody` when seeding the default template. Keep the `existing?.id` guard so re-seeding is idempotent.

2. **`backend/src/plugins/iletisim-merkezi/server/services/utils/template.ts`** — rename `replaceTemplateVariables` → `applyTemplateParams`; accept `Record<string, string>`; replace `{{params.<key>}}` placeholders.

3. **`backend/src/plugins/iletisim-merkezi/server/services/confirmation-service.ts`** — populate `endsAt` and `meetingLink` on the event query; compute all 16 variables; call `applyTemplateParams`.

4. **Delete or reset the seeded DB record** — for development, the bootstrap guard means the old record stays if it already exists. A one-time reset route or manual delete in the Strapi admin (Settings → Iletisim Merkezi → Onay Şablonu → Reset to Default) handles it without a migration.

### Non-Goals

- Changing the template editing admin UI
- Adding a template versioning or audit log
- Email delivery verification in E2E tests
- Adapting other email templates (02–05) in this pass

---

## Success Criteria

- `npm run e2e` (or `npx playwright test event-registration`) runs green with the dev stack running and demo seed applied.
- All three event type happy paths pass.
- TCKN / KVKK field presence/absence is explicitly asserted per event type.
- Closed-state test passes.
- `emails/01_registration_confirmation.html` is the template delivered when `autoConfirmationEnabled` is true on an event.
- Resetting the template via the admin UI replants the beautiful template.
