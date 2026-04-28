---
title: "refactor: Reframe home page around trust and demand"
type: refactor
status: active
date: 2026-04-27
origin: docs/brainstorms/2026-04-22-guven-odakli-ana-sayfa-anlatisi-requirements.md
---

# refactor: Reframe home page around trust and demand

## Overview

Replace the current portal-management home message with a corporate training narrative: what problem Netaş Academy solves, who it is, what results it helps teams produce, and where users should go next.

## Problem Frame

The current home page opens with generic portal-management language. The origin document requires a sharper message for business and technical team leaders, with `ne çözüyoruz` first, `biz kimiz` second, and `ne sonuç üretiyoruz` third (see origin: `docs/brainstorms/2026-04-22-guven-odakli-ana-sayfa-anlatisi-requirements.md`).

## Requirements Trace

- R1. Hero answers “ne çözüyoruz” around team transformation and adaptation needs.
- R2. Second layer establishes Netaş Academy trust and identity.
- R3. Lower proof/result layer explains outcomes without inventing unsupported customer cases.
- R4. Primary CTA is `Kurumsal Eğitim Talep Et`; secondary CTA is `Eğitimleri İncele`.
- R5. Home supports corporate training sales while not replacing courses, events, blog, or news.

## Scope Boundaries

- No full visual redesign, new customer case studies, or unrelated page rewrites.
- This plan does not implement the intent-based contact form, but it links to that contract when available.

## Context & Research

### Relevant Code and Patterns

- `frontend/src/app/page.tsx` currently uses `HeroOverlay` and `VisualStorySection`.
- `frontend/src/components/hero-overlay.tsx` owns hero media/text CTA structure.
- `frontend/src/lib/page-visual-sections.ts` stores visual story content.
- `frontend/src/app/layout.tsx` already sets the Turkish document shell.

### Institutional Learnings

- Current visual language uses blue hero/content gradients with `#009ca6` and `#0f4c81`, white page surfaces, and restrained card surfaces.
- Turkish IA and route names should be preserved.

## Key Technical Decisions

- Reuse `HeroOverlay` unless implementation proves it cannot support the CTA/copy hierarchy; the requirement is narrative order, not a new component.
- Use `/iletisim?intent=corporate_training_request` for the primary CTA when the intent form exists; otherwise target `/iletisim` and keep the label stable.
- Avoid invented metrics or client logos; results language should be outcome-oriented but evidence-safe.
- Keep home page server-rendered.

## Open Questions

### Resolved During Planning

- Existing component fit: start with `HeroOverlay` plus reworked sections; do not create a new home framework unless necessary.
- Result layer format: use outcome cards or concise proof blocks because no real customer case content is available.

### Deferred to Implementation

- Final hero/support copy after checking exact visual fit on desktop and mobile.

## Implementation Units

- [ ] **Unit 1: Hero narrative and CTA contract**

**Goal:** Reframe the first viewport around the transformation problem and corporate request CTA.

**Requirements:** R1, R4

**Dependencies:** None

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/components/hero-overlay.tsx`
- Test: `frontend/src/__tests__/home-hero-source.test.mjs`

**Approach:**
- Replace portal-management copy with team transformation/adaptation language.
- Set primary CTA label to `Kurumsal Eğitim Talep Et` and secondary CTA to `Eğitimleri İncele`.
- Preserve route slugs and Turkish labels.

**Patterns to follow:**
- Existing `HeroOverlay` props and visual treatment.

**Test scenarios:**
- Happy path: hero source contains the required CTA labels and destinations.
- Edge case: if intent query helpers exist, primary CTA uses the corporate intent link.
- Integration: secondary CTA remains `/egitimler`.

**Verification:**
- First viewport communicates the problem solved before brand/about copy.

- [ ] **Unit 2: Trust and identity layer**

**Goal:** Add the `biz kimiz` trust layer immediately after the hero.

**Requirements:** R2, R5

**Dependencies:** Unit 1

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/lib/page-visual-sections.ts`
- Test: `frontend/src/__tests__/home-narrative-order-source.test.mjs`

**Approach:**
- Use a section that explains Netaş Academy’s trust basis without turning into a long history page.
- Keep the tone concrete and tied to corporate learning needs.

**Patterns to follow:**
- `VisualStorySection` and existing panel-surface patterns.

**Test scenarios:**
- Happy path: trust layer appears after hero and before result/proof layer.
- Edge case: copy avoids English placeholder text.

**Verification:**
- DOM/source order preserves hero -> trust -> result.

- [ ] **Unit 3: Result and next-step layer**

**Goal:** Add outcome-oriented proof blocks and route users to education discovery or corporate request.

**Requirements:** R3, R4, R5

**Dependencies:** Unit 2

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Test: `frontend/src/__tests__/home-narrative-order-source.test.mjs`

**Approach:**
- Present outcomes such as applicable methods, practical skills, and team adaptation without unsupported metrics.
- Keep blog/events/news as supporting content links only if they do not dominate the main offer.

**Patterns to follow:**
- Current page-section and card/panel density.

**Test scenarios:**
- Happy path: result layer appears after trust layer.
- Edge case: no fake customer metrics or logos are introduced.
- Integration: corporate request CTA is still available below the hero.

**Verification:**
- Home page supports the corporate training sales path while retaining education discovery.

- [ ] **Unit 4: Measurement hooks**

**Goal:** Make home CTA behavior observable for the measurement spine.

**Requirements:** R4

**Dependencies:** Unit 1

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/lib/analytics-events.ts`
- Test: `frontend/src/__tests__/home-measurement-source.test.mjs`

**Approach:**
- Emit or annotate `home_corporate_cta_clicked` and education-discovery click events using the shared analytics helper if present.
- Do not add PII or user-entered data.

**Patterns to follow:**
- Measurement-spine domain-first event naming.

**Test scenarios:**
- Happy path: primary CTA has a stable measurement id.
- Happy path: secondary CTA has a distinct measurement id.

**Verification:**
- Home CTA performance can be measured once analytics transport exists.

## System-Wide Impact

- **Interaction graph:** home page, intent contact flow, education list, analytics helper.
- **Error propagation:** no new backend behavior.
- **State lifecycle risks:** none beyond CTA URL compatibility.
- **API surface parity:** if intent links are introduced, they must match the `/iletisim` plan’s query contract.
- **Integration coverage:** visual check home page at mobile and desktop after implementation.
- **Unchanged invariants:** no route names or Turkish IA changes.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Copy becomes generic marketing | Anchor copy to team transformation and practical learning outcomes. |
| CTA points to intent query before form supports it | Use helper/contract from the intent lead plan or degrade to `/iletisim`. |
| Result layer invents evidence | Use method/outcome language only; no fake metrics or cases. |

## Sources & References

- Origin document: `docs/brainstorms/2026-04-22-guven-odakli-ana-sayfa-anlatisi-requirements.md`
- Related code: `frontend/src/app/page.tsx`
- Related code: `frontend/src/components/hero-overlay.tsx`
- Related code: `frontend/src/lib/page-visual-sections.ts`
