---
title: "feat: Homepage Unified Redesign with Uncode Component Adaptation"
type: feat
status: completed
date: 2026-05-11
origin: docs/brainstorms/2026-05-11-ana-sayfa-birlesik-yeniden-tasarim-requirements.md
supersedes:
  - docs/plans/2026-04-27-007-refactor-home-trust-narrative-plan.md
  - docs/plans/2026-04-28-014-impl-u12-home-about-solution-surfaces.md (homepage portions only)
---

# feat: Homepage Unified Redesign with Uncode Component Adaptation

## Summary

A new `frontend/src/components/home/` directory introduces six section components adapted from the uncode library with real Netas Academy Turkish content and design-system color tokens. `frontend/src/app/page.tsx` is rewired to use these components in the required narrative order, `VisualStorySection` is removed, and three source tests are updated to reflect the new structure. Existing `frontend/src/components/uncode/` files are not touched.

---

## Problem Frame

The homepage serves as the single surface where a corporate visitor forms their complete impression of Netaş Academy — it already carries the merged about-us narrative via the `/#hakkimizda` anchor. But the current layout is too dense (competing card grids), body text is too small, section headings are disproportionately large, and the copy reads as placeholder. The uncode component library already contains the right visual patterns (full-width layouts, generous spacing, clear typographic hierarchy). The work is to adapt those components with real content and remapped colors. (See origin: `docs/brainstorms/2026-05-11-ana-sayfa-birlesik-yeniden-tasarim-requirements.md`)

---

## Requirements

- R1. Hero opens with "ne çözüyoruz" frame — team transformation and adaptation problem
- R2. Hero language targets business unit and technical team managers; does not exclude broader corporate decision-makers
- R3. Hero tone is problem-solution focused, not generic brochure language
- R4. Hero primary CTA is "Kurumsal Eğitim Talep Et"; secondary CTA is "Eğitimleri İncele"
- R5. A section after the hero briefly positions Netaş Academy as powered by Netaş technology and sector experience — concise, not a history narrative
- R6. Trust section communicates that programs are shaped around institution needs
- R7. A section makes the training method concrete: cases, scenarios, interactive work, real business problems
- R8. A section explains programs adapt to the institution's sector, team profile, skill level, and development goals
- R9. Instructors positioned as field-experienced guides, not academic presenters
- R10. Instructor section tied to the trust and learning model narrative
- R11. Existing instructor carousel retained as the data mechanism
- R12. A section explicitly names participant outcomes: applying theory to work, new perspectives, practical skills, applicable in-company methods
- R13. Outcomes section uses no fabricated metrics, invented data, or placeholder numbers
- R14. Featured courses section surfaces training programs as a secondary conversion path
- R15. Existing course carousel retained as the data mechanism
- R16. Primary conversion path is corporate training request; catalog exploration is secondary; no events/blog/news content
- R17. Final CTA section carries "let's build the right training journey together" tone — no sales pressure
- R18. "Kurumsal Eğitim Talep Et" appears in both the hero and the final CTA section
- R19. All content is in Turkish; no English placeholder text anywhere
- R20. Page built by adapting the uncode component library directly; investment-firm palette remapped to design system tokens
- R21. Typography creates visible breathing room: body text is legible at `.page-body-text` sizing; headings are proportionate
- R22. `VisualStorySection` removed and replaced by uncode sections
- R23. `/hakkimizda` route continues to redirect to homepage; no separate about page needed

---

## Scope Boundaries

- Existing `frontend/src/components/uncode/` files — not modified; the `/uncode` reference page must render unchanged
- `frontend/src/lib/page-visual-sections.ts` — `homeVisualSection` becomes unused but the file is not changed; other pages still consume their respective sections
- Analytics event wiring — deferred to U13 per existing plan architecture
- `AccordionSection` / FAQ pattern — not used on the homepage
- `/hakkimizda` page — stays as a redirect
- Backend, CMS schema, or route changes — none needed

### Deferred to Follow-Up Work

- Replacing the static hero background with a Netas brand video when a suitable asset becomes available
- Marking plans 007 and 014 as superseded in their own frontmatter (can be done as a no-code housekeeping commit)
- Removing `homeVisualSection` from `page-visual-sections.ts` once confirmed unused (no other page references it)

---

## Context & Research

### Relevant Code and Patterns

- `frontend/src/components/uncode/HeroSection.tsx` — sliding-copy hero with static/video background and dot-nav; `'use client'`, uses `useState`/`useEffect`
- `frontend/src/components/uncode/IntroSection.tsx` — white section, large `font-normal` heading, 3-column grid with border-left separators; internal padding `px-4 sm:px-6 lg:px-10 xl:px-12` must be matched
- `frontend/src/components/uncode/ServicesSection.tsx` — full-screen 3-column layout (white left col with list, dark center col, light right col); dollar amounts and progress bars must be removed for this domain
- `frontend/src/components/uncode/ESGSection.tsx` — 2-column: text-heavy left, visual/placeholder right; `min-h-[500px]` right panel
- `frontend/src/components/uncode/MetricsSection.tsx` — split row: light panel with large display type left, dark panel with stats+description right; lower quote/testimonial strip
- `frontend/src/components/uncode/ParallaxCTASection.tsx` — gradient banner (`from-[#1b1d1f] via-[#2c4437] to-[#1b1d1f]`) + AccordionSection; only the banner is used
- `frontend/src/components/uncode/NewsSection.tsx` — article list with date + title, arrow nav, border-top separator rows
- `frontend/src/components/teacher-carousel.tsx` — `'use client'`, accepts `items: TeacherCarouselItem[]` and `cardTestIdPrefix: string` (only serializable props — no function props)
- `frontend/src/components/course-carousel.tsx` — `'use client'`, accepts `items: CourseCarouselItem[]` and `cardTestIdPrefix: string`
- `frontend/src/app/page.tsx` — existing `InstructorCarouselSection` and `LatestCoursesSection` are async server functions that fetch from Strapi and pass data to the carousels
- `frontend/src/lib/lead-intents.ts` — `buildIntentLeadUrl("corporate_training_request")` is the CTA target throughout
- `frontend/src/app/globals.css` — design system: `.page-container` (max-w-7xl, responsive px), `.page-section` (py-10/12/16), `.page-body-text`, `.page-eyebrow`; color tokens are OKLCH-based (`--primary`, `--foreground`, `--background`)
- `frontend/src/__tests__/home-hero-source.test.mjs` — currently asserts "Eğitim Kataloğunu İncele" as secondary CTA; must be updated to "Eğitimleri İncele"
- `frontend/src/__tests__/home-narrative-order-source.test.mjs` — currently asserts `VisualStorySection` presence; must be updated for new structure
- `frontend/src/__tests__/home-measurement-source.test.mjs` — asserts analytics `data-measurement-id` attributes; review against new CTAs

### Institutional Learnings

- **Uncode padding mismatch (confirmed):** `IntroSection` and other uncode components use hardcoded padding that misaligns with `.page-container` at `lg`+ breakpoints — remap all adopted components to `.page-container` values on adoption, not after visual testing catches it
- **Server/Client boundary crash (BUG-005):** Passing function props from a Server Component to `TeacherCarousel` / `CourseCarousel` causes a runtime 500. Only serializable props (strings) may cross the boundary. The `cardTestIdPrefix` string pattern is the established fix
- **Richtext fields:** Not relevant for this work — all new section content is static Turkish copy hardcoded in components. The carousel data (instructor names, course titles) are plain strings already
- **BUG-007 (oversized heading):** Resolved as a side effect — switching from `HeroOverlay` to the new `HomeHeroSection` based on uncode typography replaces the oversized heading source

### External References

- None needed — local patterns are sufficient and well-established

---

## Key Technical Decisions

- **New `frontend/src/components/home/` directory, not modifying `uncode/`:** The `/uncode` route renders the original components as a visual reference; modifying them in place would corrupt that reference. New home-specific components copy the visual pattern with adapted content and design-system tokens.
- **Static dark background for hero (no video):** No Netas brand video asset is established. `HomeHeroSection` uses `bg-slate-950` with a `--primary`-tinted gradient overlay — visually equivalent to the uncode HeroSection's dark feel without an external video dependency. Sliding-copy rotation (`useState`/`useEffect`) is retained.
- **Design system tokens over hardcoded hex:** Tailwind v4 uses OKLCH CSS variables, not static hex in config. Uncode's `#2c4437` accent maps to `text-primary` / `bg-primary`; `#1b1d1f` maps to `bg-slate-950`; `#303133` maps to `text-foreground`; `#5b616b` maps to `text-foreground/60`. No new hex values are introduced.
- **ServicesSection pattern → learning model; ESGSection pattern → program customization:** The 3-column ServicesSection layout naturally holds three learning method pillars (case-based, scenario-driven, interactive work). The 2-column ESGSection layout fits the customization narrative (explanatory text left, supporting visual right). The reverse mapping would crowd program customization into 3 columns with no natural third pillar.
- **MetricsSection split layout retained without numeric values:** The dark-panel / light-panel split creates strong visual contrast that suits the outcomes section. The "large display type" left slot becomes a short categorical outcome header (e.g., "Teoriden Pratiğe") rather than a number. The four outcome statements (R12) are distributed across left and right content areas.
- **"Eğitimleri İncele" wins over "Eğitim Kataloğunu İncele":** The requirements doc (R4) is the authoritative source; the existing test assertion is a stale artifact from an earlier iteration. The test is updated.
- **Instructor and course section wrappers stay inline in `page.tsx`:** Both sections are async server functions that fetch Strapi data and pass it to client carousels. Extracting them into separate files adds indirection with no benefit — the section markup update (headings, eyebrow, body text) is small enough to do directly in `page.tsx`.
- **NewsSection pattern not used for courses:** R15 retains the `CourseCarousel` as the mechanism. Replacing it with a flat `NewsSection`-style list would reduce visual richness (no badges, no card layout) and is not warranted when the carousel already works.

---

## Open Questions

### Resolved During Planning

- **ServicesSection vs ESGSection for learning model:** ServicesSection (3-col) → learning model; ESGSection (2-col) → program customization. See Key Technical Decisions.
- **MetricsSection without numbers:** Split layout retained; large display type slots hold short categorical headers, not numeric values. See Key Technical Decisions.
- **Instructor section layout:** `TeacherCarousel` retained inside updated section markup in `page.tsx`; no new component file needed.

### Deferred to Implementation

- **Exact Turkish copy for each slide in `HomeHeroSection`:** Two or three rotation messages should cover different angles of the team transformation problem (e.g., adaptation speed, skill gap, change readiness). The exact wording is an authoring decision best made during implementation when the full layout is visible.
- **Right-panel visual for `HomeProgramsSection`:** ESGSection's right panel is currently a placeholder (`bg-[#2c4437]/10` with a centered text monogram). An abstract Netas-branded visual or a relevant illustration would strengthen R8, but the placeholder is an acceptable v1 if no asset is ready.
- **Quote/testimonial strip in `HomeOutcomesSection`:** MetricsSection includes a quote block below the split panels. Without a real participant testimonial, this strip should be omitted in v1 rather than populated with fabricated copy.

---

## Output Structure

```
frontend/src/components/home/
├── HomeHeroSection.tsx          # Sliding-copy hero, static dark bg, two CTAs
├── HomeTrustSection.tsx         # Netaş brand trust — large heading + 3-column pillars
├── HomeLearningModelSection.tsx # Learning method — 3-column ServicesSection pattern
├── HomeProgramsSection.tsx      # Program customization — 2-column ESGSection pattern
├── HomeOutcomesSection.tsx      # Participant outcomes — MetricsSection split pattern
└── HomeContactCTASection.tsx    # Gradient CTA banner, no AccordionSection
```

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

**Page assembly order in `page.tsx`:**

```
HomeHeroSection          ← 'use client', sliding copy, static bg-slate-950
HomeTrustSection         ← server-renderable, white bg, page-container
HomeLearningModelSection ← server-renderable, 3-col, bg mix (white/dark/light)
HomeProgramsSection      ← server-renderable, 2-col, bg-white + right panel
[InstructorCarouselSection] ← async server fn (Strapi) → TeacherCarousel ('use client')
HomeOutcomesSection      ← server-renderable, split panel, bg-slate-950 right
[LatestCoursesSection]   ← async server fn (Strapi) → CourseCarousel ('use client')
HomeContactCTASection    ← server-renderable, gradient banner, CTA link
```

**Color token mapping (uncode → design system):**

| Uncode value | Design system equivalent |
|---|---|
| `#2c4437` (green accent) | `text-primary` / `bg-primary` / `border-primary` |
| `#1b1d1f` (near-black bg) | `bg-slate-950` |
| `#303133` (dark text) | `text-foreground` |
| `#5b616b` (secondary text) | `text-foreground/60` |
| `#d6d7d9` (border/divider) | `border-border` or `border-foreground/20` |
| `#f5f5f5` (light bg) | `bg-muted` or `bg-slate-100` |
| `bg-white` | `bg-background` |

**Padding convention for all adapted components:**

All uncode internal container padding remapped to: `px-4 sm:px-6 lg:px-10 xl:px-12` with `mx-auto max-w-7xl` — matching `.page-container`.

---

## Implementation Units

### U1. HomeHeroSection component

**Goal:** Create a homepage hero with sliding Turkish copy, static dark background, and properly targeted CTAs — replacing `HeroOverlay variant="home"` for this page.

**Requirements:** R1, R2, R3, R4, R18, R19, R20, R21

**Dependencies:** None

**Files:**
- Create: `frontend/src/components/home/HomeHeroSection.tsx`

**Approach:**
- `'use client'` directive (sliding copy requires `useState`/`useEffect`)
- Two or three rotation slides: each slide has a short headline (team transformation/adaptation angle) and a supporting sentence; auto-rotates every 5 seconds
- Background: `bg-slate-950` with a `primary`-tinted radial/gradient overlay — no external video src
- Layout: headline left (large `font-normal` weight, not `font-semibold`), supporting text + CTAs right — mirrors uncode HeroSection grid at `lg`
- Primary CTA: "Kurumsal Eğitim Talep Et" → `buildIntentLeadUrl("corporate_training_request")`; pill button, white bg
- Secondary CTA: "Eğitimleri İncele" → `/egitimler`; frosted/outline style
- Dot-nav at bottom-left for manual slide selection
- Padding: page-container compliant; min-height matches or exceeds current HeroOverlay home variant

**Patterns to follow:**
- `frontend/src/components/uncode/HeroSection.tsx` — overall structure, slide array shape, transition logic
- `frontend/src/components/hero-overlay.tsx` — CTA button styles and `buildIntentLeadUrl` usage

**Test scenarios:**
- Happy path: component renders without throwing; headline text is in Turkish
- Happy path: primary CTA label is "Kurumsal Eğitim Talep Et"
- Happy path: secondary CTA label is "Eğitimleri İncele" and href points to `/egitimler`
- Happy path: `buildIntentLeadUrl("corporate_training_request")` used as primary CTA href
- Edge case: no English words appear in any slide's headline or subtitle
- Edge case: no fabricated numbers (`%`, `bin+`, `müşteri`) in any slide content
- Edge case: dot-nav has one button per slide

**Verification:**
- Component renders in isolation with correct CTA labels and hrefs
- No English placeholder text in source file
- Primary href resolves to the corporate training intent URL

---

### U2. HomeTrustSection component

**Goal:** Establish Netaş brand credibility in a clean, spacious layout — powered by Netaş technology and sector experience; programs shaped around institution needs. Not a history narrative.

**Requirements:** R5, R6, R19, R20, R21

**Dependencies:** None

**Files:**
- Create: `frontend/src/components/home/HomeTrustSection.tsx`

**Approach:**
- Server-renderable (no `'use client'`)
- Adapts `IntroSection` pattern: `bg-background` (white), large `font-normal` heading stating the Netaş trust proposition, followed by a 3-column grid
- Three trust pillars (border-left separator between columns, no border on first): e.g., Netaş marka güvencesi, Sektörel deneyim, Kuruma özel şekillenen yaklaşım — each a short paragraph
- Heading: `text-3xl md:text-5xl font-normal` — deliberately lighter weight than current `font-semibold` convention to increase breathing room
- Body text: `.page-body-text` utility class
- Padding: page-container compliant

**Patterns to follow:**
- `frontend/src/components/uncode/IntroSection.tsx` — heading size, column grid, border-left separator pattern

**Test scenarios:**
- Happy path: heading present and does not contain founding year, history, or "yolculuğu" narrative language
- Happy path: three trust pillars rendered
- Edge case: no English placeholder text
- Edge case: no fabricated numbers or percentage claims

**Verification:**
- Section renders with three columns and a readable heading
- Copy communicates trust positioning, not founding story

---

### U3. HomeLearningModelSection component

**Goal:** Make the training method concrete — cases, scenarios, interactive work, real business problems — across a 3-column layout.

**Requirements:** R7, R19, R20, R21

**Dependencies:** None

**Files:**
- Create: `frontend/src/components/home/HomeLearningModelSection.tsx`

**Approach:**
- Server-renderable
- Adapts `ServicesSection` 3-column pattern with the investment-firm content stripped out
- Three columns with distinct background treatments (e.g., `bg-background` / `bg-slate-950` / `bg-muted`), each describing one pillar of the learning method:
  - Col 1 (light): Vaka ve Senaryo Odaklı — learning through real cases and business scenarios
  - Col 2 (dark): Gerçek İş Problemleri — training anchored to actual challenges the participant's team faces
  - Col 3 (light/muted): İnteraktif ve Uygulamalı — hands-on formats, not passive instruction
- Each column: eyebrow label, short heading, 2–3 sentence body in `.page-body-text`
- Remove: dollar amounts, pricing list, progress bars, percentage stats from ServicesSection
- **Remove `min-h-screen` from the outer `<section>` element** — `ServicesSection` uses this for full-viewport-height stacking; a normally-flowing page section must not inherit it (critical: leaving it causes each column to span the full screen height on mobile)
- CTA in col 1 (light): "Eğitimleri İncele" → `/egitimler` using outline button style
- Colors: `bg-slate-950` for dark column; `text-primary` for accent labels

**Patterns to follow:**
- `frontend/src/components/uncode/ServicesSection.tsx` — 3-column flex layout, min-h-screen, column background variation
- `.page-eyebrow` for section labels

**Test scenarios:**
- Happy path: three content columns render
- Happy path: no dollar signs, no percentage values, no pricing language
- Edge case: no English placeholder text in any column
- Edge case: learning method language present (vaka/senaryo or equivalent terminology)

**Verification:**
- Three columns visible with distinct backgrounds
- No investment-firm artifacts (pricing, stats, dollar values)

---

### U4. HomeProgramsSection component

**Goal:** Communicate that programs adapt to the institution's sector, team profile, skill level, and development goals — in a 2-column layout with explanatory text and a supporting visual panel.

**Requirements:** R8, R19, R20, R21

**Dependencies:** None

**Files:**
- Create: `frontend/src/components/home/HomeProgramsSection.tsx`

**Approach:**
- Server-renderable
- Adapts `ESGSection` 2-column pattern
- Left column (`lg:w-1/2`): eyebrow "Kuruma Özel Tasarım", heading about institution-shaped programs, two body paragraphs covering the four customization axes (sector, team profile, skill level, development goals), link "Eğitim Kataloğunu İncele" → `/egitimler`
- Right column (`lg:w-1/2`): `bg-primary/10` with a centered abstract monogram or short decorative text (placeholder in v1); `min-h-[500px]`
- Colors: left `bg-background`, right `bg-primary/10`; accent link uses `text-primary`

**Patterns to follow:**
- `frontend/src/components/uncode/ESGSection.tsx` — 2-column flex layout, right-panel min-height, link underline style

**Test scenarios:**
- Happy path: two columns render (text left, visual right)
- Happy path: four customization axes referenced in copy (sector, team, skill level, development goals — or Turkish equivalents)
- Edge case: no English placeholder text
- Edge case: no fabricated success metrics

**Verification:**
- 2-column layout renders at `lg` breakpoint
- Copy covers program customization rather than generic quality claims

---

### U5. HomeOutcomesSection component

**Goal:** Name participant outcomes explicitly — applying theory to work, new perspectives, practical skills, applicable in-company methods — using the MetricsSection split layout without fabricated numbers.

**Requirements:** R12, R13, R19, R20, R21

**Dependencies:** None

**Files:**
- Create: `frontend/src/components/home/HomeOutcomesSection.tsx`

**Approach:**
- Server-renderable
- Adapts `MetricsSection` split-row pattern
- Top row split: light left panel + dark right panel
  - Left (`bg-muted`, `lg:w-1/2`): two short categorical outcome headers in large `font-light` display type (e.g., "Teoriden Pratiğe", "Yeni Bakış Açısı") — the "large number" slots repurposed as outcome title cards
  - Right (`bg-slate-950`, `lg:w-1/2`): heading "Katılımcı Çıktıları", then four outcome statements in `text-white/70` body text — one for each of R12's four outcomes
- Omit: the testimonial/quote strip — `MetricsSection` wraps its content in **two sibling `<section>` elements** inside an outer `<div>`; the entire second `<section>` (the quote/testimonial strip) must be removed, not just its inner content
- No percentage signs, no `bin+`, no numeric claims anywhere in the component

**Patterns to follow:**
- `frontend/src/components/uncode/MetricsSection.tsx` — split-row flex layout, dark/light panel contrast, large display type slot

**Test scenarios:**
- Happy path: split panel renders (light left, dark right)
- Happy path: four outcome statements present in dark panel
- Edge case: no `%`, no numeric values, no `bin+` or `müşteri` fabricated-metric language
- Edge case: no English placeholder text
- Edge case: no testimonial markup (omit quote strip)

**Verification:**
- Split layout renders without numbers
- All four R12 outcomes represented in copy

---

### U6. HomeContactCTASection component

**Goal:** Gradient CTA banner with "Kurumsal Eğitim Talebi" — "let's build the right training journey" tone — using the ParallaxCTASection gradient without the AccordionSection.

**Requirements:** R16, R17, R18, R19, R20

**Dependencies:** None

**Files:**
- Create: `frontend/src/components/home/HomeContactCTASection.tsx`

**Approach:**
- Server-renderable
- Adapts only the gradient banner part of `ParallaxCTASection` — the `AccordionSection` is not included
- Background: `bg-gradient-to-br from-slate-950 via-primary to-slate-950` (remapping `#1b1d1f`/`#2c4437`)
- Layout: centered text + CTA; `h-[400px]` or equivalent; vertically centered content
- Heading: short phrase — e.g., "İhtiyacınıza uygun eğitim yolculuğunu birlikte kuralım" — communicating partnership rather than sales push (R17)
- CTA: "Kurumsal Eğitim Talep Et" → `buildIntentLeadUrl("corporate_training_request")`; white pill button
- No AccordionSection, no FAQ items

**Patterns to follow:**
- `frontend/src/components/uncode/ParallaxCTASection.tsx` — gradient banner section only
- `frontend/src/lib/lead-intents.ts` — `buildIntentLeadUrl` usage

**Test scenarios:**
- Happy path: CTA label is "Kurumsal Eğitim Talep Et"
- Happy path: CTA href uses `buildIntentLeadUrl("corporate_training_request")`
- Happy path: no AccordionSection or FAQ markup in component
- Edge case: no English placeholder text
- Edge case: no high-pressure sales language ("hemen", "kaçırma", "fırsat")

**Verification:**
- Gradient banner renders with correct CTA label and href
- No accordion present

---

### U7. Assemble page.tsx, update instructor/course section wrappers, and update source tests

**Goal:** Wire all new home components into `page.tsx` in the required narrative order, update the instructor and course section wrapper copy, remove `VisualStorySection`, and bring the three source tests into sync with the new structure.

**Requirements:** R1–R23 (integration of all prior units)

**Dependencies:** U1, U2, U3, U4, U5, U6

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/__tests__/home-hero-source.test.mjs`
- Modify: `frontend/src/__tests__/home-narrative-order-source.test.mjs`
- Modify (review + update): `frontend/src/__tests__/home-measurement-source.test.mjs`

**Approach:**

*page.tsx changes:*
- Remove: `HeroOverlay` import and usage; `VisualStorySection` import and usage; `hakkimizdaVisualSection` import; `homeVisualSection` import
- Remove: the existing `#hakkimizda` grid section (the card grid block that currently lives in `<main>`)
- Add imports for all six `frontend/src/components/home/` components
- Assembly order inside `<main className="page-shell">`:
  1. `<HomeHeroSection />` (outside `<main>`, replaces `<HeroOverlay>`)
  2. `<HomeTrustSection />`
  3. `<HomeLearningModelSection />`
  4. `<HomeProgramsSection />`
  5. `<section>` wrapping `<InstructorCarouselSection>` — update heading to field-experience framing per R9/R10; use `.page-eyebrow` + `font-normal` heading weight; body text in `.page-body-text`
  6. `<HomeOutcomesSection />`
  7. `<section>` wrapping `<LatestCoursesSection>` — update heading/body to course discovery framing per R14; same typography conventions
  8. `<HomeContactCTASection />`
- Keep `InstructorCarouselSection` and `LatestCoursesSection` as async server functions within the file (no extraction to separate files)
- Keep `Suspense` boundaries around both carousel sections
- `data-testid="page.home"` on `<main>` preserved

*Source test updates:*
- `home-hero-source.test.mjs`: change secondary CTA assertion from "Eğitim Kataloğunu İncele" → "Eğitimleri İncele"; verify remaining assertions (primary CTA, `buildIntentLeadUrl`, dönüşüm language) still hold. **Also update the `readFileSync` path from `app/page.tsx` to `components/home/HomeHeroSection.tsx`** — after U1 the hero CTA strings live in `HomeHeroSection.tsx`, not `page.tsx`; without this path update the assertions will read the wrong file and never find the CTA labels
- `home-narrative-order-source.test.mjs`: remove assertion on `VisualStorySection` presence; **also remove the separate `/homeVisualSection/` regex assertion** (this is a distinct test from the VisualStorySection one — both must be removed or the test will fail after the imports are cleared from `page.tsx`); add assertions that at minimum two of the new home component names appear in `page.tsx` source; keep no-fake-metrics and no-English-placeholder assertions
- `home-measurement-source.test.mjs`: review `data-measurement-id` assertions against new CTA markup; update any IDs that changed (e.g., hero CTA measurement IDs on `HomeHeroSection` vs old `HeroOverlay`). **Fix the broken diacritic-stripped regex** — the existing test contains `/Egitimleri Incele|\\/egitimler/i` (ASCII-stripped, will never match the Turkish string "Eğitimleri İncele"); the replacement regex must use the actual Turkish characters, e.g. `/Eğitimleri İncele|\\/egitimler/i`

**Patterns to follow:**
- Existing `InstructorCarouselSection` and `LatestCoursesSection` patterns for async server fetch + Suspense
- `.page-eyebrow`, `font-normal`, `.page-body-text` for section typography

**Test scenarios:**
- Happy path: `page.tsx` imports `HomeHeroSection`, `HomeTrustSection`, `HomeLearningModelSection`, `HomeProgramsSection`, `HomeOutcomesSection`, `HomeContactCTASection`
- Happy path: `VisualStorySection` not imported or referenced anywhere in `page.tsx`
- Happy path: `hakkimizdaVisualSection` and `homeVisualSection` not imported in `page.tsx`
- Happy path: `buildIntentLeadUrl("corporate_training_request")` present at least twice in page source (hero + contact CTA)
- Happy path: "Kurumsal Eğitim Talep Et" present in page source
- Happy path: "Eğitimleri İncele" present in page source
- Happy path: no English words in page source (excluding imports and identifiers)
- Integration: `Suspense` boundary wraps both `InstructorCarouselSection` and `LatestCoursesSection`
- Integration: instructor section heading references field experience, not academic credentials
- Source test: `home-hero-source.test.mjs` passes with "Eğitimleri İncele" assertion
- Source test: `home-narrative-order-source.test.mjs` passes without `VisualStorySection` assertion
- Error path: `npm run lint && npm run build` exits 0

**Verification:**
- All three source test files pass
- `npm run lint && npm run build` passes
- `VisualStorySection` has zero references in `page.tsx`
- Page renders the eight sections in correct narrative order when visited at `/`

---

## System-Wide Impact

- **HeroOverlay:** No longer used in `page.tsx`; still used by other pages (egitimler, etkinlikler, etc.) as `variant="feature"`. Not changed or removed.
- **VisualStorySection:** Removed from `page.tsx`; still exported by `frontend/src/components/content/` and used by other pages. Not deleted.
- **page-visual-sections.ts:** `homeVisualSection` becomes unreferenced after this change; the export remains but is dead code. Cleanup deferred.
- **TeacherCarousel / CourseCarousel:** No change to component internals. Section wrapper copy updated in `page.tsx`. Serializable-props-only constraint maintained.
- **Source tests:** Three test files updated in the same PR as `page.tsx`. Failing to update them in the same commit will break CI.
- **Unchanged invariants:** `/hakkimizda` redirect, `buildIntentLeadUrl` architecture, Strapi data fetching for instructors and courses, all other page routes.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| No Netas brand video for hero | Static `bg-slate-950` gradient background is the planned default; video can be added later as a non-breaking enhancement |
| Uncode padding mismatch causes layout regression at `lg`+ | Remap all uncode internal containers to `.page-container` values at adaptation time; verify at `lg` breakpoint before marking U done |
| Source tests fail if not updated in same PR | U7 explicitly includes all three test file updates; implementer should run tests before opening PR |
| `HomeHeroSection` `'use client'` boundary increases JS bundle | Expected and acceptable; the component is already client-interactive in the uncode original. Sliding copy is a progressive enhancement — static fallback renders correctly without JS |
| Plans 007 (active) and 014 (pending) conflict if run in parallel | This plan supersedes their homepage portions. Do not run plan 007 or the homepage units of plan 014 alongside this plan |
| `homeVisualSection` left as dead export | Low risk; deferred cleanup is noted in Scope Boundaries |

---

## Sources & References

- **Origin document:** [docs/brainstorms/2026-05-11-ana-sayfa-birlesik-yeniden-tasarim-requirements.md](docs/brainstorms/2026-05-11-ana-sayfa-birlesik-yeniden-tasarim-requirements.md)
- Superseded plans: [docs/plans/2026-04-27-007-refactor-home-trust-narrative-plan.md](docs/plans/2026-04-27-007-refactor-home-trust-narrative-plan.md), [docs/plans/2026-04-28-014-impl-u12-home-about-solution-surfaces.md](docs/plans/2026-04-28-014-impl-u12-home-about-solution-surfaces.md)
- Uncode source components: `frontend/src/components/uncode/`
- Design system: `frontend/src/app/globals.css`
- Lead intents: `frontend/src/lib/lead-intents.ts`
- Bug context: BUG-005 (function prop crash), BUG-007 (oversized heading — resolved as side effect)
