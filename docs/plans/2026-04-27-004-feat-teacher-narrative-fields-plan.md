---
title: "feat: Strengthen teacher narrative hierarchy"
type: feat
status: active
date: 2026-04-27
origin: docs/brainstorms/2026-04-22-egitmen-anlatisi-requirements.md
---

# feat: Strengthen teacher narrative hierarchy

## Overview

Rework teacher-facing surfaces so they answer the corporate buyer’s decision questions first: expertise, team/level fit, teaching approach, related courses, then biography.

## Problem Frame

Teacher profiles currently answer “who is this person?” but do not quickly answer “which need is this instructor right for?” The origin document requires cards and detail pages to prioritize expertise, fit, and teaching approach over long biography (see origin: `docs/brainstorms/2026-04-22-egitmen-anlatisi-requirements.md`).

## Requirements Trace

- R1. Position teachers as trust and fit evidence for corporate training.
- R2. Show expertise and suitable team/level context on card/listing surfaces.
- R3. Detail hierarchy must be expertise -> fit -> teaching approach -> related courses -> bio.
- R4. Preserve long bio as supporting content below decision-support sections.
- R5. Fall back gracefully when new fields are empty.

## Scope Boundaries

- No teacher ratings, reviews, endorsements, or separate instructor sales process.
- This plan does not require a new `/egitmenler` listing page; that is covered by `docs/brainstorms/2026-04-22-egitmenler-listing-and-schema-extension-requirements.md`.

## Context & Research

### Relevant Code and Patterns

- `backend/src/api/teacher/content-types/teacher/schema.json` has `fullName`, `headline`, `bio`, `email`, `profilePhoto`, and `courses`.
- `frontend/src/app/egitmenler/[slug]/page.tsx` renders photo, name, headline, bio, and courses.
- `frontend/src/components/teacher-carousel.tsx` is intentionally lightweight on `/hakkimizda`.
- `frontend/src/lib/strapi.ts` owns teacher type and query fields.

### Institutional Learnings

- Existing teacher/profile work uses SSG-style route generation patterns and shared content shells.
- Keep `/hakkimizda` carousel lightweight unless a requirement explicitly changes it.

## Key Technical Decisions

- Use three optional teacher fields: `expertiseAreas`, `targetTeams`, and `teachingApproach`, matching the more concrete teacher listing requirements.
- Store `expertiseAreas` as JSON `string[]` in first version to avoid component overhead while preserving multi-value display.
- Keep `targetTeams` and `teachingApproach` as editorial text because fit and delivery style are nuanced.
- Update detail hierarchy now; keep `/hakkimizda` carousel visually simple but allow it to receive richer data later.

## Open Questions

### Resolved During Planning

- Field structure: use the concrete schema from the listing/schema requirements to avoid two competing teacher models.
- Carousel density: do not add the new fields to `TeacherCarousel` in this plan; it remains a trust preview.

### Deferred to Implementation

- Exact truncation length for small card contexts after real copy is seeded.

## Implementation Units

- [ ] **Unit 1: Teacher narrative schema**

**Goal:** Add optional fields that support expertise, team fit, and teaching approach.

**Requirements:** R1, R2, R3, R5

**Dependencies:** None

**Files:**
- Modify: `backend/src/api/teacher/content-types/teacher/schema.json`
- Modify: `backend/scripts/seed-demo.js`
- Test: `backend/tests/api/teacher/schema.test.ts`

**Approach:**
- Add optional `expertiseAreas`, `targetTeams`, and `teachingApproach`.
- Keep existing `headline` and `bio` for backwards compatibility and fallback.
- Seed every demo teacher with realistic values.

**Patterns to follow:**
- Existing teacher schema and seed upsert flow.

**Test scenarios:**
- Happy path: demo teacher has all three new fields.
- Edge case: teacher without new fields remains valid.
- Integration: seed rerun updates existing teacher records without duplicating them.

**Verification:**
- New fields are available in Strapi and local demo content covers the intended hierarchy.

- [ ] **Unit 2: Teacher fetch contract**

**Goal:** Make teacher narrative fields available to profile and future listing surfaces.

**Requirements:** R2, R3, R5

**Dependencies:** Unit 1

**Files:**
- Modify: `frontend/src/lib/strapi.ts`
- Test: `frontend/src/__tests__/teacher-strapi-contract-source.test.mjs`

**Approach:**
- Extend `StrapiTeacher` with optional `expertiseAreas`, `targetTeams`, and `teachingApproach`.
- Request the fields in `getTeachers()` and `getTeacherBySlug()`.
- Keep null-safe values for legacy records.

**Patterns to follow:**
- Existing typed Strapi helper structure.

**Test scenarios:**
- Happy path: detail query includes all three new fields.
- Edge case: list query still works if `expertiseAreas` is null.
- Integration: profile photo and courses population remain unchanged.

**Verification:**
- Teacher profile pages can render the new fields without breaking existing teacher records.

- [ ] **Unit 3: Detail hierarchy update**

**Goal:** Reorder teacher detail pages around buyer decision support.

**Requirements:** R1, R3, R4, R5

**Dependencies:** Unit 2

**Files:**
- Modify: `frontend/src/app/egitmenler/[slug]/page.tsx`
- Test: `frontend/src/__tests__/teacher-detail-narrative-source.test.mjs`

**Approach:**
- Render expertise tags/line first, then target teams, then teaching approach, then related courses, then bio.
- Use `headline` fallback when expertise is absent.
- Preserve email and profile photo behavior.

**Patterns to follow:**
- `ContentDetailShell` and existing two-column profile layout.
- Current light visual system: panel surfaces, `shadow-sm`, `#009ca6` accents.

**Test scenarios:**
- Happy path: teacher with all fields renders expertise, team fit, approach, courses, then bio.
- Edge case: missing expertise falls back to `headline` without an empty tag row.
- Edge case: missing courses skips related course section but still shows approach and bio.
- Integration: course links still target `/egitimler/[slug]`.

**Verification:**
- The first decision-support content above the bio answers expertise, fit, and teaching approach.

## System-Wide Impact

- **Interaction graph:** teacher schema, demo seed, Strapi teacher queries, teacher detail page, future teacher listing page.
- **Error propagation:** missing fields should degrade to headline/bio, not runtime errors.
- **State lifecycle risks:** optional schema fields avoid breaking existing published teacher records.
- **API surface parity:** `getTeachers()` and `getTeacherBySlug()` should share the same field names.
- **Integration coverage:** demo seed should make the hierarchy visible locally.
- **Unchanged invariants:** `/hakkimizda` carousel remains a lightweight trust preview.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Duplicates the teacher-listing plan | Share the same field names and treat this plan as the narrative/detail implementation slice. |
| Cards become too dense | Keep card-level display selective and fallback-aware. |
| JSON expertise values become inconsistent | Seed examples and admin descriptions should define the expected string-array shape. |

## Sources & References

- Origin document: `docs/brainstorms/2026-04-22-egitmen-anlatisi-requirements.md`
- Related origin: `docs/brainstorms/2026-04-22-egitmenler-listing-and-schema-extension-requirements.md`
- Related code: `frontend/src/app/egitmenler/[slug]/page.tsx`
- Related code: `backend/src/api/teacher/content-types/teacher/schema.json`
