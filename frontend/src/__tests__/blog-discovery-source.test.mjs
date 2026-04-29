import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("blog list page imports BlogSearch client component", () => {
  const source = readSource("app/blog-yazilari/page.tsx");

  assert.match(
    source,
    /import\s*\{\s*BlogSearch\s*\}\s*from\s*"\.\/blog-search"/,
    "blog list page should import BlogSearch from ./blog-search"
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

test("BlogSearch client component has use client directive", () => {
  const source = readSource("app/blog-yazilari/blog-search.tsx");

  assert.match(
    source,
    /"use client"/,
    "BlogSearch should have 'use client' directive"
  );
});

test("BlogSearch renders search input", () => {
  const source = readSource("app/blog-yazilari/blog-search.tsx");

  assert.match(
    source,
    /<input/,
    "BlogSearch should render a search input element"
  );
});

test("BlogSearch shows empty message for no results", () => {
  const source = readSource("app/blog-yazilari/blog-search.tsx");

  assert.match(
    source,
    /Aramanızla eşleşen blog yazısı bulunamadı/,
    "BlogSearch should show empty message when no search results"
  );
});

test("BlogSearch filters posts by title", () => {
  const source = readSource("app/blog-yazilari/blog-search.tsx");

  assert.match(
    source,
    /post\.title\.toLocaleLowerCase/,
    "BlogSearch should filter posts by title case-insensitively"
  );
});
