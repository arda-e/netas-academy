---
date: 2026-05-11
topic: ana-sayfa-birlesik-yeniden-tasarim
supersedes:
  - docs/brainstorms/2026-04-22-guven-odakli-ana-sayfa-anlatisi-requirements.md
  - docs/brainstorms/2026-04-27-hakkimizda-kurumsal-guven-ve-egitim-modeli-requirements.md
---

# Ana Sayfa Birleşik Yeniden Tasarım

## Summary

A unified homepage that merges the home and about us narratives into a single page, adapted from the uncode component library with real Netas Academy Turkish content and the existing blue/slate color palette — replacing the current busy card-grid with a more breathable, visually coherent layout.

---

## Problem Frame

The homepage (`frontend/src/app/page.tsx`) has two compounding problems. First, the content: the current hakkımızda section still reads as placeholder — the trust, learning model, program customization, instructor, and outcomes narratives are either absent or too generic to be convincing to a corporate buyer. Second, the visual design: the section structure is too dense (multiple competing card grids), body font sizes are too small to read comfortably, and section headings are disproportionately large relative to the surrounding content.

The `/hakkimizda` route already redirects to `/#hakkimizda`, making the homepage the single surface where a corporate visitor forms their entire impression of Netaş Academy. The page needs to carry both the conversion role (hero → corporate training request) and the trust-building role (who we are, how we work, what participants gain) in one coherent scroll.

The uncode component library (`frontend/src/components/uncode/`) contains visually strong section patterns — full-width layouts, generous spacing, clear typographic hierarchy — that solve the density and proportion problems directly. The work is to adapt those components with real content and remapped colors rather than rebuild from scratch.

---

## Requirements

**Hero**

- R1. The hero opens with a "ne çözüyoruz" (what do we solve) frame, centering the problem of team transformation and adaptation in corporate environments — not a "who we are" or "welcome" opening.
- R2. Hero language primarily targets business unit and technical team managers; the broader corporate decision-maker audience is not excluded.
- R3. Hero tone is problem-solution focused; generic corporate brochure language is avoided.
- R4. Hero primary CTA is "Kurumsal Eğitim Talep Et"; secondary CTA is "Eğitimleri İncele".

**Netaş Trust**

- R5. A section after the hero briefly establishes Netaş Academy as powered by Netaş technology and sector experience — concise positioning, not a history or founding narrative.
- R6. The trust section communicates that programs are shaped around institution needs, not off-the-shelf content.

**Learning Model**

- R7. A section makes the training method concrete through cases, scenarios, interactive work, and real business problems — not abstract quality claims or generic learning language.

**Program Customization**

- R8. A section explains that programs adapt to the institution's sector, team profile, skill level, and development goals.

**Instructors**

- R9. Instructors are positioned as field-experienced guides, not academic presenters; the framing emphasizes applied practice over credentials.
- R10. The instructor section is tied to the trust and learning model narrative — not a standalone listing.
- R11. The existing instructor carousel is retained as the mechanism for displaying instructor data.

**Participant Outcomes**

- R12. A section explicitly names what participants gain: applying theory to their own work, new perspectives, practical skills, and applicable in-company methods.
- R13. The outcomes section uses no fabricated metrics, invented data, or placeholder numbers.

**Featured Courses**

- R14. A section surfaces current training programs to support catalog exploration, positioned as a secondary conversion path below the corporate training request.
- R15. The existing course carousel is retained as the mechanism for displaying course data.

**CTA and Conversion**

- R16. The page's primary conversion path is corporate training request; catalog exploration is secondary; events, blog, and news content do not appear on this page.
- R17. The final CTA section carries a "let's build the right training journey together" tone — no sales pressure language.
- R18. "Kurumsal Eğitim Talep Et" appears in both the hero and the final CTA section.

**Visual Design and Content Quality**

- R19. All page content is in Turkish; no English placeholder text anywhere.
- R20. The page is built by adapting the uncode component library directly (`HeroSection`, `IntroSection`, `ServicesSection`, `ESGSection`, `MetricsSection`, `NewsSection`, `ParallaxCTASection`); the investment-firm color palette is remapped to the Netas blue/slate design system.
- R21. Typography creates visible breathing room: body text is legible at a comfortable reading size; section headings are proportionate to surrounding content — not oversized.
- R22. The `VisualStorySection` component is removed and replaced by the uncode sections.
- R23. The `/hakkimizda` route continues to redirect to the homepage; the about us narrative is complete enough that no separate about page is needed.

---

## Success Criteria

- A first-time corporate visitor understands within the first two sections what problem Netaş Academy solves and why Netaş is a credible training partner.
- No section reads as placeholder, generic SaaS copy, or untranslated English.
- "Kurumsal Eğitim Talep Et" is visually prominent in both the hero and the closing CTA.
- The about us narrative (trust → learning model → program customization → instructors → outcomes) is present in full and flows without gaps.
- The page passes a visual density check: no section contains more than one competing focal element.

---

## Scope Boundaries

- Backend, CMS schema, or API changes — none required; all sections use existing data sources or static content.
- Route or IA changes — `/hakkimizda` stays as a redirect; no new routes.
- Footer changes.
- Analytics event wiring — deferred to U13 per prior plan.
- The `/uncode` reference page — unchanged.
- The `AccordionSection` / FAQ pattern inside `ParallaxCTASection` — dropped; FAQ content does not fit the homepage.
- Fabricated customer testimonials, reference logos, or invented case study content.
- New navigation items.

---

## Key Decisions

- **Home and hakkimizda merged into `page.tsx`:** the about us narrative is too closely tied to the homepage's conversion goal to justify a separate page; the redirect already exists.
- **Uncode components adapted directly:** the existing design was structurally too busy; full component adoption (not just pattern borrowing) is needed to achieve the target visual quality.
- **MetricsSection used without fabricated numbers:** large typography is retained but populates with categorical outcome statements rather than invented data.
- **VisualStorySection removed:** replaced by the more focused uncode narrative sections; carrying it forward would re-introduce the density problem.

---

## Dependencies / Assumptions

- `TeacherCarousel` and `CourseCarousel` continue to supply dynamic instructor and course data via existing Strapi queries.
- The uncode components in `frontend/src/components/uncode/` are the adaptation source; they are modified in place (content, color, copy) not rebuilt.
- `buildIntentLeadUrl("corporate_training_request")` is the target for all corporate training CTAs, as established in the existing lead-intents architecture.

---

## Outstanding Questions

### Deferred to Planning

- [Affects R20][Design] Which uncode component is best suited for the learning model section vs the program customization section — `ServicesSection` (3-column) or `ESGSection` (2-column text + visual) — should be evaluated during planning against the content volume for each.
- [Affects R12, R13][Design] Whether `MetricsSection`'s split layout (large display type + descriptive text) works without actual numbers, or whether a different uncode section better suits the outcomes narrative.
- [Affects R11][Technical] Whether the instructor section uses a thin wrapper around the existing `TeacherCarousel` inside an uncode-styled container, or adopts a different layout from the uncode library.
