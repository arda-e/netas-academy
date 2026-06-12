---
title: "refactor: Contact page intent selector → dropdown"
type: refactor
status: active
date: 2026-06-12
origin: docs/brainstorms/2026-06-12-contact-intent-dropdown-requirements.md
---

# refactor: Contact page intent selector → dropdown

## Summary

Replaces the row of tab buttons on the contact form with a single `<select>` dropdown. The existing `?intent=` preselection and tab-change analytics/form-reset behavior are preserved; the only additions are the dropdown UI, a label, and a `router.replace` call that silently syncs the URL when the user switches intent.

---

## Requirements

- R1. The button tab row is removed; a labeled `<select>` replaces it
- R2. Preselection from `?intent=` query param works on mount (unchanged path: `resolveLeadTypeFromQuery` → `initialLeadType` → `leadType` state)
- R3. Switching the dropdown silently replaces the URL with `?intent=<newType>` (no new history entry, `?topic=` dropped)
- R4. All existing form-reset, field-error-clear, and analytics behavior (`emitLeadTabChange`, `emitLeadTabView`) are preserved
- R5. Dropdown is styled consistently with the other form fields; has a visible label

## Scope Boundaries

- No Radix Select component — native `<select>` is sufficient
- No URL sync for other state (topic, scroll position, etc.)
- No new lead types

---

## Context & Research

### Relevant Code and Patterns

- `frontend/src/components/contact/intent-lead-form.tsx` — the component being changed; tabs are lines 313–341
- `frontend/src/components/kvkk-back-button.tsx` — established pattern for `useRouter` from `@/i18n/navigation`
- `frontend/src/components/site-header.tsx` — established pattern for `usePathname` from `@/i18n/navigation`
- `frontend/src/i18n/navigation.ts` — exports `useRouter`, `usePathname`, `Link` from `createNavigation(routing)`
- `fieldClassName` in `intent-lead-form.tsx` — the shared height/border/bg/radius/focus-ring class string; reuse for the select

### Institutional Learnings

- None relevant.

---

## Key Technical Decisions

- **Native `<select>` over Radix Select**: no `ui/select.tsx` exists in the project; a native element avoids a new component and matches the existing form field styling pattern without added complexity.
- **`router.replace` with `usePathname`**: using `usePathname()` (locale-stripped path) ensures the replacement URL is locale-correct for both `/iletisim` and `/en/iletisim`. The next-intl router re-applies the locale prefix automatically.
- **`?topic=` not carried forward on intent switch**: the topic param is an entry signal for the corporate training CTA; it has no meaning for other intents and would be misleading in a shared URL.
- **New translation key `contact.field.request_type.label`**: both `tr.json` and `en.json` need a label for the dropdown (e.g., "Başvuru Türü" / "Request Type"). The existing `tab.*` keys are reused for the option labels.

---

## Open Questions

### Resolved During Planning

- *Should `router.replace` use `usePathname()` or hardcode `/iletisim`?* → `usePathname()`: locale-safe, zero-cost, established pattern from `site-header.tsx`.
- *Does `router.replace` from next-intl accept a string URL?* → Yes, confirmed by `kvkk-back-button.tsx` which calls `router.push(returnTo)` with a string.

### Deferred to Implementation

- *Exact Tailwind classes for the `<select>` to match `fieldClassName` and look correct in dark mode*: verify visually against the input fields during implementation.

---

## Implementation Units

### U1. Replace intent tabs with a labeled `<select>` dropdown

**Goal:** Remove the button tabs and introduce a controlled `<select>` that drives `leadType`, syncs the URL, and carries all existing analytics and form-reset behavior.

**Requirements:** R1, R2, R3, R4, R5

**Dependencies:** None

**Files:**
- Modify: `frontend/src/components/contact/intent-lead-form.tsx`
- Modify: `frontend/src/messages/tr.json`
- Modify: `frontend/src/messages/en.json`
- Test: `frontend/src/__tests__/intent-lead-form-source.test.mjs`

**Approach:**
- Add `useRouter` and `usePathname` to the `@/i18n/navigation` import line (alongside the existing `Link` import).
- Inside the component, declare `const router = useRouter()` and `const pathname = usePathname()`.
- Remove the `div[data-testid="contact-lead.tabs"]` block and all its `<button>` children entirely.
- In its place, render a `<div className={fieldWrapperClassName}>` containing:
  - `<label>` using `t("field.request_type.label")` with the same `labelClassName`
  - `<select>` with `value={leadType}`, `data-testid="contact-lead.intent-select"`, and the shared field styling. Options are `LEAD_TYPES.map(type => <option key={type} value={type}>{leadIntents[type].label}</option>)`.
- The `onChange` handler mirrors the existing button-click logic: early-return if same type, then call `emitLeadTabChange`, `setSuccess(false)`, `setErrorMessage(null)`, `setFieldErrors({})`, `setLeadType(type)`, and `router.replace(\`${pathname}?intent=${type}\`)`.
- Add `contact.field.request_type.label` to `tr.json` ("Başvuru Türü") and `en.json` ("Request Type").

**Patterns to follow:**
- `fieldClassName` and `labelClassName` constants already defined at the top of `intent-lead-form.tsx` — reuse both.
- `useRouter` import and usage pattern from `frontend/src/components/kvkk-back-button.tsx`.
- `usePathname` import pattern from `frontend/src/components/site-header.tsx`.
- `onChange` logic shape mirrors the existing tab `onClick` handler.

**Test scenarios:**
- **Source shape — select present**: the source of `intent-lead-form.tsx` matches a `<select` with `data-testid="contact-lead.intent-select"`.
- **Source shape — tabs absent**: the source does not contain `data-testid="contact-lead.tabs"`.
- **Source shape — router replace called on change**: the source contains `router.replace` inside the select's change handler body.
- **Source shape — pathname used in replace**: the source references `pathname` in the replace call (not a hardcoded `/iletisim` string).
- **Preselection path unchanged**: `resolveLeadTypeFromQuery` and `initialLeadType` prop are still present in the source; the `useState(initialLeadType)` initializer is unchanged.
- **Analytics preserved**: `emitLeadTabChange` still appears in the source.

**Verification:**
- All six test scenarios above pass via `node --test src/__tests__/intent-lead-form-source.test.mjs`.
- `npm run lint && npm run build:frontend` passes.
- Navigating to `/iletisim?intent=instructor_application` shows the instructor option selected in the dropdown.
- Switching the dropdown updates the URL to `?intent=<type>` without adding a browser history entry.
- Switching the dropdown resets the form fields.

---

## Sources & References

- **Origin document:** [docs/brainstorms/2026-06-12-contact-intent-dropdown-requirements.md](docs/brainstorms/2026-06-12-contact-intent-dropdown-requirements.md)
- Related component: `frontend/src/components/contact/intent-lead-form.tsx`
- Related lib: `frontend/src/lib/lead-intents.ts`
