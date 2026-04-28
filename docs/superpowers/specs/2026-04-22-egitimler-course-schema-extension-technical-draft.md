# `/egitimler` Course Schema Extension Technical Draft

## Purpose

This document turns the ideation outcome in
`docs/ideation/2026-04-22-egitimler-course-schema-minimum-extension.md`
into a concrete technical draft.

Goal:

- improve `/egitimler` and course detail decision quality
- keep the schema extension minimal
- avoid a heavy catalog model in the first phase

## Chosen Extension Set

The first implementation should add these fields to `course`:

1. `targetAudience`
2. `keyOutcomes`
3. `deliveryFormat`

## Strapi Field Shape

Target file:

- `backend/src/api/course/content-types/course/schema.json`

### 1. `targetAudience`

Recommended shape:

```json
"targetAudience": {
  "type": "text"
}
```

Reasoning:

- this is editorial copy, not a closed taxonomy
- one short paragraph is enough for the first phase
- it can power both card snippets and a detail-page audience block

### 2. `keyOutcomes`

Recommended shape:

```json
"keyOutcomes": {
  "type": "json"
}
```

Expected editorial value:

```json
[
  "Dagitim risklerini daha erken gorme",
  "Takim ici ortak teknik dil kurma",
  "Kurumsal uygulama senaryolari ile ilerleme"
]
```

Reasoning:

- first phase should avoid introducing a repeatable component unless needed
- a JSON string array is enough for 2-4 short bullet outcomes
- frontend can defensively coerce to `string[]`

Validation expectation in app code:

- accept only arrays of strings
- ignore invalid entries instead of crashing the page

### 3. `deliveryFormat`

Recommended shape:

```json
"deliveryFormat": {
  "type": "enumeration",
  "enum": ["onsite", "online_live", "hybrid", "workshop"]
}
```

Reasoning:

- this is a true closed set
- the field supports faster decision-making on the listing surface
- this enum is small enough to stay maintainable

## Suggested Schema Block

Example target addition:

```json
"targetAudience": {
  "type": "text"
},
"keyOutcomes": {
  "type": "json"
},
"deliveryFormat": {
  "type": "enumeration",
  "enum": ["onsite", "online_live", "hybrid", "workshop"]
}
```

## Frontend Data Contract

Target file:

- `frontend/src/lib/strapi.ts`

### `StrapiCourse` extension

Add these fields:

```ts
export type StrapiCourse = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  summary?: string | null;
  description?: string | null;
  targetAudience?: string | null;
  keyOutcomes?: string[] | null;
  deliveryFormat?: "onsite" | "online_live" | "hybrid" | "workshop" | null;
  teacher?: {
    id: number;
    documentId: string;
    fullName: string;
    slug: string;
  } | null;
};
```

### Coercion helper

Because Strapi `json` is not strongly typed, add a helper:

```ts
function coerceStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );
}
```

When normalizing fetched course data, convert `keyOutcomes` through that helper.

### Fetch contract updates

`getCourses()` should additionally request:

- `targetAudience`
- `deliveryFormat`

`getCourseBySlug()` should additionally request:

- `targetAudience`
- `deliveryFormat`
- `keyOutcomes`

## Frontend Rendering Plan

### Listing page

Target file:

- `frontend/src/app/egitimler/page.tsx`

Use the new fields as follows:

- `targetAudience`: one short decision line under summary or in meta area
- `deliveryFormat`: a small visible format badge

Do not render `keyOutcomes` on the listing page in the first phase. That would make cards too dense.

### Course card

Relevant file:

- `frontend/src/components/content/courses.tsx`

Recommended card usage:

- title
- teacher name
- summary
- `targetAudience` as short meta line
- `deliveryFormat` as compact badge or label

Card rule:

- if a field is empty, omit it cleanly
- do not render placeholder noise like "Belirtilmedi"

### Detail page

Target file:

- `frontend/src/app/egitimler/[slug]/page.tsx`

Recommended detail blocks:

1. `Hedef Kitle`
   - sourced from `targetAudience`

2. `Öne Çıkan Kazanımlar`
   - sourced from `keyOutcomes`
   - shown as 2-4 bullets

3. `Teslim Formatı`
   - sourced from `deliveryFormat`
   - mapped to Turkish label

These blocks should sit above or alongside the long description so the page becomes a decision surface, not just a reading surface.

## Label Mapping

Frontend should map `deliveryFormat` to Turkish labels:

```ts
const deliveryFormatLabels = {
  onsite: "Yüz Yüze",
  online_live: "Canlı Online",
  hybrid: "Hibrit",
  workshop: "Atölye",
} as const;
```

## Seed Impact

Target file:

- `backend/scripts/seed-demo.js`

Each demo course should be updated with:

- `targetAudience`
- `keyOutcomes`
- `deliveryFormat`

Without that, the new frontend surface will remain structurally correct but editorially weak in local testing.

## Out of Scope

This draft intentionally does not add:

- course categories
- topic tags
- duration
- level
- downloadable materials
- CTA label per course
- lead routing fields

These can be revisited later if the listing surface still feels too weak after the first extension.

## Implementation Sequence

1. extend `course` schema
2. update demo seed
3. update `frontend/src/lib/strapi.ts`
4. render new fields on `/egitimler`
5. render new blocks on course detail
6. then connect course detail CTA flow to the lead journey

## Decision Note

This is the smallest technical step that materially improves the decision quality of the training catalog without turning the content model into a heavy discovery platform.
