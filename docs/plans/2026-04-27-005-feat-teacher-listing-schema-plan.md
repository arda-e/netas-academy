---
title: "feat: Add teacher listing and schema extension"
type: feat
status: active
date: 2026-04-27
origin: docs/brainstorms/2026-04-22-egitmenler-listing-and-schema-extension-requirements.md
---

# feat: Add teacher listing and schema extension

## Overview

Add a real `/egitmenler` page and extend teacher data so the header navigation lands on a populated decision-support listing instead of a 404.

## Problem Frame

The app has teacher detail routes and a header/footer IA expectation, but no `/egitmenler` listing page. The origin document converts the teacher narrative requirements into concrete schema fields and a server-rendered listing spec (see origin: `docs/brainstorms/2026-04-22-egitmenler-listing-and-schema-extension-requirements.md`).

## Requirements Trace

- R1. Add optional `expertiseAreas`, `targetTeams`, and `teachingApproach` fields.
- R2. Render `/egitmenler` server-side with all published teachers.
- R3. Teacher cards show expertise, target teams, teaching approach preview, name, and profile photo.
- R4. Cards link to `/egitmenler/[slug]` and fall back to `headline` if expertise is empty.
- R5. Update detail page hierarchy and seed demo data.

## Scope Boundaries

- No rating/review system, listing search/filtering, blog-author coupling, or changes to `TeacherCarousel` on `/hakkimizda`.

## Context & Research

### Relevant Code and Patterns

- `frontend/src/app/egitmenler/[slug]/page.tsx` exists; `frontend/src/app/egitmenler/page.tsx` does not.
- `frontend/src/components/content/*` provides reusable list and card shells.
- `frontend/src/lib/strapi.ts` already has `getTeachers()`, `getTeacherBySlug()`, and media helpers.
- Public read for `teacher` already exists in `backend/src/index.ts`.

### Institutional Learnings

- Hakkimizda and teacher profile work should use shared content shells and backlinks from courses to teachers.
- Do not expand the carousel unless explicitly required.

## Key Technical Decisions

- Keep the listing server-rendered with `getTeachers()`; no client fetch or filter state is needed.
- Build a teacher-specific card component that composes shared shell patterns rather than forcing all card content into generic `ContentCardShell` props.
- Reuse the schema fields from the teacher narrative plan to avoid competing teacher contracts.
- Use null-safe media handling via `getStrapiMediaUrl()` and `getStrapiMediaAltText()`.

## Open Questions

### Resolved During Planning

- Expertise tag truncation: show up to three tags on desktop and a compact first-two pattern on narrow cards; preserve full data on detail page.
- Visual treatment: use the existing panel/card surface language, not a distinct profile-card redesign.

### Deferred to Implementation

- Exact Turkish page description can be tuned while matching the site’s existing copy voice.

## Implementation Units

- [ ] **Unit 1: Schema and seed alignment**

**Goal:** Add and populate the teacher listing fields.

**Requirements:** R1, R5

**Dependencies:** None

**Files:**
- Modify: `backend/src/api/teacher/content-types/teacher/schema.json`
- Modify: `backend/scripts/seed-demo.js`
- Test: `backend/tests/api/teacher/schema.test.ts`

**Approach:**
- Add optional fields: `expertiseAreas` as JSON, `targetTeams` as text, `teachingApproach` as text.
- Populate all demo teachers so the listing is meaningful in local dev.

**Patterns to follow:**
- Existing Strapi content-type schema style.
- Demo seed upsert helpers.

**Test scenarios:**
- Happy path: seeded teachers include all three new fields.
- Edge case: existing teachers without the fields remain valid.
- Integration: seed rerun updates existing teachers by slug.

**Verification:**
- Strapi exposes the new teacher fields for published records.

- [ ] **Unit 2: Frontend teacher contract**

**Goal:** Fetch and type the new teacher fields for list and detail pages.

**Requirements:** R2, R3, R4, R5

**Dependencies:** Unit 1

**Files:**
- Modify: `frontend/src/lib/strapi.ts`
- Test: `frontend/src/__tests__/teacher-listing-contract-source.test.mjs`

**Approach:**
- Extend `StrapiTeacher` type.
- Update `getTeachers()` and `getTeacherBySlug()` queries.
- Remove or avoid debug logging from teacher fetch helpers if it remains present during implementation.

**Patterns to follow:**
- Current Strapi fetch helper and media helper patterns.

**Test scenarios:**
- Happy path: `getTeachers()` requests expertise, target teams, teaching approach, photo, and alt text.
- Edge case: missing profile photo returns null-safe media data.
- Integration: `getTeacherBySlug()` still populates related courses.

**Verification:**
- Teacher list and detail pages receive one consistent teacher shape.

- [ ] **Unit 3: `/egitmenler` listing page**

**Goal:** Add the missing teacher listing route.

**Requirements:** R2, R3, R4

**Dependencies:** Unit 2

**Files:**
- Create: `frontend/src/app/egitmenler/page.tsx`
- Create: `frontend/src/components/teacher-card.tsx`
- Modify: `frontend/src/components/content/responsive-layout.ts`
- Test: `frontend/src/__tests__/teacher-listing-page-source.test.mjs`
- Test: `frontend/src/components/content/responsive-layout.test.ts`

**Approach:**
- Use `ContentPageShell` with title `Eğitmenlerimiz`.
- Render a grid of teacher cards with profile image/initial fallback, expertise tags, target teams, teaching approach preview, and name.
- Link every card to `/egitmenler/[slug]`.
- Show a friendly empty state through `ContentGrid`.

**Patterns to follow:**
- `CourseList` and `EventList` use of `ContentGrid`.
- `TeacherCarousel` image fallback ideas, but not its density.

**Test scenarios:**
- Happy path: page reads teachers and maps them into cards linking to detail routes.
- Edge case: empty teachers array shows the friendly empty state.
- Edge case: no expertise areas falls back to `headline`.
- Integration: card grid uses responsive classes with 1/2/3-column behavior.

**Verification:**
- `/egitmenler` no longer 404s and shows decision-support cards.

- [ ] **Unit 4: Detail hierarchy parity**

**Goal:** Ensure list and detail tell the same teacher story.

**Requirements:** R5

**Dependencies:** Unit 2

**Files:**
- Modify: `frontend/src/app/egitmenler/[slug]/page.tsx`
- Test: `frontend/src/__tests__/teacher-detail-narrative-source.test.mjs`

**Approach:**
- Render expertise, target teams, teaching approach, related courses, then bio.
- Preserve existing profile image, email, and course links.

**Patterns to follow:**
- `ContentDetailShell`.

**Test scenarios:**
- Happy path: detail page renders the new hierarchy above bio.
- Edge case: missing optional fields skip cleanly.
- Integration: related course links remain early and visible before bio when courses exist.

**Verification:**
- Corporate buyers can identify expertise and fit before reading the biography.

## System-Wide Impact

- **Interaction graph:** header nav to `/egitmenler`, listing page, detail page, Strapi teacher schema, seed data.
- **Error propagation:** missing teacher fields degrade to `headline` or omitted sections.
- **State lifecycle risks:** optional fields protect existing records.
- **API surface parity:** list and detail query the same field names.
- **Integration coverage:** frontend source tests should cover the new route and card fallbacks.
- **Unchanged invariants:** `/hakkimizda` carousel remains unchanged.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Two teacher plans conflict | Use the same field names and treat this plan as the listing/route slice. |
| Teacher cards become overloaded | Prioritize expertise and target teams; truncate teaching approach. |
| JSON field shape is inconsistent | Seed examples and frontend guards should accept only string arrays. |

## Sources & References

- Origin document: `docs/brainstorms/2026-04-22-egitmenler-listing-and-schema-extension-requirements.md`
- Related origin: `docs/brainstorms/2026-04-22-egitmen-anlatisi-requirements.md`
- Related code: `frontend/src/lib/strapi.ts`
- Related code: `frontend/src/components/content/content-grid.tsx`
