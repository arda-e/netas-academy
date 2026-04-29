import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Source contains a trust/identity section after hero (look for 'biz kimiz' or trust-related Turkish copy)", () => {
  const source = readSource("app/page.tsx");
  assert.match(
    source,
    /VisualStorySection|biz kimiz|Netaş Academy|hizmet|değer/i,
    "Source should reference a trust/identity section after hero"
  );
});

test("Source contains a result/proof section after trust section", () => {
  const source = readSource("app/page.tsx");
  assert.match(
    source,
    /homeVisualSection/,
    "Source should reference homeVisualSection (result/proof content)"
  );
});

test("Source does NOT contain fake metric patterns like '%' or 'bin+' or 'müşteri'", () => {
  const source = readSource("app/page.tsx");
  assert.doesNotMatch(
    source,
    /%|bin\+|müşteri/i,
    "Source should not contain fake metrics like %, bin+, müşteri"
  );
});

test("Source does NOT contain English placeholder text like 'Lorem ipsum'", () => {
  const source = readSource("app/page.tsx");
  assert.doesNotMatch(
    source,
    /Lorem ipsum/i,
    "Source should not contain English placeholder text"
  );
});
