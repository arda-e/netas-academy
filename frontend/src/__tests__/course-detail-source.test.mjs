import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Course detail imports the related sessions section", () => {
  const source = readSource("app/[locale]/egitimler/[slug]/page.tsx");
  assert.match(
    source,
    /import\s*\{\s*CourseRelatedSessionsSection\s*\}\s*from\s*"@\/components\/courses\/course-related-sessions-section"/,
    "Course detail page should import the extracted related sessions section"
  );
});

test("Course detail no longer computes upcoming and past inline", () => {
  const source = readSource("app/[locale]/egitimler/[slug]/page.tsx");
  assert.doesNotMatch(source, /const\s+upcoming\s*=/);
  assert.doesNotMatch(source, /const\s+past\s*=/);
});

test("Course detail passes the current timestamp into the section", () => {
  const source = readSource("app/[locale]/egitimler/[slug]/page.tsx");
  assert.match(source, /now=\{new Date\(\)\}/);
});
