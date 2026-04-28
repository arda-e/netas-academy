---
title: "feat: Add content taxonomy foundation"
type: feat
status: active
date: 2026-04-27
origin: docs/brainstorms/2026-04-27-genel-icerik-taksonomisi-requirements.md
---

# feat: Add content taxonomy foundation

## Overview

Add a small first-phase taxonomy for education discovery: one main topic area per course, visible level and target-team signals, and event topic badges without adding blog taxonomy or event topic filters.

## Problem Frame

The site needs enough taxonomy to help users answer “hangi eğitim bana uygun?” without creating heavy editorial debt. The origin document limits first phase scope to courses and events, with topic-area filtering only on `/egitimler` (see origin: `docs/brainstorms/2026-04-27-genel-icerik-taksonomisi-requirements.md`).

## Requirements Trace

- R1. Taxonomy primarily improves course discovery.
- R2. Topic area is the main discovery axis with six fixed values.
- R3. Each course has exactly one topic area.
- R4. Target team/role is visible editorial text, not a filter.
- R5. Level is one fixed single-select signal, visible but not necessarily a filter.
- R6. `/egitimler` filters by topic area; `/etkinlikler` shows topic area as badge only.
- R7. Blog is excluded from first-phase taxonomy.

## Scope Boundaries

- No subcategories, free tags, multi-topic courses, advanced search, SEO cluster model, blog filtering, event topic filter, or campaign taxonomy.

## Context & Research

### Relevant Code and Patterns

- `backend/src/api/course/content-types/course/schema.json` and `backend/src/api/event/content-types/event/schema.json` are the target schemas.
- `frontend/src/app/egitimler/page.tsx` can add URL-driven filtering similar to events.
- `frontend/src/app/etkinlikler/page.tsx` already has URL-driven event-type filters that should not be overloaded in first phase.
- `frontend/src/lib/strapi.ts` is the source of truth for frontend query fields and types.

### Institutional Learnings

- Event controls should remain compact and type-focused.
- Shared content card styling should show signals without increasing card heaviness.

## Key Technical Decisions

- Store `topicArea` as an enum on courses and optionally on events for independent event support; event display can also fall back to linked course topic.
- Store `level` as an enum on courses.
- Store `targetAudience` or `targetTeams` as free text on courses.
- Keep event topic filtering out of first version; show badge only.
- Use URL query param `topic` for `/egitimler` filter to match existing event filter patterns.

## Open Questions

### Resolved During Planning

- Event topic source: use a hybrid display model. Prefer event’s own topic when set; otherwise inherit linked course topic.
- `/egitimler` control pattern: use compact chip links with query params, mirroring `/etkinlikler`.
- Card signal priority: topic badge, level badge, then target audience line.

### Deferred to Implementation

- Exact enum slugs for Turkish visible labels; implementation should define stable ASCII values with Turkish display labels.
- Usage threshold for adding event topic filters later.

## Implementation Units

- [ ] **Unit 1: Taxonomy schema fields**

**Goal:** Add topic, level, and target-audience fields to course/event content types.

**Requirements:** R2, R3, R4, R5, R6

**Dependencies:** None

**Files:**
- Modify: `backend/src/api/course/content-types/course/schema.json`
- Modify: `backend/src/api/event/content-types/event/schema.json`
- Modify: `backend/scripts/seed-demo.js`
- Test: `backend/tests/api/content-taxonomy/schema.test.ts`

**Approach:**
- Course: required or strongly editorially expected `topicArea`, optional `level`, optional `targetAudience`.
- Event: optional `topicArea` for independent events; linked-course fallback handles empty values.
- Use stable enum values and Turkish display mapping in frontend.

**Patterns to follow:**
- Existing `eventType` enum on event schema.

**Test scenarios:**
- Happy path: seeded course has one topic area and one level.
- Happy path: independent event can carry its own topic area.
- Edge case: course-linked event without topic area can inherit course topic in frontend.
- Error path: unsupported enum value is rejected by schema.

**Verification:**
- Demo courses cover the six topic areas enough to make filters visible.

- [ ] **Unit 2: Frontend taxonomy contract**

**Goal:** Type and normalize taxonomy values in the frontend.

**Requirements:** R2, R4, R5, R6

**Dependencies:** Unit 1

**Files:**
- Modify: `frontend/src/lib/strapi.ts`
- Create: `frontend/src/lib/content-taxonomy.ts`
- Test: `frontend/src/__tests__/content-taxonomy-source.test.mjs`

**Approach:**
- Define topic and level types plus Turkish labels.
- Add normalizers similar to `normalizeEventType()`.
- Extend course/event fetch queries to include topic and level fields.

**Patterns to follow:**
- `normalizeEventType()` and `StrapiEventType` in `frontend/src/lib/strapi.ts`.

**Test scenarios:**
- Happy path: valid topic slug maps to Turkish display label.
- Edge case: unknown topic returns null rather than throwing.
- Integration: event display helper falls back from event topic to linked course topic.

**Verification:**
- Frontend components can consume typed taxonomy values consistently.

- [ ] **Unit 3: Course topic filter and card signals**

**Goal:** Add first-phase course discovery behavior on `/egitimler`.

**Requirements:** R1, R2, R3, R4, R5, R6

**Dependencies:** Unit 2

**Files:**
- Modify: `frontend/src/app/egitimler/page.tsx`
- Modify: `frontend/src/components/content/courses.tsx`
- Test: `frontend/src/__tests__/course-taxonomy-filter-source.test.mjs`

**Approach:**
- Add topic filter chips driven by `?topic=`.
- Cards show topic, level, and target audience when present.
- Do not add level filter in first version.

**Patterns to follow:**
- `/etkinlikler` filter chip URL pattern.
- Existing `ContentCardShell` card rendering.

**Test scenarios:**
- Happy path: selecting a topic filters courses by one topic area.
- Edge case: unknown topic param shows all or a safe empty state based on implementation choice.
- Happy path: course card displays topic, level, and target audience.
- Integration: filter links preserve simple route semantics and do not affect `/etkinlikler`.

**Verification:**
- Users can narrow courses by topic area on `/egitimler`.

- [ ] **Unit 4: Event topic badge**

**Goal:** Show topic context on events without adding event topic filtering.

**Requirements:** R6, R7

**Dependencies:** Unit 2

**Files:**
- Modify: `frontend/src/app/etkinlikler/page.tsx`
- Modify: `frontend/src/components/content/events.tsx`
- Modify: `frontend/src/app/etkinlikler/[slug]/page.tsx`
- Test: `frontend/src/__tests__/event-topic-badge-source.test.mjs`

**Approach:**
- Add topic badge to event cards/details when event or linked course supplies one.
- Do not add a topic filter to `/etkinlikler`.
- Do not touch blog list/detail.

**Patterns to follow:**
- Current event-type badge and card metadata.

**Test scenarios:**
- Happy path: event with own topic displays that topic.
- Happy path: course-linked event without own topic displays the linked course topic.
- Edge case: event without topic and course displays no empty badge.
- Integration: no new `/etkinlikler?topic=` behavior is introduced.

**Verification:**
- Event topic context is visible but does not add filter complexity.

## System-Wide Impact

- **Interaction graph:** course schema, event schema, seed, course list, event list/detail, Strapi fetch helpers.
- **Error propagation:** unknown taxonomy values normalize to null in frontend.
- **State lifecycle risks:** enum additions require seed/content updates and careful admin value naming.
- **API surface parity:** course and event query fields must match taxonomy helper names.
- **Integration coverage:** seeded course-linked event should demonstrate inheritance.
- **Unchanged invariants:** blog remains outside first-phase taxonomy; event type filter remains unchanged.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Taxonomy grows too broad | Use only the six origin-defined topic areas. |
| Editors need multi-topic courses | Keep first phase single-topic and revisit with usage data. |
| Event filters become crowded | Badge only in first phase. |

## Sources & References

- Origin document: `docs/brainstorms/2026-04-27-genel-icerik-taksonomisi-requirements.md`
- Related code: `frontend/src/app/egitimler/page.tsx`
- Related code: `frontend/src/app/etkinlikler/page.tsx`
- Related code: `backend/src/api/course/content-types/course/schema.json`
