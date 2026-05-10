---
title: "feat: Replace cozum-ortagi aside list with accordion and fix IntroSection alignment"
type: feat
status: active
date: 2026-05-08
---

# feat: Replace cozum-ortagi aside list with accordion and fix IntroSection alignment

## Summary

Replace the static bulleted list under "Hangi Alanlarda Çözüm Ortaklığı Yapabiliriz" in `/cozum-ortagi` with the accordion UI pattern from `ParallaxCTASection` (`/uncode` showcase). Extract the accordion into a reusable `AccordionSection` component, use it in the page with the existing `collaborationAreas` data, and fix `IntroSection`'s inner container padding so the "Strategic diversification…" paragraph aligns horizontally with the hero title.

---

## Requirements

- R1. The "Hangi Alanlarda Çözüm Ortaklığı Yapabiliriz" section in `/cozum-ortagi` must display collaboration areas as an expand/collapse accordion instead of a flat `<ul>`.
- R2. The accordion layout must match the two-column pattern from `ParallaxCTASection`: heading on the left, accordion items on the right.
- R3. The accordion component must be reusable so `ParallaxCTASection` can continue using it unchanged.
- R4. The left edge of the "Strategic diversification and rigorous…" paragraph in `IntroSection` must align with the left edge of the hero title on the same page.

---

## Scope Boundaries

- No changes to backend, Strapi content types, or API layer.
- No changes to the `collaborationAreas` data or its copy — only its display format changes.
- No changes to `IntroSection`'s hardcoded content or addition of props — only its inner container padding changes.
- The `/uncode` showcase page is not modified beyond `ParallaxCTASection` delegating to the new component.

---

## Context & Research

### Relevant Code and Patterns

- `frontend/src/components/uncode/ParallaxCTASection.tsx` — source of the accordion UI; contains `useState` for open index, a two-column flex layout, and `divide-y` accordion items.
- `frontend/src/app/cozum-ortagi/page.tsx` — target page; contains the `collaborationAreas` array, the aside with the `<ul>`, and the cards grid.
- `frontend/src/components/uncode/IntroSection.tsx` — the intro section; uses `px-8 md:px-16 lg:px-24` which differs from `page-container`'s `px-4 sm:px-6 lg:px-10 xl:px-12`.
- `frontend/src/app/globals.css:106` — `.page-container` definition: `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-12`.

### Institutional Learnings

- None found in `docs/solutions/` directly relevant to this UI change.

---

## Key Technical Decisions

- **Extract accordion from `ParallaxCTASection` into `AccordionSection`**: Keeps `ParallaxCTASection` unchanged in behavior; `cozum-ortagi` can import the same component. Alternative (inlining accordion in the page) would duplicate the `useState` logic.
- **Remove cards grid after adding accordion**: `collaborationAreas` data feeds both the former aside list and the cards. The accordion displays the same `title`+`body` content more richly, making the cards redundant. Removing them avoids duplicate information on the page.
- **Use `page-container` padding values directly in `IntroSection`**: The simplest path — no new prop needed since both the uncode showcase and the product page benefit from consistent edge alignment.

---

## Open Questions

### Deferred to Implementation

- Whether `AccordionSection` should accept a `className` override for the outer wrapper — decide based on whether `ParallaxCTASection`'s surrounding white background section needs wrapping adjustments after extraction.

---

## Implementation Units

### U1. Extract AccordionSection component

**Goal:** Extract the FAQ accordion section (bottom half of `ParallaxCTASection`) into a standalone, props-driven component.

**Requirements:** R2, R3

**Dependencies:** None

**Files:**
- Create: `frontend/src/components/uncode/AccordionSection.tsx`
- Modify: `frontend/src/components/uncode/ParallaxCTASection.tsx`

**Approach:**
- The accordion section is a `<section className="bg-white py-24 px-8 md:px-16">` wrapping a `max-w-7xl mx-auto flex flex-col lg:flex-row gap-16` container with two children: a `lg:w-5/12` heading column and a `lg:w-7/12` accordion column.
- `AccordionSection` accepts `heading: string` and `items: Array<{ q: string; a: string }>`, manages `openIndex` state internally.
- `ParallaxCTASection` imports `AccordionSection` and passes the existing hardcoded `faqs` array and the "Our essential perspectives on investing" heading — no visible behavior change.

**Patterns to follow:**
- `ParallaxCTASection.tsx` for accordion state management (`useState<number | null>`) and markup.

**Test scenarios:**
- Happy path: AccordionSection renders the heading and all items collapsed by default.
- Happy path: clicking an item expands it; clicking the same item collapses it.
- Happy path: clicking a different item expands it and collapses the previously open one.
- Edge case: `items` array with a single entry renders without divide lines above/below.
- Integration: `ParallaxCTASection` rendered via `/uncode` route still shows the original finance-themed accordion content without regression.

**Verification:**
- `AccordionSection` exported and importable from its file path.
- `ParallaxCTASection` compiles and the `/uncode` page renders identically to before.

---

### U2. Replace aside list in cozum-ortagi with AccordionSection

**Goal:** Swap the static `<ul>` aside and the cards grid for `AccordionSection`, using the existing `collaborationAreas` data.

**Requirements:** R1, R2

**Dependencies:** U1

**Files:**
- Modify: `frontend/src/app/cozum-ortagi/page.tsx`

**Approach:**
- Import `AccordionSection` from `@/components/uncode/AccordionSection`.
- Remove the outer two-column grid (the `xl:grid-cols-[…]` div) along with the `aside` and cards grid inside it.
- Replace with a single `<AccordionSection>` rendered at full section width, with:
  - `heading="Hangi Alanlarda Çözüm Ortaklığı Yapabiliriz"`
  - `items={collaborationAreas.map(a => ({ q: a.title, a: a.body }))}`
- The `collaborationAreas` array remains in scope; the `article` cards are removed.
- Preserve the "Başvurunuzu İnceleyelim" section unchanged below.
- The `AccordionSection` outer background is white (`bg-white`). Consider whether it needs to blend with the page's `bg-background` or if a `className` override is needed for the page context.

**Patterns to follow:**
- `frontend/src/app/cozum-ortagi/page.tsx` existing section structure for the `page-section` wrapper pattern.

**Test scenarios:**
- Happy path: `/cozum-ortagi` page renders with the accordion showing four items (Eğitim Programları, Danışmanlık Hizmetleri, Workshop ve Fasilitasyon, Sektörel / Konu Bazlı Uzmanlık).
- Happy path: each item expands to show its `body` text on click.
- Happy path: the "Başvurunuzu İnceleyelim" section and CTA button remain visible below the accordion.
- Edge case: page still renders without errors when `collaborationAreas` is empty (defensive check; current data is static so this is a compile-time guarantee).

**Verification:**
- The aside and cards grid are gone; no stale testid references remain for removed cards (`page.cozum-ortagi.area-card.*`).
- The four collaboration areas are visible in the accordion on the page.

---

### U3. Fix IntroSection horizontal alignment

**Goal:** Align the left edge of the "Strategic diversification…" paragraph with the hero title's left edge.

**Requirements:** R4

**Dependencies:** None (can run in parallel with U1/U2)

**Files:**
- Modify: `frontend/src/components/uncode/IntroSection.tsx`

**Approach:**
- The inner container currently uses `px-8 md:px-16 lg:px-24`, which has wider padding at each breakpoint than `page-container` (`px-4 sm:px-6 lg:px-10 xl:px-12`).
- Update the inner `div`'s padding classes to `px-4 sm:px-6 lg:px-10 xl:px-12` to match `page-container` horizontal spacing, while keeping `max-w-7xl mx-auto` and existing vertical padding (`py-24`).

**Patterns to follow:**
- `.page-container` definition in `globals.css:106`.

**Test scenarios:**
- Test expectation: none — pure layout/spacing change with no behavioral logic. Visual verification in browser is the appropriate check.

**Verification:**
- On the `/cozum-ortagi` page at `lg` breakpoint, the left edge of the h2 text in `IntroSection` sits at the same horizontal offset as the "Çözüm Ortaklığı" hero title text.
- The `/uncode` showcase page renders `IntroSection` without visual overflow or misalignment at `sm`, `md`, `lg`, `xl` breakpoints.

---

## System-Wide Impact

- **Interaction graph:** Only `ParallaxCTASection` and `cozum-ortagi/page.tsx` are affected. No callbacks, middleware, or observers involved.
- **Unchanged invariants:** The "Başvurunuzu İnceleyelim" CTA block and its testid (`page.cozum-ortagi.cta.apply`) are untouched. The hero section and breadcrumbs are untouched. The `IntroSection` content remains hardcoded English finance text (fixing content to use passed props is out of scope).
- **State lifecycle risks:** None — accordion state is component-local and ephemeral.
- **API surface parity:** No API surface change.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `AccordionSection`'s `bg-white` background clashes with `cozum-ortagi`'s `bg-background` (which may be off-white or dark in light/dark mode) | Pass a `className` prop override or wrap in a div with the appropriate background |
| Removed testids for `area-card.*` may break existing Playwright specs | Check `frontend/src/__tests__/` and update or remove stale selectors for the cards |
| `IntroSection` padding change affects `/uncode` page; confirm it looks acceptable | Review `/uncode` at all breakpoints after the change |

---

## Sources & References

- Source accordion component: `frontend/src/components/uncode/ParallaxCTASection.tsx`
- Target page: `frontend/src/app/cozum-ortagi/page.tsx`
- `IntroSection`: `frontend/src/components/uncode/IntroSection.tsx`
- `page-container` definition: `frontend/src/app/globals.css:106`
