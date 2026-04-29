import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Source contains measurement references on primary CTA", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.match(
    source,
    /buildIntentLeadUrl|instructor_application|emitAbout/i,
    "Source should reference measurement or CTA patterns on primary CTA"
  );
});

test("Source contains measurement references on secondary CTA", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.match(
    source,
    /buildIntentLeadUrl|solution_partner_application|emitAbout/i,
    "Source should reference measurement or CTA patterns on secondary CTA"
  );
});

test("Primary and secondary measurement identifiers are distinct", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.match(
    source,
    /about_corporate_cta/,
    "Primary CTA should reference about_corporate_cta"
  );
  assert.match(
    source,
    /about_education_cta/,
    "Secondary CTA should reference about_education_cta"
  );
  assert.notEqual(
    "about_corporate_cta",
    "about_education_cta",
    "Primary and secondary identifiers must be distinct"
  );
});
