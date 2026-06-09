import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

/* ─── strapi-client.ts logging tests ─── */

test("strapi-client defines logError helper with structured JSON shape", () => {
  const source = readSource("lib/strapi-client.ts");

  assert.match(
    source,
    /console\.error\(JSON\.stringify\(\{[\s\S]*route[\s\S]*endpoint[\s\S]*status[\s\S]*errorCategory[\s\S]*message/,
    "strapi-client should define logError with route, endpoint, status, errorCategory, message fields"
  );
});

test("strapi-client logs network errors with category 'network'", () => {
  const source = readSource("lib/strapi-client.ts");

  assert.match(
    source,
    /errorCategory.*'network'/s,
    "strapi-client should log network fetch failures with errorCategory 'network'"
  );
});

test("strapi-client logs HTTP 4xx errors with category 'http-4xx'", () => {
  const source = readSource("lib/strapi-client.ts");

  assert.match(
    source,
    /errorCategory.*'http-4xx'/s,
    "strapi-client should log HTTP 4xx errors with errorCategory 'http-4xx'"
  );
});

test("strapi-client logs HTTP 5xx errors with category 'http-5xx'", () => {
  const source = readSource("lib/strapi-client.ts");

  assert.match(
    source,
    /errorCategory.*'http-5xx'/s,
    "strapi-client should log HTTP 5xx errors with errorCategory 'http-5xx'"
  );
});

test("strapi-client logs JSON parse errors with category 'parse'", () => {
  const source = readSource("lib/strapi-client.ts");

  assert.match(
    source,
    /errorCategory.*'parse'/s,
    "strapi-client should log JSON parse errors with errorCategory 'parse'"
  );
});

test("strapi-client logs validation errors with category 'validation'", () => {
  const source = readSource("lib/strapi-client.ts");

  assert.match(
    source,
    /errorCategory.*'validation'/s,
    "strapi-client should log validation errors with errorCategory 'validation'"
  );
});

test("strapi-client extractRoute derives route from path after /api/", () => {
  const source = readSource("lib/strapi-client.ts");

  assert.match(
    source,
    /function extractRoute/,
    "strapi-client should define extractRoute function"
  );

  assert.match(
    source,
    /segments\[1\]/,
    "extractRoute should use the segment after /api/ as the route key"
  );
});

test("strapi-client logging does not reference request bodies, auth headers, cookies", () => {
  const source = readSource("lib/strapi-client.ts");

  const loggingSection = source.match(
    /function logError[\s\S]*?^}/m
  );
  assert.ok(loggingSection, "logError function should exist");

  assert.doesNotMatch(
    loggingSection[0],
    /\b(body|requestBody|payload)\b/,
    "logError should not log request bodies"
  );

  assert.doesNotMatch(
    loggingSection[0],
    /\b(auth|authorization|token|cookie)\b/i,
    "logError should not log auth headers or cookies"
  );

  assert.doesNotMatch(
    loggingSection[0],
    /\b(email|phone|tckn)\b/i,
    "logError should not log emails, phone numbers, or TCKN"
  );
});

/* ─── Domain module logging tests ─── */

test("courses route logs controller errors", () => {
  const source = readSource("app/[locale]/api/courses/route.ts");

  assert.match(
    source,
    /route:\s*"courses"[\s\S]*errorCategory:\s*"controller"/,
    "courses route should log route and controller category"
  );
});

test("strapi-courses logs errors in all 3 remaining helper functions", () => {
  const source = readSource("lib/strapi-courses.ts");

  const catchLogs = source.match(/console\.error\(JSON\.stringify/g);
  assert.ok(catchLogs, "strapi-courses should contain console.error calls");
  assert.equal(
    catchLogs.length,
    3,
    "strapi-courses should log errors in getCourseSlugs, getCourseBySlug, and getLatestCourses"
  );
});

test("strapi-events logs errors in all fetch functions", () => {
  const source = readSource("lib/strapi-events.ts");

  const catchLogs = source.match(/console\.error\(JSON\.stringify/g);
  assert.ok(catchLogs, "strapi-events should contain console.error calls");
  assert.equal(
    catchLogs.length,
    4,
    "strapi-events should log errors in 4 fetch functions (getEvents, getEventSlugs, getEventBySlug, getEventRegistrationStatus)"
  );
});

test("strapi-events getEvents logs domain 'events' and function 'getEvents'", () => {
  const source = readSource("lib/strapi-events.ts");

  assert.match(
    source,
    /catch[\s\S]*?domain.*'events'[\s\S]*?function.*'getEvents'/,
    "getEvents catch block should log domain and function name"
  );
});

test("strapi-events getEventRegistrationStatus logs on failure", () => {
  const source = readSource("lib/strapi-events.ts");

  assert.match(
    source,
    /domain.*'events'[\s\S]*function.*'getEventRegistrationStatus'/,
    "getEventRegistrationStatus catch block should log domain and function name"
  );
});

test("strapi-blog logs errors in all 3 functions", () => {
  const source = readSource("lib/strapi-blog.ts");

  const catchLogs = source.match(/console\.error\(JSON\.stringify/g);
  assert.ok(catchLogs, "strapi-blog should contain console.error calls");
  assert.equal(
    catchLogs.length,
    3,
    "strapi-blog should log errors in all 3 functions"
  );
});

test("strapi-blog getBlogPostBySlug logs domain 'blog' and function 'getBlogPostBySlug'", () => {
  const source = readSource("lib/strapi-blog.ts");

  assert.match(
    source,
    /domain.*'blog'[\s\S]*function.*'getBlogPostBySlug'/,
    "getBlogPostBySlug catch block should log domain and function name"
  );
});

test("strapi-teachers logs errors in all 3 functions", () => {
  const source = readSource("lib/strapi-teachers.ts");

  const catchLogs = source.match(/console\.error\(JSON\.stringify/g);
  assert.ok(catchLogs, "strapi-teachers should contain console.error calls");
  assert.equal(
    catchLogs.length,
    3,
    "strapi-teachers should log errors in all 3 functions"
  );
});

test("strapi-teachers getTeacherBySlug logs domain 'teachers' and function 'getTeacherBySlug'", () => {
  const source = readSource("lib/strapi-teachers.ts");

  assert.match(
    source,
    /domain.*'teachers'[\s\S]*function.*'getTeacherBySlug'/,
    "getTeacherBySlug catch block should log domain and function name"
  );
});

/* ─── Redaction contract tests ─── */

test("domain modules do not log user PII (email, phone, TCKN) in catch blocks", () => {
  const files = [
    "lib/strapi-courses.ts",
    "lib/strapi-events.ts",
    "lib/strapi-blog.ts",
    "lib/strapi-teachers.ts",
  ];

  for (const file of files) {
    const source = readSource(file);

    const catchBlocks = source.match(/catch[\s\S]*?console\.error\(JSON\.stringify\([\s\S]*?\)\)/g);
    if (!catchBlocks) continue;

    for (const block of catchBlocks) {
      assert.doesNotMatch(
        block,
        /\b(email|phone|tckn|tc_no|kimlik)\b/i,
        `${file} catch block should not log PII fields`
      );
    }
  }
});

test("domain modules always return default values ([] or null) in catch blocks", () => {
  const files = [
    "lib/strapi-courses.ts",
    "lib/strapi-events.ts",
    "lib/strapi-blog.ts",
    "lib/strapi-teachers.ts",
  ];

  for (const file of files) {
    const source = readSource(file);
    assert.match(
      source,
      /catch[\s\S]*?return\s+(?:\[\]|null)/,
      `${file} should return [] or null in catch blocks`
    );
  }
});

test("logging uses Error instance for safe message extraction", () => {
  const domainFiles = [
    "lib/strapi-courses.ts",
    "lib/strapi-events.ts",
    "lib/strapi-blog.ts",
    "lib/strapi-teachers.ts",
  ];

  for (const file of domainFiles) {
    const source = readSource(file);
    assert.match(
      source,
      /error instanceof Error/,
      `${file} should use error instanceof Error for safe message extraction`
    );
  }
});
