---
title: "refactor: Rework about page trust and learning model"
type: refactor
status: active
date: 2026-04-27
origin: docs/brainstorms/2026-04-27-hakkimizda-kurumsal-guven-ve-egitim-modeli-requirements.md
---

# refactor: Rework about page trust and learning model

## Overview

Refocus `/hakkimizda` around corporate trust, applied learning model, institution-specific program shaping, field-experienced instructors, participant outcomes, and natural CTAs into corporate request and course discovery.

## Problem Frame

The current about page establishes general academy identity, but it does not strongly support the corporate training sales path. The origin document requires a balanced, Turkish, trust-building page that explains Netaş Academy’s model and then routes users naturally to `Kurumsal Eğitim Talebi` or `Eğitimleri İncele` (see origin: `docs/brainstorms/2026-04-27-hakkimizda-kurumsal-guven-ve-egitim-modeli-requirements.md`).

## Requirements Trace

- R1. Position Netaş Academy as powered by Netaş technology/sector experience and shaped around institution needs.
- R2. Tone stays balanced: trustworthy, practical, understandable, and close to business outcomes.
- R3. Content explains applied learning through cases, scenarios, interaction, and real work problems.
- R4. Page shows programs can adapt to sector, team profile, current skill level, and target development areas.
- R5. Instructor section stays visible and tied to field experience.
- R6. Primary CTA is `Kurumsal Eğitim Talebi`; secondary CTA is `Eğitimleri İncele`.

## Scope Boundaries

- Not a standalone sales landing page.
- No invented case stories, logos, success metrics, new CMS model, or new form.
- Teacher listing/detail strategy remains separate; this plan only adjusts about-page instructor visibility.

## Context & Research

### Relevant Code and Patterns

- `frontend/src/app/hakkimizda/page.tsx` currently uses `ContentPageShell`, static `sections`, `VisualStorySection`, and `TeacherCarousel`.
- `frontend/src/components/teacher-carousel.tsx` provides the existing instructor visibility.
- `frontend/src/lib/page-visual-sections.ts` stores visual story content.

### Institutional Learnings

- Hakkimizda and teacher profile work should preserve shared content shells and Turkish copy.
- Existing visual language should remain light, restrained, and consistent.

## Key Technical Decisions

- Keep `/hakkimizda` as a static server-rendered page.
- Reuse `TeacherCarousel` unless implementation shows it cannot carry the updated section framing.
- Add CTAs using the intent lead query contract when available; otherwise link to `/iletisim`.
- Avoid fabricated proof; use method and outcome language.

## Open Questions

### Resolved During Planning

- CTA technical route: use corporate intent link from the lead architecture plan.
- Instructor section: keep existing carousel first, but wrap it in a stronger narrative block tied to field experience.

### Deferred to Implementation

- Exact final Turkish copy after fitting text into the existing visual rhythm.

## Implementation Units

- [ ] **Unit 1: About page narrative flow**

**Goal:** Reorder and rewrite the page content around trust and learning model.

**Requirements:** R1, R2, R3, R4

**Dependencies:** None

**Files:**
- Modify: `frontend/src/app/hakkimizda/page.tsx`
- Modify: `frontend/src/lib/page-visual-sections.ts`
- Test: `frontend/src/__tests__/about-narrative-source.test.mjs`

**Approach:**
- Follow the origin flow: hero promise -> Netaş trust -> applied model -> institution-shaped programs -> instructors -> outcomes.
- Keep copy Turkish and practical.
- Avoid claims that require unavailable customer evidence.

**Patterns to follow:**
- Existing `sections` mapping and `panel-surface` cards.

**Test scenarios:**
- Happy path: source order follows the planned narrative sequence.
- Edge case: no English placeholder copy is introduced.
- Edge case: no fake logos, case metrics, or unsupported customer claims appear.

**Verification:**
- The about page explains the Academy model before asking for action.

- [ ] **Unit 2: CTA integration**

**Goal:** Add primary and secondary next steps without turning the page into a hard-sell landing page.

**Requirements:** R6

**Dependencies:** Intent lead architecture plan for best final URL

**Files:**
- Modify: `frontend/src/app/hakkimizda/page.tsx`
- Modify: `frontend/src/lib/lead-intents.ts`
- Test: `frontend/src/__tests__/about-cta-source.test.mjs`

**Approach:**
- Primary CTA: `Kurumsal Eğitim Talebi`.
- Secondary CTA: `Eğitimleri İncele`.
- Use intent URL for corporate request when available.

**Patterns to follow:**
- Button/link styling in `HeroOverlay` and contact/course pages.

**Test scenarios:**
- Happy path: primary CTA routes to corporate request intent or `/iletisim`.
- Happy path: secondary CTA routes to `/egitimler`.
- Edge case: CTA copy remains low-pressure.

**Verification:**
- Users have clear next steps after reading the trust/model story.

- [ ] **Unit 3: Instructor trust section**

**Goal:** Preserve teacher visibility while tying it to the page’s applied-learning narrative.

**Requirements:** R5

**Dependencies:** None

**Files:**
- Modify: `frontend/src/app/hakkimizda/page.tsx`
- Test: `frontend/src/__tests__/about-teacher-section-source.test.mjs`

**Approach:**
- Keep `TeacherCarousel` as the display component.
- Reframe section heading/body around field experience and applied guidance.
- Do not add dense teacher details here; teacher detail/listing plans cover that.

**Patterns to follow:**
- Existing `TeacherCarousel` props and media helper use.

**Test scenarios:**
- Happy path: teacher carousel still receives teacher name, slug, image URL, and alt text.
- Happy path: section copy mentions field experience/applied guidance.
- Edge case: empty teacher list does not break the page.

**Verification:**
- Instructor visibility supports trust without taking over the page.

- [ ] **Unit 4: Measurement hooks**

**Goal:** Make about-page CTA behavior trackable within the measurement spine.

**Requirements:** R6

**Dependencies:** Measurement helper if available

**Files:**
- Modify: `frontend/src/app/hakkimizda/page.tsx`
- Modify: `frontend/src/lib/analytics-events.ts`
- Test: `frontend/src/__tests__/about-measurement-source.test.mjs`

**Approach:**
- Add stable measurement IDs/events for corporate request and course-discovery CTAs.
- Avoid user data in event properties.

**Patterns to follow:**
- Domain-first measurement naming from the measurement-spine requirements.

**Test scenarios:**
- Happy path: primary and secondary CTAs have distinct measurement identifiers.
- Integration: event names stay domain-specific and no PII is present.

**Verification:**
- About page can be reported as a support surface without merging into the main education funnel.

## System-Wide Impact

- **Interaction graph:** about page, teacher carousel, course page, contact intent flow, analytics helper.
- **Error propagation:** no new backend errors.
- **State lifecycle risks:** no persistent state changes.
- **API surface parity:** CTA intent must match the lead architecture contract.
- **Integration coverage:** visual QA on mobile/desktop for text density and CTA placement.
- **Unchanged invariants:** no new CMS model or fabricated proof.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Page becomes a sales landing page | Keep trust/model explanation primary and CTA natural. |
| Copy overclaims evidence | Use method/outcome language only. |
| Teacher carousel feels disconnected | Reframe heading/body around field-experienced instructors. |

## Sources & References

- Origin document: `docs/brainstorms/2026-04-27-hakkimizda-kurumsal-guven-ve-egitim-modeli-requirements.md`
- Related code: `frontend/src/app/hakkimizda/page.tsx`
- Related code: `frontend/src/components/teacher-carousel.tsx`
