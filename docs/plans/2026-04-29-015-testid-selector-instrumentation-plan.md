---
title: "test: Add stable data-testid selectors across frontend"
type: test
status: active
date: 2026-04-29
origin: user request
---

# test: Add stable data-testid selectors across frontend

## Overview

Add a stable `data-testid` selector contract across the Next.js frontend so browser and source tests can target meaningful UI surfaces without depending on Turkish copy, Tailwind classes, DOM depth, or incidental layout structure.

This is a frontend testability pass. Backend model changes are out of scope unless implementation later proves an API response lacks an already-existing durable key needed for a dynamic selector.

## Problem Frame

The project has many user-facing pages, dynamic cards, filters, forms, CTAs, and state messages, but selectors are currently inconsistent. Some fields already have semantic `id` values for labels and accessibility, and some CTAs have `data-measurement-id`, but test automation needs a separate stable selector layer.

The work should start with a cheap read-only explorer pass. That first pass exists to detect candidate UI items and reduce missed coverage before a more capable implementer normalizes and applies the final selector contract.

## Requirements Trace

- R1. Add stable selectors to meaningful user-visible and interactive frontend items.
- R2. Use `data-testid` for test selectors rather than generic `id`.
- R3. Preserve existing semantic `id`, `htmlFor`, `aria-*`, and `data-measurement-id` behavior.
- R4. Use durable dynamic keys such as `slug`, `documentId`, route keys, or intent keys; avoid array indexes.
- R5. Include shell, navigation, listing, card, detail, filter, search, form, CTA, success, error, and empty-state surfaces.
- R6. Run a less-capable read-only explorer first to inventory candidate items before implementation.
- R7. Add focused tests or source checks for critical selector coverage.

## Scope Boundaries

- No route renames, IA changes, Turkish copy rewrites, or visual redesign.
- No generated or dependency directories.
- No backend schema work unless a missing durable key is discovered during implementation.
- No replacement of accessibility hooks with test hooks.
- No requirement to add selectors to purely decorative wrappers or non-interactive icons.

## Key Decisions

- Use `data-testid` as the selector attribute.
- Keep native `id` for accessibility and browser semantics only.
- Prefer a small helper in `frontend/src/lib/testids.ts` for dynamic selector composition and normalization.
- Main implementer must review explorer findings and discard noisy low-value suggestions.
- Dynamic list selectors should use stable domain values:
  - courses, events, blog posts, teachers: `slug` when route-facing
  - Strapi entities without route identity: `documentId`
  - lead tabs and filters: existing enum or filter key

## Selector Naming Convention

Use a predictable dotted shape:

```txt
surface.region.element
surface.region.element.{stable-key}
```

Examples:

```txt
site-header.logo-link
site-header.desktop-nav.egitimler
site-header.mobile-menu.toggle
egitimler.search.input
egitimler.topic-filter.data-analytics
course-card.react-temelleri
event-registration.field.email
event-registration.submit
contact-lead.tab.corporate_training_request
contact-lead.success
```

## Implementation Units

- [ ] **Unit 0: Explorer inventory pass**

**Goal:** Have a less-capable read-only explorer agent detect candidate UI items before implementation.

**Requirements:** R1, R5, R6

**Dependencies:** None

**Files:**
- Read only: `frontend/src`
- Output artifact: `docs/plans/2026-04-29-015-testid-selector-instrumentation-inventory.md`

**Explorer prompt:**

```txt
Scan frontend/src for user-visible or interactive UI items that should receive stable data-testid selectors.

Do not edit files.

Return a structured inventory grouped by file:
- file path
- component/page name
- detected UI item
- current selector/accessibility hook if any
- suggested data-testid
- confidence: high/medium/low
- notes if the item is dynamic and should use slug/documentId/route key/intent key

Focus on:
- links, buttons, forms, inputs, checkboxes, textareas
- nav items, tabs, filters, search controls
- cards/lists/detail sections
- success/error/empty states
- CTAs and registration/contact entry points

Ignore:
- purely decorative wrappers
- icons unless they are the only interactive affordance
- generated/dependency folders
```

**Expected output shape:**

```md
## frontend/src/components/site-header.tsx

- item: logo home link
  component/page: SiteHeader
  current hook: aria-label="Netas Academy ana sayfası"
  suggested data-testid: site-header.logo-link
  confidence: high

- item: mobile menu button
  component/page: SiteHeader
  current hook: aria-controls="site-mobile-navigation"
  suggested data-testid: site-header.mobile-menu.toggle
  confidence: high

- item: desktop nav item
  component/page: SiteHeader
  current hook: item.href, aria-current
  suggested data-testid: site-header.desktop-nav.{route-key}
  confidence: high
  notes: dynamic; derive route key from href, not array index
```

**Review rule:**
The main implementer must normalize names, remove low-value structural selectors, and avoid blindly applying every explorer suggestion.

- [ ] **Unit 1: Selector helper and primitive passthrough**

**Goal:** Add a tiny selector helper and confirm UI primitives pass through `data-testid`.

**Requirements:** R2, R4

**Dependencies:** Unit 0

**Files:**
- Create: `frontend/src/lib/testids.ts`
- Modify if needed: `frontend/src/components/ui/button.tsx`
- Modify if needed: `frontend/src/components/ui/input.tsx`
- Modify if needed: `frontend/src/components/ui/textarea.tsx`
- Modify if needed: `frontend/src/components/ui/card.tsx`
- Modify if needed: `frontend/src/components/ui/badge.tsx`
- Test: `frontend/src/__tests__/testids-source.test.mjs`

**Approach:**
- Add helper functions for joining selector segments and normalizing stable keys.
- Confirm primitives extend standard React HTML props and forward attributes.
- Do not introduce a large abstraction or provider.

**Test scenarios:**
- Dynamic selector helper normalizes spaces and Turkish characters consistently.
- Helper omits empty segments.
- UI primitives source still spreads incoming props onto the rendered element.

- [ ] **Unit 2: App shell selectors**

**Goal:** Instrument global shell surfaces that appear across pages.

**Requirements:** R1, R2, R3, R5

**Dependencies:** Unit 1

**Files:**
- Modify: `frontend/src/app/layout.tsx`
- Modify: `frontend/src/components/site-header.tsx`
- Modify: `frontend/src/components/site-footer.tsx`
- Modify: `frontend/src/components/breadcrumbs.tsx`
- Test: `frontend/src/__tests__/site-shell-testids-source.test.mjs`

**Approach:**
- Add selectors for app root, header, logo link, desktop nav, desktop nav items, mobile menu toggle, mobile nav, mobile nav items, footer nav groups, and breadcrumbs.
- Keep `aria-current`, `aria-label`, and `aria-controls` unchanged.

**Test scenarios:**
- Header logo has `site-header.logo-link`.
- Desktop and mobile nav items derive stable keys from route href.
- Mobile menu retains `aria-controls="site-mobile-navigation"`.
- Footer and breadcrumbs expose stable selectors without changing link targets.

- [ ] **Unit 3: Shared content selectors**

**Goal:** Add reusable selector entry points to shared listing/detail/card components.

**Requirements:** R1, R2, R4, R5

**Dependencies:** Units 0 and 1

**Files:**
- Modify: `frontend/src/components/content/content-page-shell.tsx`
- Modify: `frontend/src/components/content/content-card-shell.tsx`
- Modify: `frontend/src/components/content/content-grid.tsx`
- Modify: `frontend/src/components/content/content-detail-shell.tsx`
- Modify: `frontend/src/components/content/search-field.tsx`
- Modify: `frontend/src/components/content/courses.tsx`
- Modify: `frontend/src/components/content/events.tsx`
- Modify: `frontend/src/components/content/blog.tsx`
- Modify: `frontend/src/components/content/news.tsx`
- Modify: `frontend/src/components/teacher-card.tsx`
- Test: `frontend/src/__tests__/content-testids-source.test.mjs`

**Approach:**
- Add optional test ID props where shared components need route-specific names.
- Pass stable selectors from list components into `ContentCardShell`.
- Avoid page-specific hardcoding inside generic shell components where caller-provided props are clearer.

**Test scenarios:**
- Search field exposes form/input/submit selectors.
- Content card shell accepts caller-provided root/link/title selectors.
- Course, event, blog, news, and teacher cards use slug-based selectors.
- Empty states expose a selector where filtering can produce no results.

- [ ] **Unit 4: Route-level selectors**

**Goal:** Instrument page-specific regions, CTAs, filters, and dynamic lists.

**Requirements:** R1, R2, R4, R5

**Dependencies:** Units 1 and 3

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/app/hakkimizda/page.tsx`
- Modify: `frontend/src/app/egitimler/page.tsx`
- Modify: `frontend/src/app/egitimler/[slug]/page.tsx`
- Modify: `frontend/src/app/etkinlikler/page.tsx`
- Modify: `frontend/src/app/etkinlikler/[slug]/page.tsx`
- Modify: `frontend/src/app/etkinlikler/[slug]/kayit/page.tsx`
- Modify: `frontend/src/app/egitmenler/page.tsx`
- Modify: `frontend/src/app/egitmenler/[slug]/page.tsx`
- Modify: `frontend/src/app/blog-yazilari/page.tsx`
- Modify: `frontend/src/app/blog-yazilari/[slug]/page.tsx`
- Modify: `frontend/src/app/haberler/page.tsx`
- Modify: `frontend/src/app/iletisim/page.tsx`
- Modify: `frontend/src/app/cozum-ortagi/page.tsx`
- Modify: `frontend/src/app/kvkk/page.tsx`
- Test: `frontend/src/__tests__/route-testids-source.test.mjs`

**Approach:**
- Add page root selectors such as `page.egitimler`, `page.iletisim`, and `page.event-detail`.
- Add selectors to page-specific CTA links, filter controls, sort controls, detail sections, related content, and disabled affordances.
- For dynamic pages, derive card/detail selectors from route slug or entity slug.

**Test scenarios:**
- `/egitimler` exposes search, topic filters, disabled PDF affordance, and course list selectors.
- Course detail exposes teacher link, corporate CTA, outcome/detail sections, and related event links.
- `/etkinlikler` exposes type filters, sort toggle, and event cards.
- Detail pages expose primary CTA and back/detail navigation selectors.
- Static pages expose primary CTA sections without changing Turkish copy.

- [ ] **Unit 5: Form selectors and state messages**

**Goal:** Instrument all frontend forms, validation messages, success messages, error messages, and submit controls.

**Requirements:** R1, R2, R3, R5

**Dependencies:** Units 1 and 4

**Files:**
- Modify: `frontend/src/components/event-registration-form.tsx`
- Modify: `frontend/src/components/contact/intent-lead-form.tsx`
- Modify: `frontend/src/components/contact/intent-field-sections.tsx`
- Modify: `frontend/src/components/newsletter-subscription-form.tsx`
- Test: `frontend/src/__tests__/form-testids-source.test.mjs`

**Approach:**
- Keep existing `id` and `htmlFor` pairs intact.
- Add `data-testid` to form roots, field wrappers, inputs, checkboxes, textareas, validation messages, success messages, error messages, submit buttons, and contact intent tabs.
- Use lead intent keys for contact tabs and intent-specific sections.

**Test scenarios:**
- Event registration exposes selectors for first name, last name, email, phone, TCKN, notes, KVKK checkbox, submit, success, and error.
- Contact lead form exposes selectors for each tab, shared fields, intent-specific fields, KVKK checkbox, submit, success, and error.
- Newsletter form exposes email input, submit, success, and error selectors if present in current behavior.
- Existing accessibility IDs remain unchanged.

- [ ] **Unit 6: Validation and cleanup**

**Goal:** Verify selector coverage and prevent obvious regressions.

**Requirements:** R7

**Dependencies:** Units 1 through 5

**Files:**
- Modify or create focused tests under `frontend/src/__tests__/`

**Approach:**
- Keep tests focused on selector presence and stability, not visual layout.
- Prefer source tests where the repo already uses source assertions.
- Do not overfit tests to every wrapper. Test critical user flows and shared component contracts.

**Validation commands:**

```bash
npm run lint
npm run build:frontend
```

**Test scenarios:**
- Selector helper behavior is stable.
- Critical selectors exist for shell, course catalog, event registration, and contact lead form.
- Dynamic list selectors are slug or documentId based.
- No selector test depends on Tailwind classes.

## Files Summary

### Create

| File | Purpose |
|------|---------|
| `docs/plans/2026-04-29-015-testid-selector-instrumentation-inventory.md` | Read-only explorer inventory output |
| `frontend/src/lib/testids.ts` | Selector composition and stable key helper |
| `frontend/src/__tests__/testids-source.test.mjs` | Helper and primitive passthrough assertions |
| `frontend/src/__tests__/site-shell-testids-source.test.mjs` | Header/footer/breadcrumb selector assertions |
| `frontend/src/__tests__/content-testids-source.test.mjs` | Shared content selector assertions |
| `frontend/src/__tests__/route-testids-source.test.mjs` | Route-level selector assertions |
| `frontend/src/__tests__/form-testids-source.test.mjs` | Form selector assertions |

### Modify

| File | Purpose |
|------|---------|
| `frontend/src/app/layout.tsx` | App root selector |
| `frontend/src/components/site-header.tsx` | Header/nav selectors |
| `frontend/src/components/site-footer.tsx` | Footer selectors |
| `frontend/src/components/breadcrumbs.tsx` | Breadcrumb selectors |
| `frontend/src/components/content/*` | Shared page/list/card/search selectors |
| `frontend/src/components/courses/course-catalog-list.tsx` | Filtered list and empty-state selectors |
| `frontend/src/components/event-registration-form.tsx` | Event registration form selectors |
| `frontend/src/components/contact/intent-lead-form.tsx` | Contact lead form selectors |
| `frontend/src/components/contact/intent-field-sections.tsx` | Intent-specific field selectors |
| `frontend/src/components/newsletter-subscription-form.tsx` | Newsletter form selectors |
| `frontend/src/app/**/*.tsx` | Page roots, CTAs, filters, dynamic detail sections |

## Amendments

### 2026-04-30: `join()` cannot cross Server → Client Component boundary (BUG-005)

**Context:** The `join()` helper from `testids.ts` is a pure function. When used inside a Server Component to generate `data-testid` values, it works correctly. However, when an inline arrow function wrapping `join()` is passed as a prop from a Server Component to a Client Component (e.g., `getCardTestId={(slug) => join(...)}`), Next.js 16 App Router rejects it because functions are not serializable across the server/client boundary.

**Decision:** When passing test ID composition logic across the Server → Client boundary, use a **string prefix prop** (e.g., `cardTestIdPrefix`) instead of a function. The Client Component is responsible for concatenating the prefix with its own stable key (e.g., `slug`).

**Pattern:**

```tsx
// ❌ DO NOT pass a function across the boundary:
<ClientComponent getCardTestId={(slug) => join('page', 'about', 'carousel', slug)} />

// ✅ Use a string prefix:
<ClientComponent cardTestIdPrefix="page.about.carousel.card" />

// Inside the Client Component:
data-testid={cardTestIdPrefix ? `${cardTestIdPrefix}.${slug}` : undefined}
```

**Impact:** `data-testid` values in these cross-boundary scenarios follow the format `prefix.{slug}` (2 segments) instead of the full `join()` dotted shape (4+ segments). Source tests that assert on specific `data-testid` values from Client Components must account for this shorter format.

**Affected files:** `teacher-carousel.tsx`, `course-carousel.tsx`

---

## Execution Order

1. Run the explorer inventory pass and save the result.
2. Review the inventory and define the final selector naming map.
3. Add `frontend/src/lib/testids.ts`.
4. Confirm or adjust primitive prop passthrough.
5. Instrument app shell.
6. Instrument shared content components.
7. Instrument route-level pages and dynamic lists.
8. Instrument forms and state messages.
9. Add focused source tests.
10. Run lint and frontend build.

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Too many low-value selectors create maintenance noise | Explorer output is advisory; main implementer filters purely structural suggestions |
| Dynamic selectors become unstable | Use `slug`, `documentId`, route keys, or intent keys only |
| `id` and `data-testid` responsibilities get mixed | Keep `id` for semantics and `data-testid` for tests |
| Shared components become page-specific | Add optional props and let route/list callers provide context-specific selectors |
| Tests overfit implementation details | Test critical selectors and helper contracts, not every wrapper |

## Completion Criteria

- Explorer inventory exists and was reviewed.
- Shell, routes, shared content, dynamic lists, forms, and state messages expose stable `data-testid` selectors.
- Existing accessibility hooks and measurement hooks still exist.
- Dynamic selectors use durable keys, not array indexes.
- Focused selector tests exist for the highest-risk surfaces.
- `npm run lint` passes.
- `npm run build:frontend` passes.
