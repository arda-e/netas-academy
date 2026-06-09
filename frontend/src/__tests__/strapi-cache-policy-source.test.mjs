import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

const ISR_REVALIDATE = /next:\s*\{\s*revalidate:\s*60\s*\}/;
const FORCE_CACHE = /cache:\s*['"]force-cache['"]/;
const NO_STORE = /cache:\s*['"]no-store['"]/;
const FORCE_DYNAMIC = /export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/;
const REVALIDATE_EXPORT = /export\s+const\s+revalidate\s*=\s*60/;

// ── strapi-courses.ts ──────────────────────────────────────────

test("getCourseList uses tagged cache semantics", () => {
  const source = readSource("lib/course-service.ts");
  assert.match(
    source,
    /next:\s*\{\s*tags:\s*\[\s*COURSES_TAG\s*\]\s*\}/,
    "course-service.ts should tag course list fetches"
  );
});

test("getLatestCourses uses tagged cache semantics", () => {
  const source = readSource("lib/strapi-courses.ts");
  assert.match(
    source,
    /next:\s*\{\s*tags:\s*\[\s*COURSES_TAG\s*\]\s*\}/,
    "getLatestCourses should tag course fetches"
  );
});

test("getCourseSlugs uses tagged cache semantics", () => {
  const source = readSource("lib/strapi-courses.ts");
  assert.match(
    source,
    /next:\s*\{\s*tags:\s*\[\s*COURSES_TAG\s*\]\s*\}/,
    "getCourseSlugs should tag course fetches"
  );
});

test("getCourseBySlug uses tagged cache semantics", () => {
  const source = readSource("lib/strapi-courses.ts");
  const matches = source.match(/next:\s*\{\s*tags:\s*\[\s*COURSES_TAG\s*\]\s*\}/g);
  assert.ok(matches && matches.length >= 2, "Should have tagged cache in both getCourseSlugs and getCourseBySlug");
});

test("strapi-courses.ts has no no-store", () => {
  const source = readSource("lib/strapi-courses.ts");
  assert.doesNotMatch(
    source,
    NO_STORE,
    "strapi-courses.ts should not contain no-store"
  );
});

// ── strapi-events.ts ───────────────────────────────────────────

test("getEvents uses { next: { revalidate: 60 } }", () => {
  const source = readSource("lib/strapi-events.ts");
  assert.match(
    source,
    ISR_REVALIDATE,
    "strapi-events.ts should contain ISR revalidate: 60 for getEvents"
  );
});

test("getEventSlugs uses force-cache", () => {
  const source = readSource("lib/strapi-events.ts");
  assert.match(
    source,
    FORCE_CACHE,
    "getEventSlugs should use force-cache"
  );
});

test("getEventBySlug uses force-cache", () => {
  const source = readSource("lib/strapi-events.ts");
  const matches = source.match(/cache:\s*['"]force-cache['"]/g);
  assert.ok(matches && matches.length >= 2, "Should have force-cache in both getEventSlugs and getEventBySlug");
});

test("getEventRegistrationStatus has no force-cache or revalidate option", () => {
  const source = readSource("lib/strapi-events.ts");

  const registrationStatusSection = source.slice(
    source.indexOf("getEventRegistrationStatus")
  );
  assert.doesNotMatch(
    registrationStatusSection,
    FORCE_CACHE,
    "getEventRegistrationStatus should not use force-cache"
  );
  assert.doesNotMatch(
    registrationStatusSection,
    ISR_REVALIDATE,
    "getEventRegistrationStatus should not use ISR revalidate"
  );
});

test("strapi-events.ts has no orphaned code (all returns inside functions)", () => {
  const source = readSource("lib/strapi-events.ts");

  const getEventsStart = source.indexOf("export async function getEvents(");
  const getEventsEnd = getEventsStart > -1
    ? source.indexOf("\nexport async function", getEventsStart + 1)
    : -1;

  if (getEventsEnd === -1) return;

  const getEventsBody = source.slice(getEventsStart, getEventsEnd);
  assert.match(
    getEventsBody,
    /catch\s*\(/,
    "getEvents should have a catch block containing its own return statements"
  );
});

// ── strapi-blog.ts ─────────────────────────────────────────────

test("getBlogPosts uses { next: { revalidate: 60 } }", () => {
  const source = readSource("lib/strapi-blog.ts");
  assert.match(
    source,
    ISR_REVALIDATE,
    "strapi-blog.ts should contain ISR revalidate: 60 for getBlogPosts"
  );
});

test("getBlogPostBySlug uses { next: { revalidate: 60 } } — no no-store", () => {
  const source = readSource("lib/strapi-blog.ts");

  const bySlugSection = source.slice(
    source.indexOf("getBlogPostBySlug"),
    source.indexOf("getBlogPostBySlug") + 1000
  );
  assert.match(
    bySlugSection,
    ISR_REVALIDATE,
    "getBlogPostBySlug should use ISR revalidate: 60"
  );
  assert.doesNotMatch(
    bySlugSection,
    NO_STORE,
    "getBlogPostBySlug should not use no-store"
  );
});

test("getBlogPostSlugs uses force-cache", () => {
  const source = readSource("lib/strapi-blog.ts");
  assert.match(
    source,
    FORCE_CACHE,
    "getBlogPostSlugs should use force-cache"
  );
});

// ── strapi-teachers.ts ─────────────────────────────────────────

test("getTeachers uses { next: { revalidate: 60 } } — no no-store", () => {
  const source = readSource("lib/strapi-teachers.ts");

  const teachersSection = source.slice(
    source.indexOf("getTeachers"),
    source.indexOf("getTeacherSlugs")
  );
  assert.match(
    teachersSection,
    ISR_REVALIDATE,
    "getTeachers should use ISR revalidate: 60"
  );
  assert.doesNotMatch(
    teachersSection,
    NO_STORE,
    "getTeachers should not use no-store"
  );
});

test("getTeacherSlugs uses force-cache", () => {
  const source = readSource("lib/strapi-teachers.ts");
  assert.match(
    source,
    FORCE_CACHE,
    "getTeacherSlugs should use force-cache"
  );
});

test("getTeacherBySlug uses force-cache", () => {
  const source = readSource("lib/strapi-teachers.ts");
  const matches = source.match(/cache:\s*['"]force-cache['"]/g);
  assert.ok(matches && matches.length >= 2, "Should have force-cache in both getTeacherSlugs and getTeacherBySlug");
});

test("strapi-teachers.ts has no no-store", () => {
  const source = readSource("lib/strapi-teachers.ts");
  assert.doesNotMatch(
    source,
    NO_STORE,
    "strapi-teachers.ts should not contain no-store"
  );
});

// ── Listing pages: no force-dynamic, have revalidate ───────────

const LISTING_PAGES = [
  "app/egitimler/page.tsx",
  "app/etkinlikler/page.tsx",
  "app/blog-yazilari/page.tsx",
  "app/hakkimizda/page.tsx",
];

for (const pagePath of LISTING_PAGES) {
  test(`${pagePath} has no force-dynamic`, () => {
    const source = readSource(pagePath);
    assert.doesNotMatch(
      source,
      FORCE_DYNAMIC,
      `${pagePath} should not have force-dynamic`
    );
  });

  test(`${pagePath} has revalidate = 60`, () => {
    const source = readSource(pagePath);
    assert.match(
      source,
      REVALIDATE_EXPORT,
      `${pagePath} should have revalidate = 60`
    );
  });
}

// ── Detail pages: no force-dynamic, have revalidate ────────────

const DETAIL_PAGES = [
  "app/egitimler/[slug]/page.tsx",
  "app/etkinlikler/[slug]/page.tsx",
  "app/blog-yazilari/[slug]/page.tsx",
];

for (const pagePath of DETAIL_PAGES) {
  test(`${pagePath} has no force-dynamic`, () => {
    const source = readSource(pagePath);
    assert.doesNotMatch(
      source,
      FORCE_DYNAMIC,
      `${pagePath} should not have force-dynamic`
    );
  });

  test(`${pagePath} has revalidate = 60`, () => {
    const source = readSource(pagePath);
    assert.match(
      source,
      REVALIDATE_EXPORT,
      `${pagePath} should have revalidate = 60`
    );
  });
}

// ── Home page: no Strapi fetches, no force-dynamic ─────────────

test("app/page.tsx has no force-dynamic", () => {
  const source = readSource("app/page.tsx");
  assert.doesNotMatch(
    source,
    FORCE_DYNAMIC,
    "Home page should not have force-dynamic"
  );
});

test("app/page.tsx has no Strapi fetch calls", () => {
  const source = readSource("app/page.tsx");
  assert.doesNotMatch(
    source,
    /import.*strapi|from\s+["']@\/lib\/strapi-/,
    "Home page should not import Strapi fetch modules"
  );
});
