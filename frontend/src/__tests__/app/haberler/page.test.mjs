import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Haberler page renders with correct title 'Haberler'", () => {
  const source = readSource("app/[locale]/haberler/page.tsx");
  assert.match(
    source,
    /title:\s*t\('hero\.title'\)/,
    "Haberler page should use the translated hero title"
  );
});

test("Haberler page maps Strapi news posts into NewsList items", () => {
  const source = readSource("app/[locale]/haberler/page.tsx");
  assert.match(
    source,
    /const items = posts\.map/,
    "Haberler page should map fetched posts"
  );
  assert.match(
    source,
    /<NewsList items=\{items\} emptyMessage=\{t\('list\.empty'\)\}/,
    "Haberler page should render NewsList with mapped items and translated empty message"
  );
});

test("Haberler page has root testId", () => {
  const source = readSource("app/[locale]/haberler/page.tsx");
  assert.match(
    source,
    /testId="page\.haberler"/,
    "Haberler page should have testId='page.haberler'"
  );
});

test("Haberler page fetches news posts from Strapi", () => {
  const source = readSource("app/[locale]/haberler/page.tsx");
  assert.match(
    source,
    /getNewsPosts\(\)/,
    "Haberler page should call getNewsPosts"
  );
});

test("Haberler page is no longer hardcoded placeholder content", () => {
  const source = readSource("app/[locale]/haberler/page.tsx");
  assert.doesNotMatch(
    source,
    /TODO: Replace hardcoded empty list with Strapi data fetch|items=\{\[\]\}/,
    "Haberler page should not contain the old placeholder wiring"
  );
});

test("Haberler page description comes from translations", () => {
  const source = readSource("app/[locale]/haberler/page.tsx");
  assert.match(
    source,
    /description:\s*<p>\{t\('hero\.description'\)\}<\/p>/,
    "Haberler page description should use translated copy"
  );
});
