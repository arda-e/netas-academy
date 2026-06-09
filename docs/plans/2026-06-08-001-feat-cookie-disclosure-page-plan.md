---
title: "feat: Add cookie disclosure page and footer entry"
type: feat
status: active
date: 2026-06-08
---

# feat: Add cookie disclosure page and footer entry

## Summary

This plan adds a dedicated Turkish-first cookie disclosure page for the academy site and exposes it from the main legal footer. The current codebase does not load a third-party analytics/tag manager and does not set browser cookies in the frontend shell; the only browser persistence in active use is `sessionStorage` for form state. The new page should therefore be honest about the current posture: no non-essential cookies are active today, and the page exists to document the current state clearly while leaving room for future consent tooling if tracking is introduced later.

---

## Problem Frame

The site already has a KVKK page at `frontend/src/app/[locale]/kvkk/page.tsx`, but there is no dedicated page explaining cookie usage or the absence of it. Footer users currently only see `KVKK` and the corporate website link in `frontend/src/components/site-footer.tsx`. That leaves a gap for Turkish users who expect a direct cookie disclosure entry, especially once legal review asks for a clearly named page rather than a generic footer note.

The implementation should not pretend there is a cookie-management surface when there is not one. The repo currently uses `sessionStorage` for form persistence in `frontend/src/lib/form-storage.ts` and related hooks, which is not a cookie and should not be described as one. The page should distinguish between browser storage used for form continuity and actual cookies or trackers.

---

## Requirements

- R1. Add a dedicated cookie disclosure route under the locale tree, with a clear legal title and a footer link that navigates to the page.
- R2. Keep the page Turkish-first and user-facing; the route should be localizable through the existing `[locale]` structure, but the first release may keep the body copy narrowly focused on the Turkish audience.
- R3. The page must explicitly state the current technical reality: the frontend does not currently load third-party trackers, and the active persistence mechanism in the repo is `sessionStorage` for form state, not browser cookies.
- R4. The page must explain what would count as a future cookie/trackers change, so the site can later add consent UI without rewriting the notice from scratch.
- R5. The footer entry must be a normal navigation link, not a modal or in-place drawer.
- R6. The change must not require backend schema or API changes.

---

## Scope Boundaries

- No cookie consent banner is in scope for this pass because the codebase does not currently set non-essential cookies or load third-party tracking scripts.
- No backend changes are needed.
- No attempt should be made to reclassify `sessionStorage` as a cookie control surface.
- English translation parity can be deferred if the team wants the first release to be Turkish-only; the plan assumes Turkish-first content is acceptable for v1.

### Deferred to Follow-Up Work

- Consent banner / preference center implementation if analytics, marketing, or other non-essential trackers are introduced later.
- Cookie preference persistence mechanism, because there is no current preference state to manage.

---

## Context & Research

### Relevant Code and Patterns

- `frontend/src/app/[locale]/kvkk/page.tsx` provides the current legal-page layout pattern, including metadata, hero section, sectioned legal copy, and back navigation.
- `frontend/src/data/kvkk.json` shows the existing pattern for moving legal prose into a structured data file.
- `frontend/src/components/site-footer.tsx` is the correct place to add a legal navigation entry.
- `frontend/src/messages/tr.json` and `frontend/src/messages/en.json` hold footer labels and other localized UI strings.
- `frontend/src/lib/form-storage.ts` documents the actual browser storage currently used by the app.
- `frontend/src/hooks/use-event-registration-form.ts` and `frontend/src/components/contact/intent-lead-form.tsx` both rely on that storage layer for form persistence.

### Institutional Learnings

- Legal pages in this repo are route-based and accessible from the footer.
- Keep legal copy accurate to the implementation surface; do not overstate cookie usage when the app only uses `sessionStorage`.
- Preserve Turkish editorial tone and avoid generic English placeholders in user-visible legal text.

### External References

- KVKK cookie guidance: `https://www.kvkk.gov.tr/Icerik/7353/Cerez-Uygulamalari-Hakkinda-Rehber`
- ICO cookies guidance: `https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/`
- EDPB consent guidance: `https://www.edpb.europa.eu/node/5326_mt`

---

## Key Technical Decisions

1. Use a dedicated locale-aware route for the cookie notice instead of overloading `/kvkk`. The page name should be explicit enough to satisfy legal review and easy enough for users to find from the footer.
2. Keep the implementation frontend-only. The current repo state does not justify backend changes.
3. Treat the page as disclosure, not control. Since there is no actual cookie preference system yet, the page should document current behavior and point to future governance if tracking is added later.
4. Keep the footer link as plain navigation. The page should be reachable without JavaScript-specific behavior.
5. Prefer a structured content file for the body copy so the legal prose stays separate from the layout shell, following the existing KVKK page pattern.

---

## Open Questions

### Resolved During Planning

- The site does not currently need a banner because there are no non-essential cookies or third-party trackers in the frontend shell.
- `sessionStorage` is not part of the cookie disclosure surface, but it should be mentioned as browser storage if needed for clarity.
- The working route slug is `cerez-aydinlatma-metni`.
- The first release can be Turkish-only as long as footer labels stay aligned with the existing translation system.

### Deferred to Implementation

- If the legal team wants bilingual body copy in v1, add the English content file alongside the Turkish one; otherwise keep the body prose Turkish-only for this pass.

---

## High-Level Technical Design

Create a new locale-aware page under `frontend/src/app/[locale]/cerez-aydinlatma-metni/page.tsx` that mirrors the legal-page structure used by the KVKK route. The page should import its long-form copy from a data file such as `frontend/src/data/cerez-aydinlatma-metni.json`, render a compact hero, then present sections that explain:

- what cookies are,
- what this site currently does and does not set,
- how `sessionStorage` is used for form persistence,
- what would change if non-essential tracking is added later,
- where users can ask questions or request updates.

Update the footer in `frontend/src/components/site-footer.tsx` so the legal area links to the new page. Add localized label keys to `frontend/src/messages/tr.json` and `frontend/src/messages/en.json` so the footer text remains consistent with the rest of the site.

The route should continue to use the existing locale path helpers for metadata and canonical URLs, so the new page behaves like the rest of the localized site shell.

## Implementation Sequence

1. Add the new content file and page shell first so the route exists before any footer wiring points to it.
2. Wire the footer link and translation keys second, so the page becomes discoverable from the standard legal navigation.
3. Add or update source-level tests after the route and footer are in place, so the assertions match the final file structure rather than an intermediate draft.
4. Run the frontend lint/build checks last, because the page is frontend-only and no backend work depends on it.

---

## Implementation Units

### U1. Add the cookie disclosure route and body copy

**Files**
- `frontend/src/app/[locale]/cerez-aydinlatma-metni/page.tsx`
- `frontend/src/data/cerez-aydinlatma-metni.json`

**Work**
- Create the page shell, metadata, and sectioned legal content.
- Keep the copy honest about the current state: no active third-party trackers, no cookie preference UI yet, and `sessionStorage` only for form continuity.
- Make the page visually consistent with the existing legal page pattern.

**Test file**
- `frontend/src/__tests__/app/cerez-aydinlatma-metni/page.test.mjs`

**Test scenarios**
- Page renders with the expected `data-testid`.
- Metadata includes a readable title and description for the route.
- The page contains the disclosure sections for current usage and future-change notice.
- The page includes a back navigation affordance consistent with the legal pages.
- The route slug reads cleanly in Turkish UI context and matches the footer label.

### U2. Wire the footer entry and localized labels

**Files**
- `frontend/src/components/site-footer.tsx`
- `frontend/src/messages/tr.json`
- `frontend/src/messages/en.json`

**Work**
- Add the new legal footer link with a stable `data-testid`.
- Add the translation keys for the footer label and any small supporting chrome strings.
- Leave the existing `KVKK` and external corporate link behavior unchanged.
- Footer copy uses the existing translation pattern rather than hard-coded text.

**Test file**
- `frontend/src/__tests__/site-shell-testids-source.test.mjs`

**Test scenarios**
- Footer source contains the new legal link test id.
- Existing footer legal links remain present.
- The legal navigation still renders as plain links rather than a custom interaction surface.

### U3. Clarify the current storage posture in the legal copy

**Files**
- `frontend/src/lib/form-storage.ts`
- `frontend/src/hooks/use-event-registration-form.ts`
- `frontend/src/components/contact/intent-lead-form.tsx`

**Work**
- Use the current storage behavior as the factual basis for the page copy.
- Avoid implying that the app manages cookie consent today.
- Ensure the legal text distinguishes browser storage from cookies and trackers.

**Test file**
- `frontend/src/__tests__/form-storage-source.test.mjs`

**Test scenarios**
- Source-level expectations continue to show `sessionStorage` as the persistence mechanism.
- The page copy does not mislabel this storage as cookie management.

---

## System-Wide Impact

- Frontend-only change.
- No Strapi schema, controller, or service updates.
- No change to the public registration or contact APIs.
- No change to analytics capture behavior.

---

## Risks & Dependencies

- If a third-party tracker is added later without a banner or preference control, this page will need a follow-up consent surface.
- If the footer label is too generic, users may not understand that the link leads to a legal disclosure rather than a settings panel.
- If the copy overclaims on cookie usage, it will create a compliance mismatch with the actual app behavior.

---

## Documentation / Operational Notes

- Keep the wording aligned with the existing Turkish site voice.
- Preserve the distinction between legal disclosure and control surface.
- If the team later adds analytics or marketing scripts, update this plan or open a follow-up plan for consent tooling instead of silently expanding scope.

---

## Sources & References

- `frontend/src/app/[locale]/kvkk/page.tsx`
- `frontend/src/data/kvkk.json`
- `frontend/src/components/site-footer.tsx`
- `frontend/src/lib/form-storage.ts`
- `frontend/src/hooks/use-event-registration-form.ts`
- `frontend/src/components/contact/intent-lead-form.tsx`
- `frontend/src/messages/tr.json`
- `frontend/src/messages/en.json`
