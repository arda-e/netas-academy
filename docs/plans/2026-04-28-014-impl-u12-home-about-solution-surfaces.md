---
title: "impl: U12 — Home, About, and Solution Surfaces"
type: impl
status: pending
date: 2026-04-28
source_plans:
  - docs/plans/2026-04-27-007-refactor-home-trust-narrative-plan.md
  - docs/plans/2026-04-27-009-feat-solution-partner-entry-plan.md
  - docs/plans/2026-04-27-012-refactor-about-trust-learning-model-plan.md
execution_unit: docs/plans/2026-04-27-parallel-subagent-execution-units.md#U12
---

# impl: U12 — Home, About, and Solution Surfaces

## Overview

Implement the three source plans for U12 as a single coordinated pass:
1. Reframe home page around trust and demand (Plan 007)
2. Add solution partner entry surface / `/cozum-ortagi` (Plan 009)
3. Rework about page trust and learning model (Plan 012)

All Wave 1 dependencies (U01, U03) are already merged on `main`. `buildIntentLeadUrl` and `ContentPageShell` are available for reuse.

## Implementation Order

### 1. Solution Partner Page (Plan 009, Units 1–2)

**Goal:** Add `/cozum-ortagi` as a calm, low-commitment explanatory surface that routes into the intent-based lead flow.

**Create:**
- `frontend/src/app/cozum-ortagi/page.tsx`

**Approach:**
- Use `ContentPageShell` with title `Çözüm Ortağı`
- Main message: `Eğitim ve danışmanlık alanında birlikte yeni değer üretelim`
- First content block: `Hangi alanlarda çözüm ortaklığı yapabiliriz` with 4 collaboration areas:
  - Eğitim programları
  - Danışmanlık hizmetleri
  - Workshop ve fasilitasyon
  - Sektörel / konu bazlı uzmanlık
- Second block: `Başvurunuzu inceleyelim` with descriptive text
- CTA: `Çözüm Ortağı Başvurusu Yap` → `buildIntentLeadUrl("solution_partner_application")`
- Tone: professional, calm, low-commitment. No `Kimler başvurabilir` block, no acceptance promises
- Static content, no CMS model

### 2. Home Page Reframe (Plan 007, Units 1–3)

**Goal:** Replace portal-management hero with team transformation narrative; establish trust layer and result/proof layer.

**Modify:**
- `frontend/src/app/page.tsx`
- `frontend/src/lib/page-visual-sections.ts`

**Approach:**
- **Hero (R1, R4):** Replace portal-management copy. Title: team transformation/adaptation language. Description: corporate training value proposition.
  - Primary CTA: `Kurumsal Eğitim Talep Et` → `buildIntentLeadUrl("corporate_training_request")`
  - Secondary CTA: `Eğitimleri İncele` → `/egitimler`
  - CTA order: primary = corporate request (amber button), secondary = education discovery (outline)
- **Trust layer (R2):** Section after hero explaining Netaş Academy trust basis (Netaş brand, sector experience, institution-shaped approach). Rewrite `homeVisualSection` in `page-visual-sections.ts`.
- **Result layer (R3):** Outcome-oriented proof blocks: applicable methods, practical skills, team adaptation. No fabricated metrics, logos, or customer cases.
- **Narrative order:** hero → trust → result (maintaining existing `HeroOverlay` + `VisualStorySection` components)

### 3. About Page Rework (Plan 012, Units 1–3)

**Goal:** Refocus `/hakkimizda` around corporate trust, applied learning model, institution-specific program shaping, field-experienced instructors, and participant outcomes.

**Modify:**
- `frontend/src/app/hakkimizda/page.tsx`

**Approach:**
- **Hero:** Replace "ilham verici yolculuğuna başladı" with applied training promise. Netaş Academy positioned as powered by Netaş technology/sector experience, shaped around institution needs.
- **Narrative flow:** hero → Netaş trust → applied learning model (cases, scenarios, real work problems) → institution-shaped programs (adaptable to sector, team profile, skill level) → instructors (field experience) → participant outcomes → CTAs
- **Sections rewrite:** Replace current `sections` array with new content following the narrative flow. Keep existing `aside` (Yaklaşımımız sidebar) or replace with updated trust content.
- **Instructors (R5):** Keep `TeacherCarousel`; reframe heading/body around field experience and applied guidance.
- **CTAs (R6):**
  - Primary: `Kurumsal Eğitim Talebi` → `buildIntentLeadUrl("corporate_training_request")`
  - Secondary: `Eğitimleri İncele` → `/egitimler`
  - Keep existing instructor/solution partner CTAs but reposition them (do not dominate corporate training primary)
- **Tone:** balanced — trustworthy, practical, understandable, close to business outcomes. Avoid fabricated proof.

### 4. Measurement Hooks (Plan 007-U4, Plan 012-U4)

**Goal:** Add surface-level analytics events for home and about page CTAs.

**Modify:**
- `frontend/src/lib/analytics-events.ts`

**Approach:**
- Add event types: `home_corporate_cta_clicked`, `home_education_cta_clicked`, `about_corporate_cta_clicked`, `about_education_cta_clicked`
- Follow existing domain-first naming pattern
- No PII in event properties
- No backend transport wiring yet (deferred to U13)

### 5. Source Tests

**Create:**
- `frontend/src/__tests__/home-narrative-source.test.mjs` — hero CTA labels, CTA href targets, trust→result order, no English placeholder
- `frontend/src/__tests__/solution-partner-page-source.test.mjs` — main message present, 4 collaboration areas, CTA targets `intent=solution_partner_application`, no high-promise language
- `frontend/src/__tests__/about-narrative-source.test.mjs` — narrative order, no fabricated proof/customer claims
- `frontend/src/__tests__/about-cta-source.test.mjs` — primary CTA → corporate intent, secondary CTA → `/egitimler`

### 6. Navigation (Decision Required)

**Plan 009 defers the navigation decision to implementation.** Options:

- **Option A:** Add `Çözüm Ortağı` to `site-header.tsx` navigation items (between `Haberler` and `İletişim`)
- **Option B:** Defer until page is reviewed live; keep discoverable via footer or `/iletisim` only

## Files Summary

### Create

| File | Purpose |
|------|---------|
| `frontend/src/app/cozum-ortagi/page.tsx` | Static solution partner entry surface |
| `frontend/src/__tests__/home-narrative-source.test.mjs` | Home page narrative order and CTA assertions |
| `frontend/src/__tests__/solution-partner-page-source.test.mjs` | Solution partner page content assertions |
| `frontend/src/__tests__/about-narrative-source.test.mjs` | About page narrative order assertions |
| `frontend/src/__tests__/about-cta-source.test.mjs` | About page CTA routing assertions |

### Modify

| File | Purpose |
|------|---------|
| `frontend/src/app/page.tsx` | Hero copy, CTA order, trust/result layers |
| `frontend/src/app/hakkimizda/page.tsx` | Narrative flow, sections, CTAs, instructor reframe |
| `frontend/src/lib/page-visual-sections.ts` | Replace `homeVisualSection` with trust/identity content |
| `frontend/src/lib/analytics-events.ts` | Add surface-level CTA event helpers |
| `frontend/src/components/site-header.tsx` | Add Çözüm Ortağı nav item (decision dependent) |

## What's NOT Changing

- `HeroOverlay` component — reused as-is (plans confirm it supports needed CTA/copy hierarchy)
- `ContentPageShell` component — reused for cozum-ortagi page
- `TeacherCarousel` — kept; only section framing text updated
- `buildIntentLeadUrl` / `lead-intents.ts` — used as-is
- Backend — no schema, service, or route changes needed for these static pages
- Route names, Turkish IA — preserved

## Validation

```bash
cd frontend && npm run lint && npm run build
```

## Known Risks

| Risk | Mitigation |
|------|------------|
| Measurement events added but no backend transport | Events are no-op console log in dev; U13 wires actual transport later |
| About page instructor/solution partner CTAs conflict with new corporate training primary | Reposition existing CTAs lower on page; keep them visible but not dominant |
| Visual sections use generic Unsplash imagery | Acceptable for first phase; no product photography exists |
| Home page CSS may need adjustment for new content volume | Test with `npm run dev` after implementation |

## Completion Criteria

- `/cozum-ortagi` renders with all required content and CTA
- Home page renders hero → trust layer → result layer in correct order
- Primary home CTA is `Kurumsal Eğitim Talep Et` targeting corporate intent URL
- About page follows heros → trust → model → programs → instructors → outcomes → CTAs flow
- Primary about CTA is `Kurumsal Eğitim Talebi` targeting corporate intent URL
- No English placeholder copy, no fabricated customer evidence
- `npm run lint && npm run build` passes
- Source tests pass
