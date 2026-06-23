import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

/* ─── No Zod in strapi-client.ts ─── */

test("strapi-client.ts does not import Zod", () => {
  const source = readSource("lib/strapi-client.ts");
  assert.doesNotMatch(
    source,
    /import.*zod/,
    "strapi-client.ts should not import Zod"
  );
});

test("fetchStrapi does not accept a schema parameter", () => {
  const source = readSource("lib/strapi-client.ts");
  assert.doesNotMatch(
    source,
    /schema\?:\s*z\.ZodType/,
    "fetchStrapi should not accept a schema parameter"
  );
  assert.match(
    source,
    /async function fetchStrapi<T>\(path:\s*string,\s*options\?:\s*FetchStrapiOptions\):\s*Promise<T>/,
    "fetchStrapi should accept only path and optional options"
  );
});

test("fetchStrapi does not call schema.safeParse", () => {
  const source = readSource("lib/strapi-client.ts");
  assert.doesNotMatch(
    source,
    /schema\.safeParse\(/,
    "fetchStrapi should not call schema.safeParse"
  );
});

test("fetchStrapi returns as-cast JSON without validation", () => {
  const source = readSource("lib/strapi-client.ts");
  assert.match(
    source,
    /return \(await response\.json\(\)\) as T/,
    "fetchStrapi should return parsed JSON as T without validation"
  );
});

test("ErrorCategory does not include 'validation'", () => {
  const source = readSource("lib/strapi-client.ts");
  assert.match(
    source,
    /type ErrorCategory = "network" \| "http-4xx" \| "http-5xx" \| "parse"/,
    'ErrorCategory should not include "validation"'
  );
  assert.doesNotMatch(
    source,
    /'validation'/,
    "ErrorCategory should not include 'validation'"
  );
});

test("strapi-client.ts uses double quotes consistently", () => {
  const source = readSource("lib/strapi-client.ts");
  assert.doesNotMatch(
    source,
    /'http:\/\/127\.0\.0\.1:1337'/,
    "STRING_URL should use double quotes"
  );
  assert.doesNotMatch(
    source,
    /'no-store'/,
    "no-store should use double quotes"
  );
  assert.doesNotMatch(
    source,
    /'unknown'/,
    "unknown fallback should use double quotes"
  );
});

test("strapi-client.ts removes unnecessary optional chaining on controller.signal", () => {
  const source = readSource("lib/strapi-client.ts");
  assert.doesNotMatch(
    source,
    /controller\?\.signal/,
    "controller.signal should not use optional chaining"
  );
  assert.match(
    source,
    /controller\.signal/,
    "controller.signal should be accessed directly"
  );
});

test("strapi-client.ts does not spread fetchOptions unnecessarily", () => {
  const source = readSource("lib/strapi-client.ts");
  assert.doesNotMatch(
    source,
    /\.\.\.fetchOptions/,
    "should not spread fetchOptions"
  );
  assert.match(
    source,
    /fetch\(`\$\{STRAPI_URL\}\$\{path\}`, fetchOptions\)/,
    "should pass fetchOptions directly without spread"
  );
});

test("strapi-client.ts logs timeout errors before throwing", () => {
  const source = readSource("lib/strapi-client.ts");
  assert.match(
    source,
    /logError\(route,\s*endpoint,\s*undefined,\s*"network",\s*`Timeout after \$\{timeout\}ms`\)/,
    "should log network error before throwing timeout"
  );
});

/* ─── Domain modules do NOT import Zod schemas ─── */

test("strapi-courses.ts does not import Zod schemas", () => {
  const source = readSource("lib/strapi-courses.ts");
  assert.doesNotMatch(
    source,
    /StrapiListResponseSchema|StrapiCourseSchema/,
    "strapi-courses.ts should not import Zod schemas"
  );
});

test("getCourseList does not pass a schema argument", () => {
  const source = readSource("lib/course-service.ts");
  const getCourseListFn = source.substring(
    source.indexOf("export async function getCourseList")
  );
  assert.doesNotMatch(
    getCourseListFn,
    /StrapiListResponseSchema/,
    "getCourseList should not pass a schema"
  );
});

test("getCourseBySlug does not pass a schema argument", () => {
  const source = readSource("lib/strapi-courses.ts");
  const getCourseBySlugFn = source.substring(
    source.indexOf("export async function getCourseBySlug"),
    source.indexOf("export async function getLatestCourses")
  );
  assert.doesNotMatch(
    getCourseBySlugFn,
    /StrapiListResponseSchema/,
    "getCourseBySlug should not pass a schema"
  );
});

test("getLatestCourses does not pass a schema argument", () => {
  const source = readSource("lib/strapi-courses.ts");
  const getLatestCoursesFn = source.substring(
    source.indexOf("export async function getLatestCourses")
  );
  assert.doesNotMatch(
    getLatestCoursesFn,
    /StrapiListResponseSchema/,
    "getLatestCourses should not pass a schema"
  );
});

test("strapi-events.ts does not import Zod or Zod schemas", () => {
  const source = readSource("lib/strapi-events.ts");
  assert.doesNotMatch(
    source,
    /import.*zod/i,
    "strapi-events.ts should not import Zod"
  );
  assert.doesNotMatch(
    source,
    /StrapiListResponseSchema|StrapiEventSchema|EventRegistrationStatusSchema/,
    "strapi-events.ts should not import Zod schemas"
  );
});

test("getEvents does not pass a schema argument", () => {
  const source = readSource("lib/strapi-events.ts");
  const getEventsFn = source.substring(
    source.indexOf("export async function getEvents"),
    source.indexOf("export async function getEventSlugs")
  );
  assert.doesNotMatch(
    getEventsFn,
    /StrapiListResponseSchema/,
    "getEvents should not pass a schema"
  );
});

test("getEventBySlug does not pass a schema argument", () => {
  const source = readSource("lib/strapi-events.ts");
  const getEventBySlugFn = source.substring(
    source.indexOf("export async function getEventBySlug"),
    source.indexOf("export async function getEventRegistrationStatus")
  );
  assert.doesNotMatch(
    getEventBySlugFn,
    /StrapiListResponseSchema/,
    "getEventBySlug should not pass a schema"
  );
});

test("getEventRegistrationStatus does not pass an inline schema", () => {
  const source = readSource("lib/strapi-events.ts");
  const getStatusFn = source.substring(
    source.indexOf("export async function getEventRegistrationStatus")
  );
  assert.doesNotMatch(
    getStatusFn,
    /z\.object|EventRegistrationStatusSchema/,
    "getEventRegistrationStatus should not pass an inline Zod schema"
  );
});

test("strapi-blog.ts does not import Zod schemas", () => {
  const source = readSource("lib/strapi-blog.ts");
  assert.doesNotMatch(
    source,
    /StrapiListResponseSchema|StrapiBlogPostSchema/,
    "strapi-blog.ts should not import Zod schemas"
  );
});

test("getBlogPosts does not pass a schema argument", () => {
  const source = readSource("lib/strapi-blog.ts");
  const getFn = source.substring(
    source.indexOf("export async function getBlogPosts"),
    source.indexOf("export async function getBlogPostSlugs")
  );
  assert.doesNotMatch(
    getFn,
    /StrapiListResponseSchema/,
    "getBlogPosts should not pass a schema"
  );
});

test("getBlogPostBySlug does not pass a schema argument", () => {
  const source = readSource("lib/strapi-blog.ts");
  const getFn = source.substring(
    source.indexOf("export async function getBlogPostBySlug")
  );
  assert.doesNotMatch(
    getFn,
    /StrapiListResponseSchema/,
    "getBlogPostBySlug should not pass a schema"
  );
});

test("strapi-teachers.ts does not import Zod schemas", () => {
  const source = readSource("lib/strapi-teachers.ts");
  assert.doesNotMatch(
    source,
    /StrapiListResponseSchema|StrapiTeacherSchema/,
    "strapi-teachers.ts should not import Zod schemas"
  );
});

test("getTeachers does not pass a schema argument", () => {
  const source = readSource("lib/strapi-teachers.ts");
  const getFn = source.substring(
    source.indexOf("export async function getTeachers"),
    source.indexOf("export async function getTeacherSlugs")
  );
  assert.doesNotMatch(
    getFn,
    /StrapiListResponseSchema/,
    "getTeachers should not pass a schema"
  );
});

test("getTeacherBySlug does not pass a schema argument", () => {
  const source = readSource("lib/strapi-teachers.ts");
  const getFn = source.substring(
    source.indexOf("export async function getTeacherBySlug")
  );
  assert.doesNotMatch(
    getFn,
    /StrapiListResponseSchema/,
    "getTeacherBySlug should not pass a schema"
  );
});

/* ─── Slug functions still do NOT pass schemas ─── */

test("getCourseSlugs does not pass a schema (slug-only query)", () => {
  const source = readSource("lib/strapi-courses.ts");
  const getFn = source.substring(
    source.indexOf("export async function getCourseSlugs"),
    source.indexOf("export async function getCourseBySlug")
  );
  assert.doesNotMatch(
    getFn,
    /StrapiListResponseSchema/,
    "getCourseSlugs should not pass a schema"
  );
});

test("getEventSlugs does not pass a schema (slug-only query)", () => {
  const source = readSource("lib/strapi-events.ts");
  const getFn = source.substring(
    source.indexOf("export async function getEventSlugs"),
    source.indexOf("export async function getEventBySlug")
  );
  assert.doesNotMatch(
    getFn,
    /StrapiListResponseSchema/,
    "getEventSlugs should not pass a schema"
  );
});

test("getBlogPostSlugs does not pass a schema (slug-only query)", () => {
  const source = readSource("lib/strapi-blog.ts");
  const getFn = source.substring(
    source.indexOf("export async function getBlogPostSlugs"),
    source.indexOf("export async function getBlogPostBySlug")
  );
  assert.doesNotMatch(
    getFn,
    /StrapiListResponseSchema/,
    "getBlogPostSlugs should not pass a schema"
  );
});

test("getTeacherSlugs does not pass a schema (slug-only query)", () => {
  const source = readSource("lib/strapi-teachers.ts");
  const getFn = source.substring(
    source.indexOf("export async function getTeacherSlugs"),
    source.indexOf("export async function getTeacherBySlug")
  );
  assert.doesNotMatch(
    getFn,
    /StrapiListResponseSchema/,
    "getTeacherSlugs should not pass a schema"
  );
});

/* ─── strapi-types.ts has no Zod schemas ─── */

test("strapi-types.ts does not import Zod", () => {
  const source = readSource("lib/strapi-types.ts");
  assert.doesNotMatch(
    source,
    /import.*zod/,
    "strapi-types.ts should not import Zod"
  );
});

test("strapi-types.ts has no Zod schema exports", () => {
  const source = readSource("lib/strapi-types.ts");
  assert.doesNotMatch(
    source,
    /export const StrapiCourseSchema|export const StrapiEventSchema|export const StrapiBlogPostSchema|export const StrapiTeacherSchema|export const StrapiMediaSchema|export const EventRegistrationStatusSchema|export function StrapiListResponseSchema/,
    "strapi-types.ts should not export Zod schemas"
  );
});

test("strapi-types.ts still exports TypeScript types", () => {
  const source = readSource("lib/strapi-types.ts");
  assert.match(
    source,
    /export type StrapiCourse/,
    "strapi-types.ts should still export StrapiCourse type"
  );
  assert.match(
    source,
    /export type StrapiEvent\b/,
    "strapi-types.ts should still export StrapiEvent type"
  );
  assert.match(
    source,
    /export type StrapiBlogPost/,
    "strapi-types.ts should still export StrapiBlogPost type"
  );
  assert.match(
    source,
    /export type StrapiTeacher/,
    "strapi-types.ts should still export StrapiTeacher type"
  );
  assert.match(
    source,
    /export type StrapiMedia\b/,
    "strapi-types.ts should still export StrapiMedia type"
  );
  assert.match(
    source,
    /export type EventRegistrationStatus/,
    "strapi-types.ts should still export EventRegistrationStatus type"
  );
  assert.match(
    source,
    /export type StrapiListResponse/,
    "strapi-types.ts should still export StrapiListResponse type"
  );
});

/* ─── Error path: try/catch still returns fallback ─── */

test("course page returns empty array fallback on service failure", () => {
  const source = readSource("app/[locale]/egitimler/page.tsx");
  assert.match(
    source,
    /let courses:[\s\S]*?= \[\][\s\S]*?catch\s*\(/,
    "course page should render an empty list on service failure"
  );
});

test("getCourseBySlug returns null on catch", () => {
  const source = readSource("lib/strapi-courses.ts");
  const getFn = source.substring(
    source.indexOf("export async function getCourseBySlug"),
    source.indexOf("export async function getLatestCourses")
  );
  assert.match(
    getFn,
    /catch\s*\([\s\S]*?return null/,
    "getCourseBySlug should return null on error"
  );
});

test("getEvents returns empty array on catch", () => {
  const source = readSource("lib/strapi-events.ts");
  const getFn = source.substring(
    source.indexOf("export async function getEvents"),
    source.indexOf("export async function getEventSlugs")
  );
  assert.match(
    getFn,
    /catch\s*\([\s\S]*?return \[\]/,
    "getEvents should return [] on error"
  );
});

test("getEventRegistrationStatus returns null on catch", () => {
  const source = readSource("lib/strapi-events.ts");
  const getFn = source.substring(
    source.indexOf("export async function getEventRegistrationStatus")
  );
  assert.match(
    getFn,
    /catch\s*\([\s\S]*?return null/,
    "getEventRegistrationStatus should return null on error"
  );
});

test("getBlogPosts returns empty array on catch", () => {
  const source = readSource("lib/strapi-blog.ts");
  const getFn = source.substring(
    source.indexOf("export async function getBlogPosts"),
    source.indexOf("export async function getBlogPostSlugs")
  );
  assert.match(
    getFn,
    /catch\s*\([\s\S]*?return \[\]/,
    "getBlogPosts should return [] on error"
  );
});

test("getTeachers returns empty array on catch", () => {
  const source = readSource("lib/strapi-teachers.ts");
  const getFn = source.substring(
    source.indexOf("export async function getTeachers"),
    source.indexOf("export async function getTeacherSlugs")
  );
  assert.match(
    getFn,
    /catch\s*\([\s\S]*?return \[\]/,
    "getTeachers should return [] on error"
  );
});

/* ─── Part 2: Payload size optimizations ─── */

test("getEvents list query does not fetch 'details' rich text field", () => {
  const source = readSource("lib/strapi-events.ts");
  const getEventsFn = source.substring(
    source.indexOf("export async function getEvents"),
    source.indexOf("export async function getEventSlugs")
  );
  assert.doesNotMatch(
    getEventsFn,
    /fields\[\d+\]=details/,
    "getEvents should not fetch 'details' field on list query"
  );
});

test("getEventBySlug detail query does fetch 'details' rich text field", () => {
  const source = readSource("lib/strapi-events.ts");
  const getEventBySlugFn = source.substring(
    source.indexOf("export async function getEventBySlug"),
    source.indexOf("export async function getEventRegistrationStatus")
  );
  assert.match(
    getEventBySlugFn,
    /fields\[\d+\]=details/,
    "getEventBySlug should still fetch 'details' on detail query"
  );
});

/* ─── Caching: force-cache is the default ─── */

test("strapi-client.ts defaults to force-cache instead of no-store", () => {
  const source = readSource("lib/strapi-client.ts");
  assert.doesNotMatch(
    source,
    /fetchOptions\.cache\s*=\s*"no-store"/,
    "strapi-client should not default every request to no-store"
  );
  assert.match(
    source,
    /fetchOptions\.cache\s*=\s*isDraftMode\s*\?\s*"no-store"\s*:\s*"force-cache"/,
    "strapi-client should use force-cache by default and no-store only for draft mode"
  );
  assert.match(
    source,
    /"force-cache"/,
    "strapi-client should contain force-cache"
  );
});

test("getCourseList uses next.tags for on-demand revalidation", () => {
  const source = readSource("lib/course-service.ts");
  assert.match(
    source,
    /tags:\s*\[\s*COURSES_TAG\s*\]/,
    "getCourseList should use next.tags with COURSES_TAG"
  );
});

test("getEvents uses next.tags for on-demand revalidation", () => {
  const source = readSource("lib/strapi-events.ts");
  const getEventsFn = source.substring(
    source.indexOf("export async function getEvents"),
    source.indexOf("export async function getEventSlugs")
  );
  assert.match(
    getEventsFn,
    /tags:\s*\[\s*EVENTS_TAG\s*\]/,
    "getEvents should use next.tags with EVENTS_TAG"
  );
});

test("getBlogPosts uses next.tags for on-demand revalidation", () => {
  const source = readSource("lib/strapi-blog.ts");
  const getFn = source.substring(
    source.indexOf("export async function getBlogPosts"),
    source.indexOf("export async function getBlogPostSlugs")
  );
  assert.match(
    getFn,
    /tags:\s*\[\s*BLOG_TAG\s*\]/,
    "getBlogPosts should use next.tags with BLOG_TAG"
  );
});

test("getTeachers uses next.tags for on-demand revalidation", () => {
  const source = readSource("lib/strapi-teachers.ts");
  const getFn = source.substring(
    source.indexOf("export async function getTeachers"),
    source.indexOf("export async function getTeacherSlugs")
  );
  assert.match(
    getFn,
    /tags:\s*\[\s*TEACHERS_TAG\s*\]/,
    "getTeachers should use next.tags with TEACHERS_TAG"
  );
});

test("getEventRegistrationStatus uses no-store (time-sensitive)", () => {
  const source = readSource("lib/strapi-events.ts");
  const getFn = source.substring(
    source.indexOf("export async function getEventRegistrationStatus")
  );
  assert.match(
    getFn,
    /cache:\s*"no-store"/,
    "getEventRegistrationStatus should use no-store for time-sensitive freshness"
  );
});

test("getEvents does not use conflicting revalidate + force-cache", () => {
  const source = readSource("lib/strapi-events.ts");
  const getEventsFn = source.substring(
    source.indexOf("export async function getEvents"),
    source.indexOf("export async function getEventSlugs")
  );
  assert.doesNotMatch(
    getEventsFn,
    /revalidate/,
    "getEvents should not use time-based revalidate (tags handle invalidation)"
  );
});

test("Egitions list page has no revalidate or dynamic export", () => {
  const source = readSource("app/[locale]/egitimler/page.tsx");
  assert.doesNotMatch(
    source,
    /export const (revalidate|dynamic)/,
    "egitimler list page should be fully static"
  );
});

test("Teachers list page has no dynamic export (was force-dynamic)", () => {
  const source = readSource("app/[locale]/egitmenler/page.tsx");
  assert.doesNotMatch(
    source,
    /export const (revalidate|dynamic)/,
    "egitmenler list page should be fully static"
  );
});

test("Revalidation API route exists", () => {
  const source = readSource("app/api/revalidate/route.ts");
  assert.match(
    source,
    /revalidateTag/,
    "revalidation route should call revalidateTag"
  );
  assert.match(
    source,
    /x-revalidate-secret/,
    "revalidation route should verify secret header"
  );
  assert.match(
    source,
    /VALID_TAGS/,
    "revalidation route should whitelist tags"
  );
});
