import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

const pageSource = readSource("app/[locale]/page.tsx");

test("page.tsx imports the unified home section components", () => {
  assert.match(
    pageSource,
    /HomeHeroSection/,
    "page.tsx should import HomeHeroSection"
  );
  assert.match(
    pageSource,
    /HomeTrustSection/,
    "page.tsx should import HomeTrustSection"
  );
  assert.match(
    pageSource,
    /HomeContactCTASection/,
    "page.tsx should import HomeContactCTASection"
  );
});

test("page.tsx does NOT reference VisualStorySection", () => {
  assert.doesNotMatch(
    pageSource,
    /VisualStorySection/,
    "VisualStorySection should be removed from page.tsx"
  );
});

test("page.tsx does NOT reference hakkimizdaVisualSection", () => {
  assert.doesNotMatch(
    pageSource,
    /hakkimizdaVisualSection/,
    "hakkimizdaVisualSection import should be removed from page.tsx"
  );
});

test("Source does NOT contain fake metric patterns like '%' or 'bin+' or 'müşteri'", () => {
  assert.doesNotMatch(
    pageSource,
    /%|bin\+|müşteri/i,
    "Source should not contain fake metrics like %, bin+, müşteri"
  );
});

test("Source does NOT contain English placeholder text like 'Lorem ipsum'", () => {
  assert.doesNotMatch(
    pageSource,
    /Lorem ipsum/i,
    "Source should not contain English placeholder text"
  );
});
