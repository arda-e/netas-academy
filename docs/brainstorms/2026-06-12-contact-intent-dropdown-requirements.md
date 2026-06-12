---
title: Contact Page — Intent Selector Dropdown
date: 2026-06-12
status: ready-for-planning
---

## Problem

The contact form's intent selector is a row of tab buttons. On small screens these wrap awkwardly, and the component is being simplified to a standard select dropdown that fits naturally in the form flow.

## What We're Building

Replace the button tabs in `frontend/src/components/contact/intent-lead-form.tsx` with a `<select>` dropdown. Scope is limited to this one component; no other files change.

## Acceptance Criteria

1. **Buttons removed** — the `div[data-testid="contact-lead.tabs"]` and all `<button>` children are gone.
2. **Dropdown present** — a labeled `<select>` replaces them, listing all four lead types in the same order as `LEAD_TYPES`.
3. **Preselection works** — arriving at `/iletisim?intent=instructor_application` selects that option in the dropdown on mount (driven by the existing `initialLeadType` → `leadType` state path — no changes needed there).
4. **URL sync on change** — switching the dropdown silently replaces the URL with `?intent=<newType>` (no new history entry). `?topic=` is not carried forward on an intent switch.
5. **Form behavior unchanged** — switching intent still resets the form, clears field errors, and fires `emitLeadTabChange` / `emitLeadTabView`.
6. **Styling consistent** — dropdown matches the existing field height, border, bg, radius, and focus ring (reuse `fieldClassName` or equivalent).
7. **Label present** — a visible label sits above the dropdown, matching the pattern of all other form fields.

## Out of Scope

- Radix Select component (native `<select>` is sufficient)
- URL sync on buttons (they're being removed)
- New lead types
- Any other form changes

## Notes

- Use `router.replace` from `next-intl/navigation` for the URL sync. The client component already imports from `@/i18n/navigation`; `useRouter` can be added alongside it.
- `?topic=` was an entry signal for corporate training CTAs. It is dropped on intent switch since it has no meaning for other intents.
- `data-testid="contact-lead.tabs"` on the wrapper can be retired; add `data-testid="contact-lead.intent-select"` on the new `<select>`.
