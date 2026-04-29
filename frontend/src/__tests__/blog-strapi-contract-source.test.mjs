import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("StrapiBlogPost type includes author with displayName, slug, role, shortBio", () => {
  const source = readSource("lib/strapi.ts");

  assert.match(
    source,
    /author\?:\s*\{[\s\S]*displayName:\s*string[\s\S]*slug:\s*string[\s\S]*role\?:\s*string[\s\S]*shortBio\?:\s*string/,
    "StrapiBlogPost should include author with displayName, slug, role, shortBio"
  );
});

test("StrapiBlogPost type includes publishedDate", () => {
  const source = readSource("lib/strapi.ts");

  assert.match(
    source,
    /publishedDate\?:\s*string\s*\|\s*null/,
    "StrapiBlogPost should include publishedDate field"
  );
});

test("StrapiBlogPost type includes sourceNotes", () => {
  const source = readSource("lib/strapi.ts");

  assert.match(
    source,
    /sourceNotes\?:\s*string\s*\|\s*null/,
    "StrapiBlogPost should include sourceNotes field"
  );
});

test("StrapiBlogPost type includes coverImage", () => {
  const source = readSource("lib/strapi.ts");

  assert.match(
    source,
    /coverImage\?:\s*StrapiMedia\s*\|\s*null/,
    "StrapiBlogPost should include coverImage field"
  );
});

test("getBlogPosts sorts by publishedDate:desc", () => {
  const source = readSource("lib/strapi.ts");

  assert.match(
    source,
    /sort\[0\]=publishedDate:desc/,
    "getBlogPosts should sort by publishedDate:desc"
  );
});

test("getBlogPosts populates author with displayName, slug, role", () => {
  const source = readSource("lib/strapi.ts");

  const populateAuthorRegex =
    /populate\[author\]\[fields\]\[0\]=displayName&populate\[author\]\[fields\]\[1\]=slug&populate\[author\]\[fields\]\[2\]=role/;

  assert.match(
    source,
    populateAuthorRegex,
    "getBlogPosts should populate author with displayName, slug, role"
  );
});

test("getBlogPosts populates coverImage", () => {
  const source = readSource("lib/strapi.ts");

  assert.match(
    source,
    /populate\[coverImage\]/,
    "getBlogPosts should populate coverImage"
  );
});

test("getBlogPostBySlug includes fields for publishedDate and sourceNotes", () => {
  const source = readSource("lib/strapi.ts");

  assert.match(
    source,
    /fields\[4\]=publishedDate&fields\[5\]=sourceNotes/,
    "getBlogPostBySlug should request publishedDate and sourceNotes fields"
  );
});

test("getBlogPostBySlug populates author with shortBio", () => {
  const source = readSource("lib/strapi.ts");

  const populateAuthorRegex =
    /populate\[author\]\[fields\]\[3\]=shortBio/;

  assert.match(
    source,
    populateAuthorRegex,
    "getBlogPostBySlug should populate author with shortBio"
  );
});
