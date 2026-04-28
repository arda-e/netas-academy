---
title: "refactor: Make courses a capability catalog"
type: refactor
status: active
date: 2026-04-27
origin: docs/brainstorms/2026-04-27-egitimler-capability-catalog-requirements.md
---

# refactor: Make courses a capability catalog

## Overview

Reframe `/egitimler` as the main capability catalog: transformation needs first, capability/topic discovery second, detail pages focused on institutional value, scope, related sessions, and corporate request CTA.

## Problem Frame

The courses surface is currently a content list and detail page. The origin document requires it to act as the primary offer surface for corporate training capabilities, with events as related activations rather than replacements for the catalog (see origin: `docs/brainstorms/2026-04-27-egitimler-capability-catalog-requirements.md`).

## Requirements Trace

- R1. Position courses as a capability catalog, not only a class list.
- R2. Use capability/topic areas as the list navigation spine.
- R3. Cards show problem/transformation need after title.
- R4. Add text search at least over titles.
- R5. Detail pages present value -> scope/content -> related events.
- R6. Main detail CTA is `Kurumsal Eğitim Talep Et`.
- R7. Course-event relationship is visible in both directions while preserving independent events.

## Scope Boundaries

- No payment or purchase flow.
- No mandatory multi-layer filtering in the first version.
- Events are not forced under courses; independent events remain valid.

## Context & Research

### Relevant Code and Patterns

- `frontend/src/app/egitimler/page.tsx` is server-rendered and maps `getCourses()` into `CourseList`.
- `frontend/src/app/egitimler/[slug]/page.tsx` renders teacher and description.
- `backend/src/api/course/content-types/course/schema.json` has course/event/teacher relations.
- `backend/src/api/event/content-types/event/schema.json` already links events to courses.

### Institutional Learnings

- Event classification and course/event links already exist; use typed fields in `frontend/src/lib/strapi.ts` as the frontend source of truth.
- Keep shared content shells and Turkish IA intact.

## Key Technical Decisions

- Depend on the content taxonomy plan for `topicArea`, `level`, and `targetAudience` fields; do not invent a separate category system.
- Add course-specific value fields: `businessValue`, `scopeSummary`, and optional `outcomeBullets` to carry capability language.
- Implement first-version search client-side over fetched course title and summary/value fields; backend full-text can be future work.
- Surface related events from the existing course-event relation.
- Use the intent lead link contract for `Kurumsal Eğitim Talep Et`.

## Open Questions

### Resolved During Planning

- Search scope: first version covers title and a small set of fetched text fields; full-text backend search is deferred.
- Value format: use a mixed model of short value text and optional outcome bullets.
- Event relationship display: show a related upcoming sessions section on course detail; event detail can show course badge/link.

### Deferred to Implementation

- Exact number of related events shown before a “tüm etkinlikler” link.
- Final course value copy for existing demo content.

## Implementation Units

- [ ] **Unit 1: Course capability schema**

**Goal:** Add fields that let course content express institutional value and scope.

**Requirements:** R1, R3, R5

**Dependencies:** Content taxonomy plan if topic/level fields land there first

**Files:**
- Modify: `backend/src/api/course/content-types/course/schema.json`
- Modify: `backend/scripts/seed-demo.js`
- Test: `backend/tests/api/course/schema.test.ts`

**Approach:**
- Add optional `businessValue`, `scopeSummary`, and `outcomeBullets`.
- Reuse taxonomy fields from the taxonomy plan rather than duplicating them.
- Seed demo courses with capability-oriented copy.

**Patterns to follow:**
- Existing course schema and seed structure.

**Test scenarios:**
- Happy path: seeded course includes business value and scope summary.
- Edge case: legacy course without value fields remains valid.
- Integration: course-event relation remains intact.

**Verification:**
- Strapi course records can support value -> scope -> related event display.

- [ ] **Unit 2: Course fetch contract**

**Goal:** Fetch capability fields, taxonomy fields, and related events.

**Requirements:** R2, R3, R5, R7

**Dependencies:** Unit 1

**Files:**
- Modify: `frontend/src/lib/strapi.ts`
- Test: `frontend/src/__tests__/course-capability-contract-source.test.mjs`

**Approach:**
- Extend `StrapiCourse` with value/scope/outcome/taxonomy fields.
- Populate related events on course detail with minimal event fields.
- Preserve teacher relation and null-safe fallbacks.

**Patterns to follow:**
- Existing course/event query style in `strapi.ts`.

**Test scenarios:**
- Happy path: list query includes title, slug, summary, business value, topic area, level, target audience.
- Happy path: detail query includes related events.
- Edge case: no related events returns an empty array/null-safe value.

**Verification:**
- Frontend can render course capability cards and detail without additional fetches.

- [ ] **Unit 3: Capability catalog list**

**Goal:** Update `/egitimler` into a searchable capability discovery surface.

**Requirements:** R1, R2, R3, R4

**Dependencies:** Unit 2

**Files:**
- Modify: `frontend/src/app/egitimler/page.tsx`
- Modify: `frontend/src/components/content/courses.tsx`
- Create: `frontend/src/components/courses/course-catalog-list.tsx`
- Test: `frontend/src/__tests__/course-catalog-list-source.test.mjs`

**Approach:**
- Keep the page shell server-rendered.
- Use a small client island for topic/search filtering if taxonomy filter is already available.
- Cards show title, business value/problem, topic area, level, target audience, and teacher as secondary context.

**Patterns to follow:**
- `ContentGrid`, `ContentCardShell`, current course visual rhythm.

**Test scenarios:**
- Happy path: title search narrows course cards.
- Happy path: topic area filter narrows results when taxonomy fields exist.
- Edge case: empty search/filter result shows helpful copy.
- Integration: course card links to `/egitimler/[slug]`.

**Verification:**
- Users can scan courses as capability/problem areas, not only course titles.

- [ ] **Unit 4: Course detail value and related events**

**Goal:** Reorder detail pages around corporate value and course-event relationship.

**Requirements:** R5, R6, R7

**Dependencies:** Unit 2

**Files:**
- Modify: `frontend/src/app/egitimler/[slug]/page.tsx`
- Modify: `frontend/src/components/content/courses.tsx`
- Test: `frontend/src/__tests__/course-detail-capability-source.test.mjs`

**Approach:**
- Render value first, scope/content second, related events third, and corporate request CTA prominently.
- Keep teacher link visible but not as the primary decision axis.
- Related events link to `/etkinlikler/[slug]`.

**Patterns to follow:**
- `ContentDetailShell` and existing event card metadata patterns.

**Test scenarios:**
- Happy path: detail page renders `Kurumsal Eğitim Talep Et`.
- Happy path: related event with course relation appears in upcoming sessions section.
- Edge case: no related events omits the section without blank panels.
- Integration: CTA uses corporate training intent link when available.

**Verification:**
- Course detail communicates value -> scope -> live activation path.

- [ ] **Unit 5: Event-side course relationship**

**Goal:** Show the capability/course relationship on event detail when present.

**Requirements:** R7

**Dependencies:** Unit 2

**Files:**
- Modify: `frontend/src/app/etkinlikler/[slug]/page.tsx`
- Test: `frontend/src/__tests__/event-course-relationship-source.test.mjs`

**Approach:**
- Display linked course as a badge, breadcrumb-like line, or side-panel context.
- Preserve independent events when no course exists.

**Patterns to follow:**
- Existing event detail eyebrow currently uses `event.course?.title`.

**Test scenarios:**
- Happy path: course-linked event links back to course detail.
- Edge case: independent event displays normal event context.

**Verification:**
- Course-event relationship is visible both directions.

## System-Wide Impact

- **Interaction graph:** course schema, event relation, course list/detail, event detail, intent contact flow.
- **Error propagation:** missing new course fields must fall back to summary/description.
- **State lifecycle risks:** optional fields protect existing records; seed should update demo content.
- **API surface parity:** course and event queries need matching relation fields.
- **Integration coverage:** manual check course with related events and independent event.
- **Unchanged invariants:** events can remain independent; no purchase flow.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Duplicates taxonomy work | Depend on the taxonomy plan for topic/level fields. |
| Search scope feels larger than implemented | Label/behavior should stay simple and keyword based. |
| Detail page becomes too sales-heavy | Keep value and scope before CTA; no aggressive sales language. |

## Sources & References

- Origin document: `docs/brainstorms/2026-04-27-egitimler-capability-catalog-requirements.md`
- Related origin: `docs/brainstorms/2026-04-27-genel-icerik-taksonomisi-requirements.md`
- Related code: `frontend/src/app/egitimler/page.tsx`
- Related code: `backend/src/api/course/content-types/course/schema.json`
