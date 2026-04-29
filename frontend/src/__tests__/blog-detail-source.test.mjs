import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("blog detail page shows author displayName", () => {
  const source = readSource("app/blog-yazilari/[slug]/page.tsx");

  assert.match(
    source,
    /author\?\.displayName/,
    "blog detail page should reference author.displayName"
  );
});

test("blog detail page shows author role", () => {
  const source = readSource("app/blog-yazilari/[slug]/page.tsx");

  assert.match(
    source,
    /author\.role\b/,
    "blog detail page should reference author.role"
  );
});

test("blog detail page shows author shortBio", () => {
  const source = readSource("app/blog-yazilari/[slug]/page.tsx");

  assert.match(
    source,
    /author\?\.shortBio/,
    "blog detail page should reference author.shortBio"
  );
});

test("BlogDetail component has Dayanak / Kaynak label for sourceNotes", () => {
  const source = readSource("components/content/blog.tsx");

  assert.match(
    source,
    /Dayanak\s*\/\s*Kaynak/,
    "BlogDetail component should show 'Dayanak / Kaynak' label for sourceNotes"
  );
});

test("blog detail page passes sourceNotes to BlogDetail", () => {
  const source = readSource("app/blog-yazilari/[slug]/page.tsx");

  assert.match(
    source,
    /sourceNotes=\{post\.sourceNotes/,
    "blog detail page should pass sourceNotes to BlogDetail"
  );
});

test("blog detail page has İlgili Yazılar section", () => {
  const source = readSource("app/blog-yazilari/[slug]/page.tsx");

  assert.match(
    source,
    /İlgili Yazılar/,
    "blog detail page should have 'İlgili Yazılar' heading"
  );
});

test("blog detail page filters related posts excluding current post", () => {
  const source = readSource("app/blog-yazilari/[slug]/page.tsx");

  assert.match(
    source,
    /p\.documentId\s*!==\s*post\.documentId/,
    "blog detail page should exclude current post from related posts"
  );
});

test("blog detail page fetches all posts for related section", () => {
  const source = readSource("app/blog-yazilari/[slug]/page.tsx");

  assert.match(
    source,
    /getBlogPosts\(\)/,
    "blog detail page should call getBlogPosts for related posts"
  );
});
