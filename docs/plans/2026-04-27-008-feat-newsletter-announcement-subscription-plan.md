---
title: "feat: Add newsletter and announcement subscription"
type: feat
status: active
date: 2026-04-27
origin: docs/brainstorms/2026-04-27-bulten-duyuru-aboneligi-requirements.md
---

# feat: Add newsletter and announcement subscription

## Overview

Add a low-friction Academy newsletter/announcement subscription path that captures email, explicit consent, active status, and source context without implementing campaign sending.

## Problem Frame

The site currently has high-intent registration/application actions but no lightweight capture path for users who want future education and event updates. The origin document positions this as a newsletter and announcement product, not merely a closed-event fallback (see origin: `docs/brainstorms/2026-04-27-bulten-duyuru-aboneligi-requirements.md`).

## Requirements Trace

- R1. Subscribe to one list with only email and consent.
- R2. Show success on screen; no automatic confirmation email in first version.
- R3. Duplicate email submissions should feel successful or already-registered, not like an error.
- R4. Show the form in footer, news page, and closed event detail.
- R5. Persist consent, active/passive status, and source context.
- R6. Leave unsubscribe, segmentation, preference center, and campaign sending out of first version.

## Scope Boundaries

- No email sending, double opt-in, unsubscribe link, preference center, segmentation, campaign editor, or marketing automation.
- Legal/KVKK text is implementation-ready placeholder copy until final review.

## Context & Research

### Relevant Code and Patterns

- `frontend/src/components/site-footer.tsx` is the global footer surface.
- `frontend/src/app/haberler/page.tsx` exists as a frontend-only news surface.
- `frontend/src/app/etkinlikler/[slug]/page.tsx` owns closed/open CTA behavior.
- `frontend/src/app/api/contact-submissions/submit/route.ts` shows the existing proxy pattern.
- `backend/src/api/contact-submission/*` shows custom route and service validation patterns.

### Institutional Learnings

- Contact submissions use App Router proxy -> Strapi custom route -> Strapi service.
- Do not invent a backend schema for `haberler`; it stays frontend-only unless explicitly required.

## Key Technical Decisions

- Create a dedicated `newsletter-subscription` content type rather than overloading contact submissions: subscriptions have consent/status/source semantics and future unsubscribe needs.
- On duplicate active email, update source/consent timestamp if useful and return success; do not create duplicate rows.
- Use a shared compact client component with context-specific wrapper text, keeping footer/news/closed-event UI consistent.
- Capture source at page/path/content level, not personal user values.

## Open Questions

### Resolved During Planning

- Duplicate behavior: upsert by normalized email and return a calm success response.
- Component reuse: one compact form component with context-specific heading/body props.
- Source granularity: store `sourcePage`, optional `sourceContentType`, and optional `sourceContentSlug`.

### Deferred to Implementation

- Final legal copy after legal review.
- Future unsubscribe model when actual newsletters are sent.

## Implementation Units

- [ ] **Unit 1: Subscription backend model and endpoint**

**Goal:** Persist newsletter subscriptions with consent and source context.

**Requirements:** R1, R2, R3, R5, R6

**Dependencies:** None

**Files:**
- Create: `backend/src/api/newsletter-subscription/content-types/newsletter-subscription/schema.json`
- Create: `backend/src/api/newsletter-subscription/controllers/newsletter-subscription.ts`
- Create: `backend/src/api/newsletter-subscription/routes/newsletter-subscription.ts`
- Create: `backend/src/api/newsletter-subscription/routes/custom-newsletter-subscription.ts`
- Create: `backend/src/api/newsletter-subscription/services/newsletter-subscription.ts`
- Test: `backend/tests/api/newsletter-subscription/service.test.ts`
- Test: `backend/tests/api/newsletter-subscription/routes.test.ts`

**Approach:**
- Fields: `email`, `consentAccepted`, `consentTextSnapshot`, `status`, `sourcePage`, `sourceContentType`, `sourceContentSlug`, `subscribedAt`, `lastSeenAt`.
- Normalize email to lowercase.
- Upsert by email; duplicate active subscription returns success and refreshes `lastSeenAt` and source.
- Do not send email.

**Patterns to follow:**
- `backend/src/api/contact-submission/controllers/contact-submission.ts`
- `backend/src/api/contact-submission/services/contact-submission.ts`

**Test scenarios:**
- Happy path: new email with consent creates active subscription.
- Happy path: duplicate email returns success without creating a second row.
- Error path: missing consent rejects with validation error.
- Error path: invalid email rejects with user-safe validation.
- Integration: source fields persist for a closed event detail submission.

**Verification:**
- Strapi stores one active row per normalized email.

- [ ] **Unit 2: Frontend proxy and shared form component**

**Goal:** Add one reusable subscription form and submit it through the app proxy.

**Requirements:** R1, R2, R3, R5

**Dependencies:** Unit 1

**Files:**
- Create: `frontend/src/app/api/newsletter-subscriptions/subscribe/route.ts`
- Create: `frontend/src/components/newsletter-subscription-form.tsx`
- Create: `frontend/src/hooks/use-newsletter-subscription-form.ts`
- Test: `frontend/src/__tests__/newsletter-subscription-source.test.mjs`

**Approach:**
- Client component collects email and consent checkbox.
- Component accepts display context and hidden source props.
- Success message covers both new and already-subscribed outcomes.
- Avoid additional fields in the first version.

**Patterns to follow:**
- `ContactForm` field styling and submit lifecycle.
- App Router proxy pattern under `frontend/src/app/api/*`.

**Test scenarios:**
- Happy path: valid email and consent submit expected payload.
- Edge case: duplicate success response renders calm success text.
- Error path: missing consent blocks submit or shows validation.
- Integration: proxy forwards to Strapi and does not expose Strapi internals in UI copy.

**Verification:**
- The shared component works in compact footer and page contexts.

- [ ] **Unit 3: Visibility surfaces**

**Goal:** Place the subscription action in footer, news page, and closed event detail.

**Requirements:** R4

**Dependencies:** Unit 2

**Files:**
- Modify: `frontend/src/components/site-footer.tsx`
- Modify: `frontend/src/app/haberler/page.tsx`
- Modify: `frontend/src/app/etkinlikler/[slug]/page.tsx`
- Test: `frontend/src/__tests__/newsletter-visibility-source.test.mjs`

**Approach:**
- Footer and news page frame the form as Academy newsletter/announcements.
- Closed event detail uses the same form or CTA with event source context.
- Open events keep registration as the primary action.

**Patterns to follow:**
- Existing footer link density.
- Event closed-state CTA plan.

**Test scenarios:**
- Happy path: footer renders newsletter form with source `footer`.
- Happy path: news page renders newsletter form without requiring a backend news model.
- Happy path: closed event renders `Duyurulardan Haberdar Ol`.
- Edge case: open event does not hide or compete with `Etkinliğe Kayıt Ol`.

**Verification:**
- The first visibility surfaces match the origin: footer, haberler, closed event detail.

- [ ] **Unit 4: Consent and measurement hooks**

**Goal:** Make consent copy and subscription behavior auditable without adding campaign sending.

**Requirements:** R5, R6

**Dependencies:** Unit 2

**Files:**
- Modify: `frontend/src/components/newsletter-subscription-form.tsx`
- Modify: `frontend/src/lib/analytics-events.ts`
- Test: `frontend/src/__tests__/newsletter-consent-measurement-source.test.mjs`

**Approach:**
- Display concise Turkish purpose/consent copy with KVKK link.
- Send only behavior metadata to analytics; never email addresses.
- Capture consent text snapshot in backend payload.

**Patterns to follow:**
- `/kvkk` link pattern in `ContactForm`.
- Measurement-spine no-PII event property rules.

**Test scenarios:**
- Happy path: consent text links to `/kvkk`.
- Happy path: analytics event includes source but not email.
- Error path: failed submit emits failure reason only.

**Verification:**
- Consent and source are auditable, but no campaign sending behavior exists.

## System-Wide Impact

- **Interaction graph:** footer, news page, event detail, Next proxy, Strapi subscription route.
- **Error propagation:** duplicate email should return success; validation errors should be Turkish and non-technical.
- **State lifecycle risks:** upsert must prevent duplicate active rows.
- **API surface parity:** frontend proxy and backend endpoint share `email`, `consentAccepted`, and source fields.
- **Integration coverage:** exercise footer and closed-event submissions against a running backend.
- **Unchanged invariants:** general contact and event registration flows remain separate.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Consent language is not legally final | Store a snapshot and mark legal review as launch dependency. |
| Duplicate handling creates noisy rows | Upsert by normalized email. |
| Newsletter looks like event-only fallback | Use generic newsletter framing in footer and news page. |

## Sources & References

- Origin document: `docs/brainstorms/2026-04-27-bulten-duyuru-aboneligi-requirements.md`
- Related code: `frontend/src/components/site-footer.tsx`
- Related code: `frontend/src/app/etkinlikler/[slug]/page.tsx`
- Related code: `backend/src/api/contact-submission/services/contact-submission.ts`
