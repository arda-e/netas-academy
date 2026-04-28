# Remaining Work Plans — Intent-Based Lead Architecture

> Parent plan: `docs/plans/2026-04-27-002-refactor-intent-based-lead-architecture-plan.md`

## What's Already Done

| Unit | Work | Status |
|------|------|--------|
| 1 – Backend lead contract | Schema, controller, service, notification keys/types/templates, bootstrap routing | ✅ Complete |
| 1 – Backend tests | Service test + template tests with lead-type scenarios | ✅ Complete |
| 2 – Frontend form island | `lead-intents.ts`, `intent-lead-form.tsx`, `intent-field-sections.tsx`, `/iletisim` page, `package.json` deps | ✅ Complete |
| 2 – Proxy route | Already passes arbitrary JSON through — no change needed | ✅ No-op |

---

## Sub-Plan A: Frontend Form Tests

**Goal:** Source-level assertions for validation schema shape and payload contracts (no DOM rendering).

### Files

- **Create:** `frontend/src/__tests__/intent-lead-form-source.test.mjs`

### Approach

- Import `intentSchemas` and `buildIntentLeadUrl` from `lead-intents.ts`.
- Assert each lead-type schema accepts valid payloads and rejects missing type-specific fields.
- Assert `buildIntentLeadUrl` produces correct query strings for each intent + optional topic.
- Assert submitted payload shape includes `leadType` and excludes frontend-only attribution fields.

### Test Scenarios

| # | Scenario |
|---|----------|
| 1 | Corporate schema accepts valid payload with `interestTopic` |
| 2 | Corporate schema rejects payload missing `interestTopic` |
| 3 | Instructor schema accepts valid payload with `expertiseAreas` |
| 4 | Instructor schema rejects payload missing `expertiseAreas` |
| 5 | Solution partner schema accepts valid payload with `companySize` |
| 6 | Solution partner schema rejects payload missing `companySize` |
| 7 | General contact schema accepts minimal payload (no type-specific fields) |
| 8 | `buildIntentLeadUrl('corporate_training_request')` → `/iletisim?intent=corporate_training_request` |
| 9 | `buildIntentLeadUrl('corporate_training_request', { topic: 'veri-bilimi' })` → includes `&topic=veri-bilimi` |

### Validation

```bash
cd frontend && npm run lint && npm run build
```

---

## Sub-Plan B: Contextual CTAs & Prefill

**Goal:** Wire `buildIntentLeadUrl` into existing pages so CTAs encode intent and prefill context.

### Files

| File | Change |
|------|--------|
| `frontend/src/app/egitimler/[slug]/page.tsx` | Add "Bu Eğitimi Kurumsal Olarak Talep Et" CTA linking to `/iletisim?intent=corporate_training_request&topic=<course-title>` |
| `frontend/src/app/etkinlikler/[slug]/page.tsx` | Keep existing `Etkinliğe Kayıt Ol`; add secondary "İletişime Geç" CTA for general contact (not a registration replacement) |
| `frontend/src/app/page.tsx` | Update secondary CTA to target corporate intent via `buildIntentLeadUrl` |
| `frontend/src/app/hakkimizda/page.tsx` | Add instructor application + solution partner CTAs at the bottom of the page |

### Rules

- Event detail **always** keeps `Etkinliğe Kayıt Ol` as primary CTA when registration is open.
- No backend context attribution fields (`contextType`, `contextSlug`).
- Context is frontend-only for tab/prefill.

### Validation

```bash
cd frontend && npm run lint && npm run build
```

---

## Sub-Plan C: Analytics Events

**Goal:** Emit domain-first event calls for observable lead-flow behavior without choosing a final analytics vendor.

### Files

| File | Change |
|------|--------|
| `frontend/src/lib/analytics-events.ts` | **Create** — swappable event helper with stable event contract |
| `frontend/src/components/contact/intent-lead-form.tsx` | Wire analytics calls into lifecycle hooks |

### Event Contract

| Event Name | Trigger | Properties (no PII) |
|------------|---------|---------------------|
| `lead_tab_view` | Form mounts with active tab | `{ leadType }` |
| `lead_tab_change` | User switches tab | `{ from, to }` |
| `lead_form_start` | First field interaction per visit | `{ leadType }` |
| `lead_submit_success` | Successful submission | `{ leadType }` |
| `lead_submit_fail` | Failed submission | `{ leadType, reason }` |
| `lead_contextual_entry` | User arrives via deep link | `{ leadType }` |
| `lead_catalog_click` | Catalog CTA clicked in success state | `{ leadType }` |
| `lead_related_content_click` | Related content CTA clicked | `{ leadType }` |

### Validation

```bash
cd frontend && npm run lint && npm run build
```

---

## Sub-Plan D: CTA + Analytics Tests + Cross-Stack Build

**Goal:** Source-level tests for CTA links and analytics events, then full cross-stack build.

### Files

| File | Change |
|------|--------|
| `frontend/src/__tests__/intent-lead-links-source.test.mjs` | **Create** — verify `buildIntentLeadUrl` output for each intent + topic combos |
| `frontend/src/__tests__/lead-analytics-events-source.test.mjs` | **Create** — verify event helper emits correct names and excludes PII |

### Test Scenarios

**intent-lead-links-source:**
| # | Scenario |
|---|----------|
| 1 | `buildIntentLeadUrl('corporate_training_request')` → correct URL |
| 2 | `buildIntentLeadUrl('instructor_application', { topic: 'python' })` → correct URL |
| 3 | `buildIntentLeadUrl('solution_partner_application')` → correct URL |
| 4 | `buildIntentLeadUrl('general_contact')` → correct URL |

**lead-analytics-events-source:**
| # | Scenario |
|---|----------|
| 1 | `emitLeadTabView('corporate_training_request')` emits `lead_tab_view` with `{ leadType }` |
| 2 | `emitLeadSubmitSuccess('instructor_application')` emits `lead_submit_success` |
| 3 | `emitLeadSubmitFail('corporate_training_request', 'validation_error')` emits `lead_submit_fail` with reason only |
| 4 | No PII (email, phone, fullName) appears in any event properties |

### Cross-Stack Validation

```bash
npm run lint
npm run build
npm run seed:demo
```

---

## Deferred Items

| Item | Reason |
|------|--------|
| `contact-form.tsx` and `use-contact-form.ts` deletion | Not blocking; old files are no longer imported by `/iletisim` |
| KVKK legal text review | Requires legal team input before production launch |
| `frontend/package-lock.json` explicit edit | Handled by `npm install` after deps change |
| Catalog PDF path | Assumed to exist at `/katalog` or added as static asset separately |
