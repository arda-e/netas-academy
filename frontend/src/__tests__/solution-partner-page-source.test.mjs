import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Page renders translated accordion heading", () => {
  const source = readSource("app/[locale]/cozum-ortagi/page.tsx");
  assert.match(
    source,
    /heading=\{t\('accordion\.heading'\)\}/,
    "Page should render the translated accordion section heading"
  );
});

test("Page shows all four translated collaboration areas", () => {
  const source = readSource("app/[locale]/cozum-ortagi/page.tsx");
  assert.match(
    source,
    /t\('accordion\.training\.title'\)/,
    "Should include training collaboration area"
  );
  assert.match(
    source,
    /t\('accordion\.consulting\.title'\)/,
    "Should include consulting collaboration area"
  );
  assert.match(
    source,
    /t\('accordion\.workshop\.title'\)/,
    "Should include workshop collaboration area"
  );
  assert.match(
    source,
    /t\('accordion\.expertise\.title'\)/,
    "Should include expertise collaboration area"
  );
});

test("CTA uses buildIntentLeadUrl('solution_partner_application')", () => {
  const source = readSource("app/[locale]/cozum-ortagi/page.tsx");
  assert.match(
    source,
    /buildIntentLeadUrl\("solution_partner_application"\)/,
    "CTA should use buildIntentLeadUrl with solution_partner_application"
  );
});

test("Page does NOT contain 'Kimler başvurabilir'", () => {
  const source = readSource("app/[locale]/cozum-ortagi/page.tsx");
  assert.doesNotMatch(
    source,
    /Kimler başvurabilir/i,
    "Page should not contain 'Kimler başvurabilir'"
  );
});

test("Page does NOT contain high-promise language (acceptance, response time, matching)", () => {
  const source = readSource("app/[locale]/cozum-ortagi/page.tsx");
  assert.doesNotMatch(
    source,
    /kabul edilir|cevap süresi|eşleştirme|onaylanma|garanti/i,
    "Page should not contain high-promise language"
  );
});
