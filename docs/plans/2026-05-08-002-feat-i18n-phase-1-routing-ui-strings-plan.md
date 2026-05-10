# i18n Phase 1 — Translatable String Discovery & Map

**Status:** planned  
**Output:** `output/i18n-strings-map.json`  
**Purpose:** Produce a machine-readable map of every hardcoded UI string in the frontend so Phase 2 (key extraction + `next-intl` wiring) can proceed systematically.

---

## JSON Schema

File: `output/i18n-strings-map.json`

```jsonc
{
  "schema_version": "1.0",
  "generated_at": "ISO-8601 timestamp",
  "total_entries": 0,
  "entries": [
    {
      // unique stable ID: "<relative-file-path>:<line>:<col_start>"
      "id": "frontend/src/components/site-footer.tsx:15:12",

      // path relative to repo root
      "file": "frontend/src/components/site-footer.tsx",

      // 1-based line number
      "line": 15,

      // 0-based column of first char of the string content (not the quote)
      "col_start": 12,

      // 0-based column just past the last char of the string content
      "col_end": 25,

      // the raw string value exactly as it appears in source
      "text": "Netas Academy",

      // one of: "jsx_text" | "jsx_attr_string" | "string_literal" | "template_literal"
      "context_type": "jsx_text",

      // for "jsx_attr_string": the attribute name (e.g. "aria-label", "alt", "placeholder", "title")
      // for "string_literal": the variable or prop name it is assigned to
      // null for "jsx_text" and "template_literal"
      "context_detail": null,

      // nearest enclosing named function/component at the point of the string
      "component": "SiteFooter",

      // auto-suggested dot-notation key: "<snake_component>.<snake_description>"
      "suggested_key": "site_footer.brand_name",

      // workflow state — agents write "pending"; humans set "reviewed" or "skipped"
      "status": "pending"
    }
  ]
}
```

### `context_type` values

| Value | Meaning | Replacement pattern |
|---|---|---|
| `jsx_text` | Text node between JSX tags | `{t("key")}` |
| `jsx_attr_string` | String attribute value (`aria-label`, `alt`, `placeholder`, `title`) | `{t("key")}` |
| `string_literal` | String in TS/JS logic (variable, object value, error message) | `t("key")` |
| `template_literal` | Template literal with embedded expressions | `t("key", { var })` |

### Strings to SKIP

Do **not** emit entries for:
- Import paths and module specifiers
- Tailwind/CSS class strings (any string whose content looks like CSS utility names)
- `data-testid` attribute values
- `href` / `src` / `rel` / `target` / `id` / `key` / `name` attribute values (non-display)
- TypeScript type literals and enum-style string unions
- Console log messages and developer-facing error strings
- Strings under `node_modules/` or `dist/`

---

## Orchestrator Task

> **Role:** You are an orchestrator. Your job is to spawn parallel explorer agents (one per file group), collect their partial JSON arrays, merge them into `output/i18n-strings-map.json`, and set `generated_at` and `total_entries`. Do not explore files yourself — delegate entirely.

### Step 1 — Spawn these four explorer agents in parallel

Each agent receives the **Explorer Agent Prompt** below, with its assigned file list substituted in.

#### Group A — App pages
```
frontend/src/app/page.tsx
frontend/src/app/layout.tsx
frontend/src/app/error.tsx
frontend/src/app/blog-yazilari/[slug]/page.tsx
frontend/src/app/blog-yazilari/page.tsx
frontend/src/app/egitimler/[slug]/page.tsx
frontend/src/app/egitimler/page.tsx
frontend/src/app/etkinlikler/[slug]/page.tsx
frontend/src/app/etkinlikler/[slug]/kayit/page.tsx
frontend/src/app/etkinlikler/page.tsx
frontend/src/app/egitmenler/[slug]/page.tsx
frontend/src/app/egitmenler/page.tsx
frontend/src/app/hakkimizda/page.tsx
frontend/src/app/cozum-ortagi/page.tsx
frontend/src/app/haberler/page.tsx
frontend/src/app/iletisim/page.tsx
frontend/src/app/kvkk/page.tsx
```

#### Group B — Content components
```
frontend/src/components/content/blog.tsx
frontend/src/components/content/blog-related-posts.tsx
frontend/src/components/content/courses.tsx
frontend/src/components/content/events.tsx
frontend/src/components/content/news.tsx
frontend/src/components/content/content-card-shell.tsx
frontend/src/components/content/content-detail-shell.tsx
frontend/src/components/content/content-page-shell.tsx
frontend/src/components/content/content-superheading.tsx
frontend/src/components/content/content-grid.tsx
frontend/src/components/content/visual-story-section.tsx
frontend/src/components/content/search-field.tsx
frontend/src/components/content/route-loading.tsx
frontend/src/components/content/rich-text-content.tsx
```

#### Group C — Shell + form components
```
frontend/src/components/site-header.tsx
frontend/src/components/site-footer.tsx
frontend/src/components/hero-overlay.tsx
frontend/src/components/breadcrumbs.tsx
frontend/src/components/teacher-card.tsx
frontend/src/components/teacher-carousel.tsx
frontend/src/components/course-carousel.tsx
frontend/src/components/kvkk-back-button.tsx
frontend/src/components/event-registration-form.tsx
frontend/src/components/newsletter-subscription-form.tsx
frontend/src/components/contact/intent-lead-form.tsx
frontend/src/components/contact/intent-field-sections.tsx
frontend/src/components/courses/course-catalog-list.tsx
```

#### Group D — Logic & config (UI-facing strings only)
```
frontend/src/config/navigation.ts
frontend/src/lib/lead-intents.ts
frontend/src/lib/date-formatting.ts
frontend/src/lib/content-taxonomy.ts
frontend/src/lib/page-visual-sections.ts
frontend/src/hooks/use-event-registration-form.ts
frontend/src/hooks/use-form-persistence.ts
```

---

### Explorer Agent Prompt

> Copy this prompt verbatim for each agent, substituting `{{FILE_LIST}}` and `{{GROUP_ID}}`.

---

You are a cheap, read-only string extraction agent. Your only job is to read a list of source files, find every hardcoded UI string that a human would eventually need to translate, and return a JSON array of entries.

**Files to scan (Group {{GROUP_ID}}):**
```
{{FILE_LIST}}
```

**Output format** — return a single JSON array (no surrounding object), one entry per string:
```json
[
  {
    "id": "<relative-file>:<line>:<col_start>",
    "file": "<path relative to repo root>",
    "line": <1-based int>,
    "col_start": <0-based int, first char of string content, not the quote>,
    "col_end": <0-based int, one past last char>,
    "text": "<exact string value>",
    "context_type": "<jsx_text|jsx_attr_string|string_literal|template_literal>",
    "context_detail": "<attr name or variable name, or null>",
    "component": "<nearest enclosing function/component name>",
    "suggested_key": "<snake_component>.<snake_description>",
    "status": "pending"
  }
]
```

**What to capture:**
- JSX text nodes between tags — any visible human-readable text
- JSX string attributes: `aria-label`, `alt`, `placeholder`, `title`, `aria-description`
- Strings assigned to variables that surface as UI messages (error messages, success messages, labels, descriptions)
- Template literals that produce user-visible strings

**What to SKIP (do not emit entries for these):**
- Import paths and module specifiers
- Tailwind / CSS class name strings
- `data-testid` values
- Non-display attributes: `href`, `src`, `rel`, `target`, `id`, `key`, `name`, `type`, `method`, `rel`
- TypeScript type literals and string union members
- Console.log / developer-facing error strings
- Any string that is clearly a slug, URL path segment, or internal identifier

For `suggested_key`: convert the component name to snake_case as the prefix, then add a short snake_case description of what the string is. Example: `SiteFooter` + "Eğitim, etkinlik..." → `"site_footer.tagline"`.

Return only the JSON array. No prose, no markdown fences, no explanation.

---

### Step 2 — Merge

After all four agents respond:

1. Concatenate the four arrays into one flat array.
2. Sort by `file`, then `line`, then `col_start`.
3. Deduplicate on `id` (keep first occurrence if the same string somehow appeared in two groups — this should not happen but guard anyway).
4. Write the merged result to `output/i18n-strings-map.json`:
   ```json
   {
     "schema_version": "1.0",
     "generated_at": "<ISO-8601 now>",
     "total_entries": <count>,
     "entries": [ ...merged array... ]
   }
   ```
5. Report a summary: total entries found, breakdown by group (A/B/C/D), and any files that returned zero entries (possible skip or empty file).

---

## Next steps after map is complete

1. **Human review pass** — open `output/i18n-strings-map.json`, flip `"status"` to `"skipped"` for any false positives (CSS values the agent missed, brand names that should not be translated, etc.).
2. **Key extraction** — a follow-up agent reads all `"pending"` entries and emits `frontend/messages/tr.json` (the Turkish source-of-truth) and `frontend/messages/en.json` (stubs).
3. **Replacement pass** — a code-mod agent reads the map and replaces each string with `t("suggested_key")`, adding `useTranslations` imports where needed.
4. **next-intl wiring** — add `[locale]` segment, middleware, and `i18n.ts` config per `next-intl` docs.
