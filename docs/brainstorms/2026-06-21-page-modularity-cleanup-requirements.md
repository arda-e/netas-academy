---
date: 2026-06-21
topic: page-modularity-cleanup
---

# Page Modularity Cleanup

## Summary

Clean up the reviewed page and UI modularity findings without changing the academy site's product behavior. The work should preserve the existing Turkish IA, route structure, registration semantics, and content hierarchy while reducing duplicated route-local UI, stale component surface, and misleading component APIs.

---

## Problem Frame

The content listing routes are already mostly thin wrappers over shared components, but the detail and registration routes have started to accumulate their own presentation logic. Event detail and event registration each define overlapping event information panels, and course detail owns a full related-session section inside the route file.

The broader UI review also found stale abstractions and small duplicated widgets near the page findings. Leaving those in place would make future page work harder to reason about: downstream agents may reuse obsolete exports, duplicate carousel behavior, or assume a prop does something it no longer does.

Existing product requirements already define the desired user behavior for events and courses. This cleanup should therefore improve boundaries and maintainability rather than redesigning the experience.

---

## Key Decisions

- **Review-driven cleanup wave.** Address the page findings together with the directly related UI component cleanup, because the nearby stale exports and duplicate widgets are part of the same drift pattern.
- **No product redesign.** Preserve current event registration behavior, course/session hierarchy, Turkish route slugs, and existing page rhythm unless a hard-coded string violates the app's i18n rule.
- **Extract only durable boundaries.** Create shared components only where two or more active surfaces need the same responsibility, or where a route file currently hides reusable presentation logic.
- **Remove or revive stale abstractions.** Do not keep unused detail or hero exports as speculative future hooks.

---

## Requirements

**Event detail and registration boundaries**

- R1. Event detail and event registration pages must share a single event information presentation responsibility instead of maintaining separate route-local panels.
- R2. The shared event information surface must support page-specific actions, so registration CTA behavior and registration-form back navigation remain independent where needed.
- R3. Event detail and event registration must continue to show consistent logistics data for title, date, optional end date, location, format, price, and registration state where those fields exist.
- R4. Event registration page copy must use the established i18n pattern rather than hard-coded user-facing strings.

**Course detail sessions boundary**

- R5. Course detail must move related-session presentation out of the route body into a focused reusable section.
- R6. The related-session section must preserve the current split between upcoming and past sessions.
- R7. The related-session section must preserve the current no-upcoming-session fallback path to the lead/contact intent flow.
- R8. Course detail must remain responsible for route loading, metadata, not-found behavior, and data fetch orchestration.

**Component surface cleanup**

- R9. Unused detail abstractions exported from the shared content barrel must either become active route dependencies or be removed from the public component surface.
- R10. The unused hero overlay abstraction must either become an active canonical hero dependency or be removed.
- R11. Carousel components must stop duplicating horizontal-scroll behavior when a small shared primitive can carry the scroll container and controls without changing card rendering.
- R12. Component props must not advertise behavior that is intentionally ignored.

**Preserved behavior**

- R13. The cleanup must not add new Strapi fields, change event registration business rules, or alter existing public route URLs.
- R14. Existing list-page composition patterns should remain intact because current blog, teacher, and news listing routes are already well-structured.
- R15. Visual changes should be incidental to boundary cleanup and should not recast the site as a new design system pass.

---

## Acceptance Examples

- AE1. **Covers R1, R2.** Given an open event, when a user views event detail, the side information panel still exposes registration as the primary action.
- AE2. **Covers R1, R2.** Given the same event registration page, when a user views the registration form, the information panel still offers the back-to-detail action rather than the event-detail CTA stack.
- AE3. **Covers R4.** Given the locale is `en`, when a user views the event registration page, page-owned labels and fallback messages come from translation messages instead of Turkish literals embedded in JSX.
- AE4. **Covers R5, R6, R7.** Given a course with future and past related events, when a user views the course detail page, upcoming sessions appear first and past sessions remain collapsed or secondary.
- AE5. **Covers R7.** Given a course has no upcoming sessions, when a user views the course detail page, the existing lead/contact fallback remains available.
- AE6. **Covers R9, R10.** Given a future agent imports from the shared content barrel, when it scans exports, obsolete detail wrappers and unused hero abstractions are not presented as current patterns.
- AE7. **Covers R11, R12.** Given a developer changes carousel scroll behavior or a search prop, when they inspect the component API, there is one obvious behavior owner and no intentionally ignored prop.

---

## Success Criteria

- Route files for event detail, event registration, and course detail are smaller and mainly compose data, metadata, and page-specific slots.
- Event information rendering has one active owner while preserving the distinct actions for detail and registration pages.
- Course related-session rendering has one active owner and remains testable without reading the whole route file.
- Shared component exports describe the current component surface accurately.
- `npm run lint` and `npm run build:frontend` are the expected validation commands for this frontend-only cleanup.

---

## Scope Boundaries

- No new content types, Strapi schema fields, or backend registration-service changes.
- No payment, calendar, campaign, QR, or analytics expansion.
- No rewrite of the homepage, content card system, or global page shell.
- No broad copywriting pass beyond moving existing route-owned strings into the translation layer.
- No replacement of the Turkish information architecture or ASCII route slugs.

---

## Dependencies / Assumptions

- Existing event/course product intent from prior requirements remains valid: events are registration-focused and courses are capability-catalog surfaces.
- Existing shared components such as `ContentPageShell`, `ContentCardShell`, `EventList`, and `RegistrationStatusButton` remain acceptable composition anchors.
- The cleanup can rely on the current Strapi fetch contracts and should not require backend changes.
- Planning should check the relevant Next.js 16 documentation before changing route, layout, loading, or metadata behavior.

---

## Sources / Research

- `AGENTS.md`
- `CLAUDE.md`
- `frontend/AGENTS.md`
- `docs/brainstorms/2026-04-22-etkinlikler-requirements.md`
- `docs/plans/2026-04-27-006-refactor-events-registration-focused-experience-plan.md`
- `docs/plans/2026-04-27-010-refactor-course-capability-catalog-plan.md`
- `frontend/src/app/[locale]/etkinlikler/[slug]/page.tsx`
- `frontend/src/app/[locale]/etkinlikler/[slug]/kayit/page.tsx`
- `frontend/src/app/[locale]/egitimler/[slug]/page.tsx`
- `frontend/src/components/content/index.ts`
- `frontend/src/components/hero-overlay.tsx`
- `frontend/src/components/course-carousel.tsx`
- `frontend/src/components/teacher-carousel.tsx`
- `frontend/src/components/content/search-field.tsx`
