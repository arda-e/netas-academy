---
title: "feat: Add blog discovery and author context"
type: feat
status: active
date: 2026-04-27
origin: docs/brainstorms/2026-04-22-blog-yazilari-requirements.md
---

# feat: Add blog discovery and author context

## Overview

Turn `/blog-yazilari` from a basic archive into a discovery surface with title search, newest-first ordering, visible publication date, lightweight author context, and related-content next steps.

## Problem Frame

The blog should demonstrate expertise and trust, not act as an aggressive sales funnel. The origin document requires author voice, lightweight editorial discipline, title search, newest-first sorting, and stronger author visibility on detail pages (see origin: `docs/brainstorms/2026-04-22-blog-yazilari-requirements.md`).

## Requirements Trace

- R1. Preserve blog as a trust and expertise surface, with sales CTAs only secondary.
- R2. Support authors beyond teachers while showing author name in lists and author name/role/short bio in details.
- R3. Add title-only search in the first version and sort newest to oldest.
- R4. Show title, excerpt, date, and author name on cards.
- R5. Add source/support context on detail pages without forcing references for every post.
- R6. End detail pages with related posts or content discovery, not a dominant sales CTA.

## Scope Boundaries

- No full blog taxonomy, SEO strategy, content calendar, lead scoring, or direct sales automation.
- No requirement to relate blog posts to courses or webinars in the first version.

## Context & Research

### Relevant Code and Patterns

- `frontend/src/app/blog-yazilari/page.tsx` and `frontend/src/app/blog-yazilari/[slug]/page.tsx` are server-rendered.
- `frontend/src/components/content/blog.tsx` owns the shared blog list/detail wrappers.
- `backend/src/api/blog-post/content-types/blog-post/schema.json` has only title, slug, excerpt, content, and cover image.
- `frontend/src/lib/strapi.ts` sorts blog posts by title today.

### Institutional Learnings

- Shared content shells should remain the visual baseline; domain wrappers should keep Strapi/view-model differences out of shell components.

## Key Technical Decisions

- Add a separate `blog-author` content type instead of reusing `teacher`: the origin explicitly says authors are not only teachers, and this avoids coupling editorial publishing to instructor profiles.
- Use Strapi `publishedAt` or an explicit `publishedDate` field for display and sorting; if historical records need stable dates, prefer explicit `publishedDate`.
- Implement first-version search with a small client island over server-fetched posts: the requirement is title-only search, and the list size is expected to stay small.
- Model references as optional rich text or plain text `sourceNotes`: this supports “dayanak” without requiring a heavy citation system.

## Open Questions

### Resolved During Planning

- Blog author representation: use a dedicated `blog-author` collection to support non-teacher writers.
- Search strategy: first version filters already-fetched titles client-side; no backend search dependency is needed.
- Source display: use an optional lightweight support/source block rather than mandatory footnotes.

### Deferred to Implementation

- Exact empty-state copy for no search results.
- Whether `publishedDate` should default from existing Strapi `publishedAt` in demo data.

## Implementation Units

- [ ] **Unit 1: Blog editorial model**

**Goal:** Add author and support metadata to blog posts.

**Requirements:** R2, R4, R5

**Dependencies:** None

**Files:**
- Create: `backend/src/api/blog-author/content-types/blog-author/schema.json`
- Create: `backend/src/api/blog-author/controllers/blog-author.ts`
- Create: `backend/src/api/blog-author/routes/blog-author.ts`
- Create: `backend/src/api/blog-author/services/blog-author.ts`
- Modify: `backend/src/api/blog-post/content-types/blog-post/schema.json`
- Modify: `backend/src/index.ts`
- Modify: `backend/scripts/seed-demo.js`
- Test: `backend/tests/api/blog-author/schema.test.ts`

**Approach:**
- Create `blog-author` with `displayName`, `slug`, `role`, and `shortBio`.
- Add `author`, `publishedDate`, and optional `sourceNotes` to `blog-post`.
- Enable public read permissions for `blog-author` in bootstrap.

**Patterns to follow:**
- `backend/src/api/teacher/*` for a small public content type.
- `backend/src/index.ts` public read permission bootstrap.

**Test scenarios:**
- Happy path: a blog post can reference a non-teacher author with role and short bio.
- Edge case: a post without `sourceNotes` remains valid.
- Integration: bootstrap includes public `blog-author.find` and `findOne` permissions.

**Verification:**
- Demo seed produces posts with author and date data visible through Strapi queries.

- [ ] **Unit 2: Strapi fetch contract**

**Goal:** Expose author, date, and source fields through frontend fetch helpers.

**Requirements:** R2, R3, R4, R5

**Dependencies:** Unit 1

**Files:**
- Modify: `frontend/src/lib/strapi.ts`
- Test: `frontend/src/__tests__/blog-strapi-contract-source.test.mjs`

**Approach:**
- Extend `StrapiBlogPost` with `publishedDate`, `sourceNotes`, and `author`.
- Sort `getBlogPosts()` newest-first by `publishedDate`.
- Populate author fields in list and detail queries.

**Patterns to follow:**
- Existing `getTeachers()` and `getBlogPosts()` query style.

**Test scenarios:**
- Happy path: list query requests author name and published date.
- Happy path: detail query requests author role, short bio, and source notes.
- Edge case: missing author returns null-safe frontend data.

**Verification:**
- Blog pages render without throwing when author/source data is missing.

- [ ] **Unit 3: Blog list discovery UI**

**Goal:** Add a title-searchable, newest-first blog list with author/date context.

**Requirements:** R3, R4

**Dependencies:** Unit 2

**Files:**
- Modify: `frontend/src/app/blog-yazilari/page.tsx`
- Modify: `frontend/src/components/content/blog.tsx`
- Create: `frontend/src/components/blog/blog-discovery-list.tsx`
- Test: `frontend/src/__tests__/blog-discovery-source.test.mjs`

**Approach:**
- Keep the page shell server-rendered and use a small client component only for the search input and filtered list.
- Show title, excerpt, date, and author name on each card.
- Keep filtering title-only for first version.

**Patterns to follow:**
- `ContentPageShell`, `ContentGrid`, `ContentCardShell`.

**Test scenarios:**
- Happy path: initial list order is newest to oldest.
- Happy path: searching by a title substring narrows visible cards.
- Edge case: unmatched search shows a friendly empty state.
- Integration: list card author/date context stays visible without replacing shared card styling.

**Verification:**
- The blog listing behaves as a discovery surface and remains visually aligned with shared content pages.

- [ ] **Unit 4: Blog detail author and related content**

**Goal:** Strengthen detail-page trust context and add non-sales next steps.

**Requirements:** R1, R2, R5, R6

**Dependencies:** Unit 2

**Files:**
- Modify: `frontend/src/app/blog-yazilari/[slug]/page.tsx`
- Modify: `frontend/src/components/content/blog.tsx`
- Test: `frontend/src/__tests__/blog-detail-source.test.mjs`

**Approach:**
- Show author name, role, and short bio near the post header or immediately after the intro.
- Render optional source/support notes below content.
- Add related posts from the same fetched blog collection, excluding the current slug.

**Patterns to follow:**
- `ContentDetailShell` detail layout.
- Existing `VisualStorySection` as secondary ambience, not primary CTA.

**Test scenarios:**
- Happy path: detail page with author renders name, role, and short bio.
- Edge case: missing author renders content without an empty author box.
- Edge case: missing source notes omits the support block.
- Integration: related posts exclude the current post and link to valid blog detail routes.

**Verification:**
- Blog detail remains content-first and provides related discovery without a dominant sales CTA.

## System-Wide Impact

- **Interaction graph:** blog list, blog detail, Strapi blog-post, new blog-author content type, bootstrap permissions, demo seed.
- **Error propagation:** Strapi fetch helpers should continue returning empty/null-safe results.
- **State lifecycle risks:** existing posts need author/date defaults or null-safe frontend fallbacks.
- **API surface parity:** list and detail queries must request matching author field names.
- **Integration coverage:** demo seed should cover author, date, source notes, and missing optional source notes.
- **Unchanged invariants:** blog remains independent from teacher profiles and course sales automation.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Author model overbuilds first version | Keep fields minimal: display name, role, short bio, slug. |
| Existing posts lack dates/authors | Add null-safe rendering and seed defaults. |
| Search implies full-text capability | Keep UI copy and tests title-focused. |

## Sources & References

- Origin document: `docs/brainstorms/2026-04-22-blog-yazilari-requirements.md`
- Related code: `frontend/src/app/blog-yazilari/page.tsx`
- Related code: `frontend/src/components/content/blog.tsx`
- Related code: `backend/src/api/blog-post/content-types/blog-post/schema.json`
