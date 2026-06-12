---
date: 2026-06-10
topic: detail-page-service-split-plan
---

# Plan: Apply Service Split to Detail (Slug) Pages

Extends the work from `2026-06-09-crud-route-controller-service-plan.md` to cover detail pages. The list pages already call services directly — this plan brings the same discipline to slug-based detail routes.

## Key difference from list pages

Detail pages have **no public API route layer**. There is no browser consumer — all rendering is server-side. The split is simpler:

```
Page (server component)
     ↓ calls directly
Service (owns slug query, populate, cache)
     ↓ calls
fetchStrapi
```

No route controller, no input normalization, no fallback `[]` — the page's error boundary handles failure.

## Strategy: extend existing service files

Rather than creating `*-detail-service.ts` files, add detail exports to the services created in the list plan. This keeps one file per resource.

Final surface area per service:

| Service | Exports after this plan |
|---------|------------------------|
| `course-service.ts` | `getCourseList`, `getFeaturedCourses`, **`getCourseDetail`**, **`getCourseSlugs`** |
| `teacher-service.ts` | `getTeacherList`, **`getTeacherDetail`**, **`getTeacherSlugs`** |
| `event-service.ts` | `getEventList`, **`getEventDetail`**, **`getEventSlugs`**, **`getEventRegistrationStatus`** |
| `blog-service.ts` | `getBlogPostList`, **`getBlogPostDetail`**, **`getBlogPostSlugs`**, **`getRelatedBlogPosts`** |

Bold = added by this plan.

## Current state

| Page | Strapi helpers imported | `generateStaticParams`? | React `cache()`? |
|------|------------------------|------------------------|-----------------|
| `egitimler/[slug]/page.tsx` | `getCourseBySlug`, `getCourseSlugs` from `strapi-courses` | ✅ yes | ✅ yes |
| `egitmenler/[slug]/page.tsx` | `getTeacherBySlug`, `getTeacherSlugs` from `strapi-teachers` | ✅ yes | ✅ yes |
| `etkinlikler/[slug]/page.tsx` | `getEventBySlug` from `strapi-events` | ❌ missing | ✅ yes |
| `blog-yazilari/[slug]/page.tsx` | `getBlogPostBySlug`, `getRelatedBlogPosts` from `strapi-blog` | ❌ missing | ✅ yes |
| `etkinlikler/[slug]/kayit/page.tsx` | `getEventBySlug`, `getEventRegistrationStatus` from `strapi-events` | N/A (`force-dynamic`) | ✅ yes |

---

## Route A — Course Detail (`egitimler/[slug]`)

### Step 1 — Add to `frontend/src/lib/course-service.ts`

**`getCourseDetail(slug: string)`**
- Mirror the exact query from `getCourseBySlug` in `strapi-courses.ts`: all 10 direct fields + seo (with ogImage) + teacher + events (sorted)
- Wrap with React `cache()` — same as current implementation
- Apply the `strapi-courses` ISR tag

**`getCourseSlugs()`**
- Mirror `getCourseSlugs` from `strapi-courses.ts`: `pageSize=100`, `sort=title:asc`, `fields[0]=slug`
- No cache wrapping needed (used only in `generateStaticParams`, which is cold-start)
- Apply the `strapi-courses` ISR tag

### Step 2 — Switch `egitimler/[slug]/page.tsx`

- Remove imports from `@/lib/strapi-courses`
- Add imports from `@/lib/course-service`
- Replace `getCourseBySlug(slug)` → `getCourseDetail(slug)`
- Replace `getCourseSlugs()` → `getCourseSlugs()` (same name, different source)

---

## Route B — Teacher Detail (`egitmenler/[slug]`)

### Step 1 — Add to `frontend/src/lib/teacher-service.ts`

**`getTeacherDetail(slug: string)`**
- Mirror the exact query from `getTeacherBySlug`: 8 direct fields + seo (with ogImage) + profilePhoto + courses
- Wrap with React `cache()`
- Apply the `strapi-teachers` ISR tag

**`getTeacherSlugs()`**
- Mirror `getTeacherSlugs` from `strapi-teachers.ts`: `pageSize=100`, `sort=fullName:asc`, `fields[0]=slug`
- No cache wrapping needed
- Apply the `strapi-teachers` ISR tag

### Step 2 — Switch `egitmenler/[slug]/page.tsx`

- Remove imports from `@/lib/strapi-teachers`
- Add imports from `@/lib/teacher-service`
- Replace `getTeacherBySlug(slug)` → `getTeacherDetail(slug)`
- Replace `getTeacherSlugs()` → `getTeacherSlugs()`

---

## Route C — Event Detail (`etkinlikler/[slug]`)

### Step 1 — Add to `frontend/src/lib/event-service.ts`

**`getEventDetail(slug: string)`**
- Mirror the exact query from `getEventBySlug`: 10 direct fields + seo (with ogImage) + course (3 fields)
- Wrap with React `cache()`
- Apply the `strapi-events` ISR tag

**`getEventSlugs()`**
- Mirror `getEventSlugs` from `strapi-events.ts`: `pageSize=100`, `sort=startsAt:asc`, `fields[0]=slug`
- No cache wrapping needed
- Apply the `strapi-events` ISR tag

**`getEventRegistrationStatus(documentId: string)`**
- Mirror `getEventRegistrationStatus` from `strapi-events.ts`
- Must preserve `cache: "no-store"` — this endpoint must always be fresh
- No React `cache()` wrapping

### Step 2 — Switch `etkinlikler/[slug]/page.tsx`

- Remove imports from `@/lib/strapi-events`
- Add imports from `@/lib/event-service`
- Replace `getEventBySlug(slug)` → `getEventDetail(slug)`
- **Add `generateStaticParams`** using `getEventSlugs()` — event detail is currently fully dynamic but can be statically generated + revalidated like courses/teachers. Add `export const revalidate = 3600`.

### Step 3 — Switch `etkinlikler/[slug]/kayit/page.tsx`

- Remove imports from `@/lib/strapi-events`
- Add imports from `@/lib/event-service`
- Replace `getEventBySlug(slug)` → `getEventDetail(slug)`
- Replace `getEventRegistrationStatus(documentId)` → `getEventRegistrationStatus(documentId)` (same name)
- Keep `export const dynamic = "force-dynamic"` — registration status must not be cached

---

## Route D — Blog Post Detail (`blog-yazilari/[slug]`)

### Step 1 — Add to `frontend/src/lib/blog-service.ts`

**`getBlogPostDetail(slug: string)`**
- Mirror the exact query from `getBlogPostBySlug`: 6 direct fields + seo (with ogImage) + author (4 fields) + coverImage
- Wrap with React `cache()`
- Apply the `strapi-blog-posts` ISR tag

**`getRelatedBlogPosts(excludeSlug: string, limit?: number)`**
- Mirror `getRelatedBlogPosts` from `strapi-blog.ts`: 4 fields + author (3 fields) + coverImage, filtered by `$ne` slug, sorted `publishedDate:desc`
- Default `limit = 3`
- No React `cache()` wrapping (called once with a different arg per request)
- Apply the `strapi-blog-posts` ISR tag

**`getBlogPostSlugs()`**
- Mirror `getBlogPostSlugs` from `strapi-blog.ts`: `pageSize=100`, `sort=title:asc`, `fields[0]=slug`
- No cache wrapping needed
- Apply the `strapi-blog-posts` ISR tag

### Step 2 — Switch `blog-yazilari/[slug]/page.tsx`

- Remove imports from `@/lib/strapi-blog`
- Add imports from `@/lib/blog-service`
- Replace `getBlogPostBySlug(slug)` → `getBlogPostDetail(slug)`
- Replace `getRelatedBlogPosts(slug)` → `getRelatedBlogPosts(slug)`
- **Add `generateStaticParams`** using `getBlogPostSlugs()` — blog detail is currently fully dynamic but can be statically generated. Add `export const revalidate = 3600`.

---

## Notes on `generateStaticParams` additions

Event and blog detail pages are currently rendered on-demand (`ƒ` in the build output). Adding `generateStaticParams` changes them to SSG with ISR (`●`). This is consistent with how course and teacher detail pages already work, and matches the cache semantics the strapi helpers already set up. The `revalidate` value (3600 s) should match what courses/teachers use.

---

## What NOT to change

- `strapi-*.ts` files — leave them intact; tests reference them directly
- `strapi-media.ts` utility functions (`getStrapiMediaUrl`, `getStrapiMediaAltText`, etc.) — these are not data-fetching, no change needed
- `EventRegistrationForm` component — client component, takes props only, no strapi calls
- `blog-related-posts.tsx` component — uses `strapi-media` utilities only, no fetch calls

---

## Verification

```bash
npm run lint
npm run build:frontend
```

Build output checks:

| Page | Expected before | Expected after |
|------|----------------|---------------|
| `egitimler/[slug]` | `●` SSG | `●` SSG (unchanged) |
| `egitmenler/[slug]` | `●` SSG | `●` SSG (unchanged) |
| `etkinlikler/[slug]` | `ƒ` dynamic | `●` SSG with ISR |
| `blog-yazilari/[slug]` | `ƒ` dynamic | `●` SSG with ISR |
| `etkinlikler/[slug]/kayit` | `ƒ` dynamic | `ƒ` dynamic (unchanged) |

Manual checks:
- Course detail page renders for a known slug
- Teacher detail page renders for a known slug
- Event detail page renders for a known slug
- Blog post detail page renders for a known slug
- Event registration page still loads fresh registration status (no-store preserved)
- Invalid slug → 404 (not found handling unchanged)
