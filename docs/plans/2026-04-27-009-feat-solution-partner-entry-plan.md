---
title: "feat: Add solution partner entry surface"
type: feat
status: active
date: 2026-04-27
origin: docs/brainstorms/2026-04-27-cozum-ortagi-requirements.md
---

# feat: Add solution partner entry surface

## Overview

Create a calm, low-commitment solution partner page and connect it to the intent-based lead flow without turning the page into a high-pressure partner program.

## Problem Frame

The solution partner surface should describe collaboration areas and invite users to share a potential idea. It should avoid narrow categorization, customer-matching language, or strong process promises (see origin: `docs/brainstorms/2026-04-27-cozum-ortagi-requirements.md`).

## Requirements Trace

- R1. Main message: `Eğitim ve danışmanlık alanında birlikte yeni değer üretelim`.
- R2. First block explains collaboration areas, not “kimler başvurabilir”.
- R3. Second block is a low-promise application entry: `Başvurunuzu inceleyelim`.
- R4. Collaboration areas are education programs, consulting services, workshops/facilitation, and sector/topic expertise.
- R5. Tone stays professional, calm, and low-commitment.

## Scope Boundaries

- No acceptance program, partner scoring, matching marketplace, customer acquisition promise, or separate partner portal.
- This plan assumes the application is submitted through the shared intent lead architecture, not a bespoke backend model.

## Planning Assumption

The origin document has a `Resolve Before Planning` question about whether the form should split `bireysel uzman` and `şirket-ekip adına`. To avoid blocking the full requirements batch, this plan assumes the public page remains a single umbrella and the first form version may include an optional applicant-profile field only if the intent lead implementation already supports it. This product choice should be revisited before implementation if the user wants a stricter split.

## Context & Research

### Relevant Code and Patterns

- `frontend/src/app/hakkimizda/page.tsx` shows how static narrative pages use `ContentPageShell`.
- `frontend/src/app/iletisim/page.tsx` is the target for intent-based applications.
- The intent lead plan uses `leadType=solution_partner_application`.

### Institutional Learnings

- Preserve Turkish IA and avoid generic English placeholders.
- Lead flows should use typed intent contracts rather than UI-only flags.

## Key Technical Decisions

- Add a dedicated `/cozum-ortagi` page as an explanatory entry surface, then route applications into `/iletisim?intent=solution_partner_application`.
- Keep the first page content static in the frontend; no CMS model is required for this small narrative surface.
- Use the shared lead model for persistence so solution partner applications can route with other intent-based submissions.
- Keep collaboration areas as visible page content and `partnershipArea` as free text in the first form version.

## Open Questions

### Resolved During Planning

- Data model: use the shared lead/contact infrastructure first, not a separate partner model.
- Collaboration area structure: visible fixed examples on the page; free-text `partnershipArea` in the form.

### Deferred to Implementation

- Whether to add the optional applicant-profile split depends on final product preference.
- Whether to add a navigation/footer link depends on IA appetite once the page exists.

## Implementation Units

- [ ] **Unit 1: Static solution partner page**

**Goal:** Add a dedicated page that communicates the partnership offer and collaboration areas.

**Requirements:** R1, R2, R4, R5

**Dependencies:** None

**Files:**
- Create: `frontend/src/app/cozum-ortagi/page.tsx`
- Test: `frontend/src/__tests__/solution-partner-page-source.test.mjs`

**Approach:**
- Use `ContentPageShell` and existing panel surfaces.
- First content block: `Hangi alanlarda çözüm ortaklığı yapabiliriz`.
- Do not include `Kimler başvurabilir` in the first version.
- Use the exact low-commitment tone from the origin.

**Patterns to follow:**
- `frontend/src/app/hakkimizda/page.tsx`
- `frontend/src/app/iletisim/page.tsx` Turkish narrative density.

**Test scenarios:**
- Happy path: page contains the required main message.
- Happy path: page shows all four collaboration areas.
- Edge case: page does not include high-promise process language or customer-matching copy.

**Verification:**
- `/cozum-ortagi` renders as a calm standalone entry surface.

- [ ] **Unit 2: Application CTA and intent link**

**Goal:** Connect the page to the correct intent-based application flow.

**Requirements:** R3

**Dependencies:** Intent lead architecture plan or equivalent `/iletisim` intent support

**Files:**
- Modify: `frontend/src/app/cozum-ortagi/page.tsx`
- Modify: `frontend/src/lib/lead-intents.ts`
- Test: `frontend/src/__tests__/solution-partner-page-source.test.mjs`

**Approach:**
- CTA label should align with `Başvurunuzu inceleyelim`.
- Route to `/iletisim?intent=solution_partner_application`.
- If intent support is not implemented yet, keep the CTA target compatible with the upcoming query contract.

**Patterns to follow:**
- Intent link helper from `docs/plans/2026-04-27-002-refactor-intent-based-lead-architecture-plan.md`.

**Test scenarios:**
- Happy path: CTA target includes `intent=solution_partner_application`.
- Edge case: CTA copy does not promise acceptance, response time, or matching.
- Integration: arriving at `/iletisim` opens the solution partner tab once intent support exists.

**Verification:**
- Users can move from solution partner explanation to the correct form intent.

- [ ] **Unit 3: Solution partner lead handling**

**Goal:** Ensure submitted partner applications persist and route as a typed lead.

**Requirements:** R3, R4

**Dependencies:** Intent lead architecture backend units

**Files:**
- Modify: `backend/src/api/contact-submission/content-types/contact-submission/schema.json`
- Modify: `backend/src/api/contact-submission/services/contact-submission.ts`
- Modify: `backend/src/services/internal-notifications/keys.ts`
- Modify: `backend/src/services/internal-notifications/templates.ts`
- Test: `backend/tests/api/contact-submission/service.test.ts`
- Test: `backend/tests/internal-notifications/templates.test.ts`

**Approach:**
- Persist `leadType=solution_partner_application` and free-text `partnershipArea`.
- Route notifications with a distinct key or a leadType-aware contact notification template.
- Do not require applicant identity split unless the product blocker is resolved in favor of it.

**Patterns to follow:**
- Existing contact submission service and internal notification templates.

**Test scenarios:**
- Happy path: solution partner application with `partnershipArea` persists as new lead.
- Error path: missing `partnershipArea` rejects for this lead type.
- Integration: notification payload includes lead type and partnership area.

**Verification:**
- Operations can distinguish solution partner leads from corporate training and general contact.

## System-Wide Impact

- **Interaction graph:** new page, optional nav/footer entry, intent contact form, contact-submission backend, notification routing.
- **Error propagation:** form errors are owned by shared lead architecture.
- **State lifecycle risks:** avoid a separate partner table until lifecycle/status needs differ from leads.
- **API surface parity:** solution partner page must use the same intent ID as backend `leadType`.
- **Integration coverage:** page CTA to form tab should be exercised after intent form lands.
- **Unchanged invariants:** no marketplace, no acceptance program, no broad partner portal.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Origin doc is in-progress with one product blocker | Record the assumption and revisit before implementation if the split matters. |
| Page over-promises process | Keep copy low-commitment and avoid response/acceptance promises. |
| Duplicate form model emerges | Use shared lead infrastructure and `leadType`. |

## Sources & References

- Origin document: `docs/brainstorms/2026-04-27-cozum-ortagi-requirements.md`
- Related plan: `docs/plans/2026-04-27-002-refactor-intent-based-lead-architecture-plan.md`
- Related code: `frontend/src/app/iletisim/page.tsx`
