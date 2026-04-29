import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("blog list page imports SearchField from shared content barrel", () => {
  const source = readSource("app/blog-yazilari/page.tsx");

  assert.match(
    source,
    /import\s*\{[^}]*SearchField[^}]*\}\s*from\s*"@\/components\/content"/,
    "blog list page should import SearchField from @/components/content"
  );
});

test("blog list page passes publishedDate to blog cards", () => {
  const source = readSource("app/blog-yazilari/page.tsx");

  assert.match(
    source,
    /publishedDate:\s*post\.publishedDate/,
    "blog list page should pass publishedDate to blog cards"
  );
});

test("blog list page passes authorName to blog cards", () => {
  const source = readSource("app/blog-yazilari/page.tsx");

  assert.match(
    source,
    /authorName:\s*post\.author\?\.displayName/,
    "blog list page should pass author displayName as authorName"
  );
});

test("blog list page reads search from searchParams", () => {
  const source = readSource("app/blog-yazilari/page.tsx");

  assert.match(
    source,
    /params\.search/,
    "blog list page should read search from searchParams"
  );
});

test("blog list page passes search to getBlogPosts", () => {
  const source = readSource("app/blog-yazilari/page.tsx");

  assert.match(
    source,
    /getBlogPosts\(search\)/,
    "blog list page should pass search term to getBlogPosts"
  );
});

test("blog list page shows empty message for no results", () => {
  const source = readSource("app/blog-yazilari/page.tsx");

  assert.match(
    source,
    /Aramanızla eşleşen blog yazısı bulunamadı/,
    "blog list page should show empty message when no search results"
  );
});

test("SearchField component has use client directive", () => {
  const source = readSource("components/content/search-field.tsx");

  assert.match(
    source,
    /"use client"/,
    "SearchField should have 'use client' directive"
  );
});

test("SearchField renders search input", () => {
  const source = readSource("components/content/search-field.tsx");

  assert.match(
    source,
    /<input/,
    "SearchField should render a search input element"
  );
});

test("SearchField accepts searchOnly prop", () => {
  const source = readSource("components/content/search-field.tsx");

  assert.match(
    source,
    /searchOnly/,
    "SearchField should accept searchOnly prop"
  );
});

test("getBlogPosts accepts optional search parameter", () => {
  const source = readSource("lib/strapi.ts");

  assert.match(
    source,
    /getBlogPosts\(search\?:\s*string\)/,
    "getBlogPosts should accept optional search parameter"
  );
});

test("getBlogPosts builds $containsi filters when search is provided", () => {
  const source = readSource("lib/strapi.ts");

  assert.match(
    source,
    /\$containsi/,
    "getBlogPosts should use $containsi filter for search"
  );
});
