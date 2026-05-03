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
  const source = readSource("app/haberler/page.tsx");
  assert.match(
    source,
    /title="Haberler"/,
    "Haberler page should have title 'Haberler'"
  );
});

test("Haberler page shows empty state with items={[]}", () => {
  const source = readSource("app/haberler/page.tsx");
  assert.match(
    source,
    /items=\{\[\]\}/,
    "Haberler page should render NewsList with empty items array"
  );
});

test("Haberler page has root testId", () => {
  const source = readSource("app/haberler/page.tsx");
  assert.match(
    source,
    /testId="page\.haberler"/,
    "Haberler page should have testId='page.haberler'"
  );
});

test("Haberler page uses force-dynamic", () => {
  const source = readSource("app/haberler/page.tsx");
  assert.match(
    source,
    /export const dynamic = "force-dynamic"/,
    "Haberler page should export dynamic = 'force-dynamic'"
  );
});

test("Haberler page contains TODO comment for future Strapi wiring", () => {
  const source = readSource("app/haberler/page.tsx");
  assert.match(
    source,
    /TODO: Replace hardcoded empty list with Strapi data fetch/,
    "Haberler page should have TODO comment for Strapi wiring"
  );
});

test("Haberler page description mentions kurumsal haber", () => {
  const source = readSource("app/haberler/page.tsx");
  assert.match(
    source,
    /kurumsal haber/,
    "Haberler page description should mention 'kurumsal haber'"
  );
});
