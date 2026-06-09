---
date: 2026-06-09
topic: course-api-route-controller-exemplar
---

# Course API Route Controller Exemplar

## Summary

Introduce a course-list exemplar where server-rendered pages and API route handlers share a course service. The API route acts as the controller layer for HTTP consumers, while the page calls the service directly to preserve server-side cache behavior.

---

## Problem Frame

Course reads currently happen through frontend Strapi helpers that construct Strapi query strings and call `fetchStrapi` directly. That works, but it mixes controller-like endpoint ownership with service-like data access concerns inside the same module. The first architecture move should be small: prove the controller/service boundary with the course list path before repeating the pattern across other reads or mutations.

---

## Key Decisions

- **Use the course list as the exemplar.** The course list is visible, important, and simpler than detail/static-param paths, making it a good first route for the new boundary.
- **Treat the Next.js API route as the controller layer.** The controller owns the public API route contract and delegates work instead of building Strapi query strings itself.
- **Keep server-rendered pages on direct service calls.** The courses page should not self-fetch its own API route when the service is available in the same server process.
- **Use DTO parsing for pagination and sort.** The controller normalizes pagination and course-list sort through `PaginationParamsDTO` before calling the service.
- **Keep Strapi unchanged.** Existing Strapi content types, controllers, services, routes, permissions, and query behavior stay as they are for this pass.
- **Defer repository extraction.** The requested architecture direction includes controller/service/repository, but this first slice proves controller-to-service separation only.

---

## Requirements

**Controller boundary**

- R1. A Next.js API route exposes the course-list read for HTTP consumers.
- R2. The API route delegates course-list retrieval to a course service instead of constructing the Strapi URL inline.
- R3. The API route returns a JSON response that preserves the current course list result shape consumed by the frontend.
- R4. The courses page consumes the course service directly instead of self-fetching the API route.
- R5. The API route parses pagination and sort through `PaginationParamsDTO`, clamps page size, and allowlists course-list sort directions.

**Course service**

- R6. The course service owns construction of the Strapi course-list URL, including pagination, sort, fields, SEO populate, and teacher populate parameters previously embedded in the course helper.
- R7. The course service calls the existing Strapi fetch layer rather than duplicating low-level fetch, retry, timeout, logging, or JSON parsing behavior.
- R8. Course-list error behavior remains compatible with the current user-facing path: the courses page must still degrade to an empty list rather than crash on Strapi failure.
- R9. API route fallback responses must not be cacheable as successful durable course-list data.

**Compatibility**

- R10. Strapi backend logic is not changed for this exemplar.
- R11. The scope is limited to the course list operation; course detail, course slugs, and latest courses continue to use the existing helper path until a later migration.
- R12. Existing cache-tag behavior for course reads remains intentional and equivalent after the route/service split.

---

## Acceptance Examples

- AE1. Covers R1, R2, R3. Given an HTTP consumer requests the course-list API route, when Strapi returns courses, then the route responds with the same course list data shape used by the course catalog.
- AE2. Covers R4, R6, R7. Given a planner inspects the new boundary, then the server-rendered course page calls the course service directly, Strapi query construction is found in the course service, and low-level request execution still goes through the shared Strapi fetch layer.
- AE3. Covers R5. Given invalid pagination or sort query values reach the API route, then the controller normalizes or ignores them before the service builds the Strapi request.
- AE4. Covers R8, R9. Given Strapi is unavailable, when the courses page loads through the exemplar path, then the page does not crash, the course catalog receives an empty list, and the API fallback is not cacheable.
- AE5. Covers R10, R11. Given this exemplar is implemented, then Strapi backend route, controller, service, and schema files remain unchanged, and non-list course helpers keep their current behavior.

---

## Scope Boundaries

- Do not migrate `getCourseBySlug`, `getCourseSlugs`, or `getLatestCourses`.
- Do not introduce backend Strapi service, controller, or repository refactors.
- Do not introduce a generic proxy for every Strapi route.
- Do not change course page UI, Turkish copy, or navigation behavior unless a minimal call-site update is needed to consume the exemplar.
- Do not introduce repository abstractions until the service boundary has proved useful on this first route.

---

## Success Criteria

- SC1. A planner can use this document to produce a narrow implementation plan without deciding whether to migrate all course reads.
- SC2. The resulting exemplar makes the controller/service responsibility split obvious enough to copy for later frontend API routes.
- SC3. Existing course-list behavior remains equivalent from a user perspective.

---

## Sources / Research

- `frontend/src/lib/strapi-courses.ts` previously grouped course list, slug, detail, and latest-course reads in one helper module.
- `frontend/src/app/[locale]/egitimler/page.tsx` consumes the course list for the course catalog.
- `backend/src/api/course/content-types/course/schema.json` confirms the existing course fields and relations.
- `frontend/src/app/[locale]/api/registrations/register/route.ts` and sibling API routes show the existing Next.js route-handler proxy pattern.
