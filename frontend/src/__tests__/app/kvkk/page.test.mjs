import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test('KVKK page renders with correct title "KVKK | Netas Academy"', () => {
  const source = readSource("app/[locale]/kvkk/page.tsx");
  assert.match(
    source,
    /title:\s*"KVKK \| Netas Academy"/,
    "KVKK page should have metadata title 'KVKK | Netas Academy'"
  );
});

test("KVKK page contains key Turkish legal text phrase 'Kişisel verilerin korunmasına'", () => {
  const source = readSource("app/[locale]/kvkk/page.tsx");
  assert.match(
    source,
    /Kişisel verilerin korunmasına/,
    "KVKK page should contain the main heading phrase"
  );
});

test("KVKK page contains 'Veri Sorumlusu' section", () => {
  const source = readSource("app/[locale]/kvkk/page.tsx");
  assert.match(
    source,
    /Veri Sorumlusu/,
    "KVKK page should contain 'Veri Sorumlusu' section heading"
  );
});

test("KVKK page references 6698 sayılı Kanun", () => {
  const source = readSource("app/[locale]/kvkk/page.tsx");
  assert.match(
    source,
    /6698 sayılı/,
    "KVKK page should reference the 6698 law number"
  );
});

test("KVKK page has root data-testid", () => {
  const source = readSource("app/[locale]/kvkk/page.tsx");
  assert.match(
    source,
    /data-testid="page\.kvkk"/,
    "KVKK page should have data-testid='page.kvkk'"
  );
});

test("KVKK page does not force dynamic rendering", () => {
  const source = readSource("app/[locale]/kvkk/page.tsx");
  assert.doesNotMatch(
    source,
    /export const dynamic = "force-dynamic"/,
    "KVKK page should remain statically renderable"
  );
});
