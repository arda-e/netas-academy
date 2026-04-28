---
date: 2026-04-22
topic: egitmenler-listing-and-schema-extension
---

# Eğitmenler Listing Page + Teacher Schema Extension

## Problem Frame

`/egitmenler` route has a detail page (`[slug]/page.tsx`) but no listing page. The header nav links to `/egitmenler` and users who click it get a 404. Meanwhile `/hakkimizda` shows a `TeacherCarousel` with only name and photo — enough for a carousel card but not enough for a decision-supporting listing surface.

The brainstorm (`docs/brainstorms/2026-04-22-egitmen-anlatisi-requirements.md`) already defines the information hierarchy: expertise area first, team/level fit second, teaching approach third, bio last. This document turns that into concrete schema fields and a listing page spec.

## Requirements

**Schema Extension**

- R1. The `teacher` content type must gain three new fields: `expertiseAreas`, `targetTeams`, and `teachingApproach`.
- R2. `expertiseAreas` must support multiple selections from a closed set of topic areas.
- R3. `targetTeams` must describe which team types and seniority levels the teacher is suited for.
- R4. `teachingApproach` must be a short editorial block describing how the teacher delivers content.
- R5. All three fields must be optional for backward compatibility with existing teacher records.

**Listing Page**

- R6. `/egitmenler` must render a server-side listing page that fetches all published teachers.
- R7. Each teacher card must display, in priority order: expertise areas, target teams/levels, teaching approach (truncated), name, and profile photo.
- R8. Cards must link to the teacher's detail page at `/egitmenler/[slug]`.
- R9. If a teacher has no `expertiseAreas` populated, the card must fall back to showing `headline` in its place.
- R10. The listing must use the existing `ContentGrid` and `ContentCardShell` patterns for visual consistency.
- R11. The page must include a hero section with title "Eğitmenlerimiz" and a short description matching the site's Turkish copy style.
- R12. Empty state must show a friendly message instead of a blank grid.

**Detail Page Updates**

- R13. The existing `/egitmenler/[slug]/page.tsx` must be updated to show the new fields above the bio, following the hierarchy: expertise areas → target teams → teaching approach → related courses → bio.
- R14. The existing bio section must be preserved but moved below the new decision-support content.

**Seed Data**

- R15. The demo seed script must populate all three new fields for each demo teacher so the listing surface is editorially complete in local testing.

## Success Criteria

- Clicking "Eğitmenler" in the header nav leads to a populated listing page, not a 404.
- A corporate buyer viewing a teacher card can identify the teacher's expertise area and suitable team type within 3 seconds.
- Teacher detail pages surface decision-support content (expertise, team fit, teaching approach) before the bio.
- All demo teachers have populated expertise, team, and teaching approach values in local dev.

## Scope Boundaries

- This does not add a teacher rating, review, or endorsement system.
- This does not add filtering or search on the listing page (future enhancement).
- This does not change the teacher-carousel component on `/hakkimizda` (it will continue to show name + photo only).
- This does not add a separate author content type — blog authors will be handled separately.

## Schema Design

### `expertiseAreas`

- Type: Strapi component (repeatable) or JSON string array
- Recommended: `json` type storing `string[]` for simplicity in first phase
- Example values: `["Dagitim Sistemleri", "Veri Yonetimi", "Guvenlik", "DevOps", "Bulut Mimari"]`
- Rationale: Closed set but small enough to manage as free-form JSON in first phase; avoids component overhead

### `targetTeams`

- Type: `text` (multi-line)
- Example: "Yazilim ekipleri, platform muhendisleri, orta-ileri seviye"
- Rationale: Editorial copy that varies per teacher; too nuanced for a closed enum

### `teachingApproach`

- Type: `text` (multi-line)
- Example: "Vaka calismalari ve canli kod ornekleriyle ogretir. Teoriyi pratikle harmanlayan bir yaklasim benimser."
- Rationale: Short editorial block; 2-3 sentences max

## Frontend Data Contract

### `StrapiTeacher` extension

```ts
export type StrapiTeacher = {
  // existing fields...
  expertiseAreas?: string[] | null;
  targetTeams?: string | null;
  teachingApproach?: string | null;
};
```

### `getTeachers()` query update

Must additionally request:
- `expertiseAreas`
- `targetTeams`
- `teachingApproach`

### `getTeacherBySlug()` query update

Must additionally request:
- `expertiseAreas`
- `targetTeams`
- `teachingApproach`

## Listing Page Layout

- Server component at `frontend/src/app/egitmenler/page.tsx`
- Uses `ContentPageShell` with title "Eğitmenlerimiz" and description
- Grid of teacher cards via `ContentGrid`
- Each card uses a new `TeacherCard` component (or extends `ContentCardShell`)
- Card shows: profile photo (avatar), name, expertise areas (badge/tag row), target teams (short line)
- Responsive: 1 column mobile, 2 columns tablet, 3 columns desktop

## Detail Page Update

- Insert new sections between the existing hero and bio:
  1. Expertise areas — tag/badge row
  2. Target teams — short paragraph
  3. Teaching approach — short paragraph
- Existing "Eğitimleri" (courses) section stays in place
- Bio moves to the bottom

## Implementation Sequence

1. Extend `teacher` schema with 3 new fields
2. Update demo seed with values for all teachers
3. Update `StrapiTeacher` type and fetch queries in `strapi.ts`
4. Create `/egitmenler/page.tsx` listing page
5. Create `TeacherCard` component
6. Update `/egitmenler/[slug]/page.tsx` detail page with new fields

## Dependencies / Assumptions

- Strapi public read permissions for `teacher` are already enabled in bootstrap.
- The existing `TeacherCarousel` on `/hakkimizda` does not need the new fields.
- No new Strapi plugins or dependencies are required.

## Key Decisions

- `expertiseAreas` will be `json` (string array) rather than a repeatable component — lower carrying cost, easier to query, sufficient for first phase.
- `targetTeams` and `teachingApproach` will be `text` — editorial flexibility matters more than structure for these fields.
- The listing page will be server-rendered — no client-side fetching needed for a static catalog.
- Cards will fall back to `headline` when `expertiseAreas` is empty — no broken or empty cards for legacy records.

## Outstanding Questions

### Deferred to Planning

- [Affects R2][Technical] Should `expertiseAreas` have a suggested value set in the Strapi admin UI (via hints or validation), or remain fully free-form?
- [Affects R7][Design] On the teacher card, how many expertise area tags should be visible before truncation on mobile?
- [Affects R13][Design] Should the new detail page sections use the same panel-surface styling as existing sections, or a distinct visual treatment?

## Next Steps

-> /ce-plan for structured implementation planning
