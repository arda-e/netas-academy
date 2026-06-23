import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

const NO_STORE = /cache:\s*['"]no-store['"]/;
const FORCE_DYNAMIC = /export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/;

const taggedCache = (tagName) =>
  new RegExp(`next:\\s*\\{\\s*tags:\\s*\\[\\s*${tagName}\\s*\\]\\s*\\}`);

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

test("getEvents uses tagged cache semantics", () => {
  const source = readSource("lib/strapi-events.ts");
  assert.match(
    source,
    taggedCache("EVENTS_TAG"),
    "getEvents should tag event fetches"
  );
});

test("getEventSlugs uses tagged cache semantics", () => {
  const source = readSource("lib/strapi-events.ts");
  assert.match(
    source,
    taggedCache("EVENTS_TAG"),
    "getEventSlugs should tag event fetches"
  );
});

test("getEventBySlug uses tagged cache semantics", () => {
  const source = readSource("lib/strapi-events.ts");
  const matches = source.match(taggedCache("EVENTS_TAG"));
  assert.ok(matches, "getEventBySlug should tag event fetches");
});

test("getEventRegistrationStatus uses no-store for freshness", () => {
  const source = readSource("lib/strapi-events.ts");

  const registrationStatusSection = source.slice(
    source.indexOf("getEventRegistrationStatus")
  );
  assert.match(
    registrationStatusSection,
    NO_STORE,
    "getEventRegistrationStatus should use no-store"
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

test("getBlogPosts uses tagged cache semantics", () => {
  const source = readSource("lib/strapi-blog.ts");
  assert.match(
    source,
    taggedCache("BLOG_TAG"),
    "getBlogPosts should tag blog fetches"
  );
});

test("getBlogPostBySlug uses tagged cache semantics outside draft mode", () => {
  const source = readSource("lib/strapi-blog.ts");

  const bySlugSection = source.slice(
    source.indexOf("getBlogPostBySlug"),
    source.indexOf("export async function getRelatedBlogPosts")
  );
  assert.match(
    bySlugSection,
    taggedCache("BLOG_TAG"),
    "getBlogPostBySlug should tag blog fetches outside draft mode"
  );
});

test("getBlogPostSlugs uses tagged cache semantics", () => {
  const source = readSource("lib/strapi-blog.ts");
  assert.match(
    source,
    taggedCache("BLOG_TAG"),
    "getBlogPostSlugs should tag blog fetches"
  );
});

// ── strapi-teachers.ts ─────────────────────────────────────────

test("getTeachers uses tagged cache semantics", () => {
  const source = readSource("lib/strapi-teachers.ts");

  const teachersSection = source.slice(
    source.indexOf("getTeachers"),
    source.indexOf("getTeacherSlugs")
  );
  assert.match(
    teachersSection,
    taggedCache("TEACHERS_TAG"),
    "getTeachers should tag teacher fetches"
  );
  assert.doesNotMatch(
    teachersSection,
    NO_STORE,
    "getTeachers should not use no-store"
  );
});

test("getTeacherSlugs uses tagged cache semantics", () => {
  const source = readSource("lib/strapi-teachers.ts");
  assert.match(
    source,
    taggedCache("TEACHERS_TAG"),
    "getTeacherSlugs should tag teacher fetches"
  );
});

test("getTeacherBySlug uses tagged cache semantics", () => {
  const source = readSource("lib/strapi-teachers.ts");
  const matches = source.match(taggedCache("TEACHERS_TAG"));
  assert.ok(matches, "getTeacherBySlug should tag teacher fetches");
});

test("strapi-teachers.ts has no no-store", () => {
  const source = readSource("lib/strapi-teachers.ts");
  assert.doesNotMatch(
    source,
    NO_STORE,
    "strapi-teachers.ts should not contain no-store"
  );
});

// ── Listing pages: no force-dynamic ────────────────────────────

const LISTING_PAGES = [
  "app/[locale]/egitimler/page.tsx",
  "app/[locale]/etkinlikler/page.tsx",
  "app/[locale]/blog-yazilari/page.tsx",
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
}

// ── Detail pages: no force-dynamic ─────────────────────────────

const DETAIL_PAGES = [
  "app/[locale]/egitimler/[slug]/page.tsx",
  "app/[locale]/etkinlikler/[slug]/page.tsx",
  "app/[locale]/blog-yazilari/[slug]/page.tsx",
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
}

// ── Home page: no Strapi fetches, no force-dynamic ─────────────

test("app/page.tsx has no force-dynamic", () => {
  const source = readSource("app/[locale]/page.tsx");
  assert.doesNotMatch(
    source,
    FORCE_DYNAMIC,
    "Home page should not have force-dynamic"
  );
});

test("root app/page.tsx has no Strapi fetch calls", () => {
  const source = readSource("app/page.tsx");
  assert.doesNotMatch(
    source,
    /import.*strapi|from\s+["']@\/lib\/strapi-/,
    "Root locale redirect page should not import Strapi fetch modules"
  );
});
