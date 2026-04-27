---
title: "refactor: Make events registration focused"
type: refactor
status: active
date: 2026-04-27
origin: docs/brainstorms/2026-04-22-etkinlikler-requirements.md
---

# refactor: Make events registration focused

## Overview

Strengthen event list and detail pages around registration intent: upcoming value first, clean rich text, consistent open/closed CTA behavior, and a newsletter fallback when registration is closed.

## Problem Frame

Events should be a registration opportunity surface, not just an archive. The origin document requires value-first cards, detail hierarchy of value -> logistics -> CTA, clean content rendering, and `Duyurulardan Haberdar Ol` when registration is closed (see origin: `docs/brainstorms/2026-04-22-etkinlikler-requirements.md`).

## Requirements Trace

- R1. List upcoming opportunities clearly and preserve existing type filter/sort behavior.
- R2. Cards show event value/summary before date/time/location.
- R3. Detail pages present value, logistics, and CTA in that order.
- R4. Render rich text cleanly; no raw HTML artifacts.
- R5. Registration-open CTA is `Etkinliğe Kayıt Ol`; closed CTA becomes newsletter/announcement signup.
- R6. Detail page and side panel reflect the same CTA state.

## Scope Boundaries

- No calendar view, payment flow, QR campaign flow, or conversion of events into course sales pages.
- Newsletter subscription implementation is planned separately in `docs/brainstorms/2026-04-27-bulten-duyuru-aboneligi-requirements.md`; this plan integrates with that component when available.

## Context & Research

### Relevant Code and Patterns

- `frontend/src/app/etkinlikler/page.tsx` has URL-driven type filtering and sort.
- `frontend/src/app/etkinlikler/[slug]/page.tsx` renders its own two-column detail structure.
- `frontend/src/lib/event-registration.ts` and backend registration service define open/closed registration semantics.
- `backend/src/api/event/content-types/event/schema.json` stores `details` as richtext and links events to courses.

### Institutional Learnings

- Accepted event list controls are URL-driven, compact, and preserve sort params.
- Registration-open rule: allow when `keepRegistrationsOpen` is true, otherwise require `now < startsAt - 24h`.
- Event detail previously matched registration layout by rendering its own two-column structure.

## Key Technical Decisions

- Keep existing filter/sort IA and adjust content hierarchy, not the control model.
- Use the shared registration-open helper on frontend and backend where possible to avoid CTA drift.
- Add a safe rich-text rendering component before changing event copy; raw Strapi richtext strings are the current risk.
- Integrate closed-state CTA with the newsletter component once that plan lands; until then route to the subscription surface contract.

## Open Questions

### Resolved During Planning

- Closed CTA destination: use the newsletter/announcement subscription flow rather than existing contact form.
- Rich text strategy: add a controlled renderer component for Strapi rich text rather than printing strings inside `<p>`.

### Deferred to Implementation

- Whether to backfill existing event details that contain HTML-rich strings after the renderer is in place.

## Implementation Units

- [ ] **Unit 1: Event data and registration state contract**

**Goal:** Provide event pages with clean state and content fields for value-first rendering.

**Requirements:** R1, R3, R5, R6

**Dependencies:** None

**Files:**
- Modify: `frontend/src/lib/strapi.ts`
- Modify: `frontend/src/lib/event-registration.ts`
- Test: `frontend/src/__tests__/event-strapi-contract-source.test.mjs`

**Approach:**
- Ensure event list/detail queries include `summary`, `details`, `startsAt`, `endsAt`, `location`, `keepRegistrationsOpen`, `eventType`, and course relation.
- Expose a frontend registration state helper aligned with backend `isEventRegistrationOpen`.

**Patterns to follow:**
- Existing `normalizeEventType()` and event query helpers.

**Test scenarios:**
- Happy path: upcoming event with registration open returns open CTA state.
- Edge case: `keepRegistrationsOpen=true` keeps the CTA open after the 24-hour cutoff.
- Edge case: closed event returns newsletter CTA state.

**Verification:**
- List and detail pages use the same registration-state logic.

- [ ] **Unit 2: Value-first event listing**

**Goal:** Reorder event cards around event value while preserving filters and sort.

**Requirements:** R1, R2

**Dependencies:** Unit 1

**Files:**
- Modify: `frontend/src/app/etkinlikler/page.tsx`
- Modify: `frontend/src/components/content/events.tsx`
- Test: `frontend/src/__tests__/events-list-source.test.mjs`

**Approach:**
- Keep current filter chips and icon sort.
- Ensure summary/value is visually before date/location metadata in each card.
- Preserve empty-state behavior by selected event type.

**Patterns to follow:**
- `ContentCardShell` and current event filter URL construction.

**Test scenarios:**
- Happy path: event card source renders summary before date metadata.
- Happy path: selected type filter preserves sort query.
- Edge case: empty filtered result shows type-specific empty text.

**Verification:**
- Event list still answers “which events are coming?” while making value visible before logistics.

- [ ] **Unit 3: Clean event detail rich text and CTA state**

**Goal:** Make detail pages persuasive, readable, and state-consistent.

**Requirements:** R3, R4, R5, R6

**Dependencies:** Unit 1

**Files:**
- Modify: `frontend/src/app/etkinlikler/[slug]/page.tsx`
- Create: `frontend/src/components/content/rich-text-content.tsx`
- Test: `frontend/src/__tests__/event-detail-source.test.mjs`

**Approach:**
- Render summary/value first, logistics in the side panel, and the CTA after state resolution.
- Use the same CTA label in hero/body and side panel.
- Use a constrained rich-text renderer for Strapi `details`.

**Patterns to follow:**
- Existing event detail two-column structure.
- Current light panel styling and button primitives.

**Test scenarios:**
- Happy path: open event renders `Etkinliğe Kayıt Ol` linking to `/etkinlikler/[slug]/kayit`.
- Happy path: closed event renders `Duyurulardan Haberdar Ol`.
- Error path: `details` containing HTML tags renders as formatted content, not visible raw tags.
- Integration: side panel and main CTA use the same computed state.

**Verification:**
- Detail pages have no raw HTML artifacts and never show conflicting CTA states.

- [ ] **Unit 4: Newsletter fallback integration**

**Goal:** Connect closed event CTA to the newsletter/announcement subscription surface.

**Requirements:** R5, R6

**Dependencies:** Unit 3 and the newsletter subscription plan

**Files:**
- Modify: `frontend/src/app/etkinlikler/[slug]/page.tsx`
- Modify: `frontend/src/components/newsletter-subscription-form.tsx`
- Test: `frontend/src/__tests__/event-newsletter-fallback-source.test.mjs`

**Approach:**
- If the shared newsletter component exists, embed or link to it with event source context.
- Do not show newsletter as primary CTA while registration is open.

**Patterns to follow:**
- Newsletter source contract from `docs/plans/2026-04-27-008-feat-newsletter-announcement-subscription-plan.md`.

**Test scenarios:**
- Happy path: closed event exposes newsletter signup with event source context.
- Edge case: open event does not render newsletter as the primary action.
- Integration: source metadata never includes attendee personal data.

**Verification:**
- Closed registration users have a clear next action instead of a dead end.

## System-Wide Impact

- **Interaction graph:** event list, event detail, registration form, newsletter subscription, Strapi event data.
- **Error propagation:** invalid/missing event data should fall back to existing not-found/null-safe behavior.
- **State lifecycle risks:** CTA state must not diverge between frontend display and backend registration validation.
- **API surface parity:** event detail and list need enough fields to compute state and display context.
- **Integration coverage:** manually exercise open, closed, and override-open events against seeded data.
- **Unchanged invariants:** event registration flow remains the only registration submit path.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Closed CTA depends on newsletter work | Keep integration behind a shared component/source contract and land after newsletter if necessary. |
| Rich text renderer introduces unsafe HTML | Render a constrained subset or sanitize before rendering. |
| CTA open/closed drift | Reuse helper semantics and add explicit source tests. |

## Sources & References

- Origin document: `docs/brainstorms/2026-04-22-etkinlikler-requirements.md`
- Related code: `frontend/src/app/etkinlikler/page.tsx`
- Related code: `frontend/src/app/etkinlikler/[slug]/page.tsx`
- Related code: `frontend/src/lib/event-registration.ts`
