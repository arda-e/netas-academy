# i18n: Turkish + English Internationalization

**Status:** Approved  
**Date:** 2026-05-08  
**Locales:** `tr` (default), `en`  
**Audience:** International professionals browsing courses and events

---

## Problem

The site is Turkish-only. International professionals cannot meaningfully use it — URL slugs, navigation, UI chrome, and all Strapi content are in Turkish with no English path. This blocks the site from serving a non-Turkish professional audience.

---

## Goals

- English-speaking users can navigate the full site in English, including discovering and registering for courses and events.
- Existing Turkish URLs (`/egitimler`, `/etkinlikler`, etc.) continue to work without redirects or changes.
- English pages live at locale-prefixed, English-slug URLs (`/en/courses`, `/en/events`).
- A language switcher lets users toggle between locales on any page.

## Non-Goals

- More than two locales.
- RTL layout support.
- Machine translation or automated translation pipelines.
- CMS admin UI translation (Strapi admin stays in its default language).
- Translating transactional content types: `registration`, `contact-submission`, `newsletter-subscription`, `course-application`, `student`, `analytics-event`, `notification-routing`.

---

## Success Criteria

- An English-speaking user can find a course, read its full description in English, and complete registration — without encountering any Turkish UI text.
- Turkish users see zero change to existing URLs, navigation, or page content.
- All page-level `<html lang>` and `<meta>` tags reflect the active locale.
- `hreflang` alternate links are present on every page pairing a Turkish and English URL.

---

## URL Structure

Turkish is the default locale and carries no prefix. English pages are locale-prefixed with translated slugs.

| Page           | Turkish (default) | English              |
|----------------|-------------------|----------------------|
| Home           | `/`               | `/en`                |
| Courses        | `/egitimler`      | `/en/courses`        |
| Course detail  | `/egitimler/[slug]` | `/en/courses/[slug]` |
| Events         | `/etkinlikler`    | `/en/events`         |
| Event detail   | `/etkinlikler/[slug]` | `/en/events/[slug]` |
| Teachers       | `/egitmenler`     | `/en/teachers`       |
| Teacher detail | `/egitmenler/[slug]` | `/en/teachers/[slug]` |
| Blog           | `/blog-yazilari`  | `/en/blog`           |
| Blog detail    | `/blog-yazilari/[slug]` | `/en/blog/[slug]` |
| About          | `/hakkimizda`     | `/en/about`          |
| Contact        | `/iletisim`       | `/en/contact`        |
| Solution Partner | `/cozum-ortagi` | `/en/solution-partner` |
| News           | `/haberler`       | `/en/news`           |
| KVKK           | `/kvkk`           | `/en/kvkk`           |

> Slugs for content detail pages (courses, events, blog posts) are locale-specific and stored in Strapi per locale. A Turkish course at `/egitimler/veri-analizi` may have an English counterpart at `/en/courses/data-analysis`.

---

## Phase 1: Routing Infrastructure + UI Strings

**Deliverable:** All frontend routing and UI chrome is bilingual. Turkish pages unchanged. English pages exist with English UI and a "content not yet translated" fallback where Strapi content is still Turkish-only.

### Frontend (Next.js)

**Library:** next-intl (App Router native, supports default-locale-unprefixed routing out of the box).

**Routing structure:**  
Restructure `frontend/src/app/` to `frontend/src/app/[locale]/`. The Turkish locale routes without a prefix; the `en` locale routes with `/en/`. next-intl middleware handles locale detection and routing.

**Translation files:**  
Introduce `frontend/src/messages/tr.json` and `frontend/src/messages/en.json`. All hardcoded UI strings are extracted into these files. Scope includes:

- Navigation labels (`frontend/src/config/navigation.ts` and `frontend/src/components/site-header.tsx`)
- Footer links and labels (`frontend/src/components/site-footer.tsx`)
- Page metadata (title, description) for every route
- Hero headings, subheadings, and CTA labels (spread across page components)
- Form labels, placeholders, validation messages, and submit buttons
- Error and loading state messages
- Breadcrumb labels
- Section headings and static copy on all pages

**Language switcher:**  
A locale toggle appears in the site header. It renders the two locale options (`TR` / `EN`) and navigates to the equivalent page in the other locale, preserving the current path where a translation exists.

**Fallback behavior (Phase 1 only):**  
English pages that fetch Strapi content display the Turkish content with a visible "English version coming soon" notice. This is a temporary state — the notice is removed when Phase 2 content is available.

**`<html lang>` and metadata:**  
The root layout sets `lang` dynamically from the active locale. Page-level metadata uses locale-specific strings from translation files.

**`hreflang` tags:**  
Each page emits `<link rel="alternate" hreflang="tr">` and `<link rel="alternate" hreflang="en">` pointing to the canonical URLs for both locales.

---

## Phase 2: Strapi Content i18n

**Deliverable:** User-facing Strapi content is translatable. English translations are authored in the CMS. English detail pages surface real translated content.

### Backend (Strapi 5.x)

**Plugin:** `@strapi/plugin-i18n` (built-in, requires enabling in `backend/config/plugins.ts`).

**Content types to make i18n-aware:**

| Content type  | Strapi API name | Translatable fields                                      |
|---------------|-----------------|----------------------------------------------------------|
| Course        | `course`        | `title`, `slug`, `summary`, `description`, `topicArea` (label), `level` (label) |
| Event         | `event`         | `title`, `slug`, `summary`, `description`, `location`   |
| Blog Post     | `blog-post`     | `title`, `slug`, `summary`, `body`                      |
| Teacher       | `teacher`       | `bio`, `slug`                                           |
| Blog Author   | `blog-author`   | `bio`                                                   |

> `fullName`, `profilePhoto`, `email`, and other non-textual or identity fields on `teacher` and `blog-author` are shared across locales (not duplicated per locale).

**Data migration:**  
Enabling i18n on an existing content type requires associating existing records with the `tr` locale. This must be done via a Strapi migration script before content editors begin adding English translations. Existing records must not lose data or publish state during migration.

**Slug handling:**  
Each locale stores its own `slug` value. Turkish slugs remain unchanged. English slugs are authored alongside English content in the Strapi admin.

**Frontend integration:**  
Strapi API calls in `frontend/src/lib/strapi-*.ts` pass the active locale as a query parameter (`?locale=tr` or `?locale=en`). If no English locale record exists for a given entry, the frontend falls back to the Turkish record and shows the "not yet translated" notice (same pattern established in Phase 1).

---

## Out of Scope (Deferred)

- Translating news items (`haberler`) — lower priority; can follow the same Phase 2 pattern later.
- Automated slug redirect mapping (if an English slug changes, no automatic redirect is generated in Phase 1).
- Per-locale sitemap generation — can be added after both phases ship.
- Locale detection from browser `Accept-Language` header — users select locale manually via the switcher.

---

## Dependencies and Assumptions

- Strapi 5.x ships with `@strapi/plugin-i18n` as a first-party plugin; no third-party dependency is required.
- Content editors will author English translations in the Strapi admin after Phase 2 ships. This document does not cover the translation workflow or tooling for editors.
- English slugs for content detail pages will be decided by content editors at translation time, not pre-defined by engineering.
- next-intl is compatible with the project's current Next.js 16 (App Router) setup.
- The existing test suite (source tests in `frontend/src/__tests__/`) will need updates for any components that receive locale-aware props or routing changes.
