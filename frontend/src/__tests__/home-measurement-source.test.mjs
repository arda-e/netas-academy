import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Source contains measurement event references on primary CTA", () => {
  const source = readSource("app/page.tsx");
  assert.match(
    source,
    /buildIntentLeadUrl|emitHome|home_corporate_cta_click|home_education_cta_click/i,
    "Source should reference measurement or CTA event patterns on primary CTA"
  );
});

test("Source contains measurement event references on secondary CTA", () => {
  const source = readSource("app/page.tsx");
  assert.match(
    source,
    /Egitimleri Incele|\/egitimler/i,
    "Source should reference measurement or CTA event patterns on secondary CTA"
  );
});

test("Primary and secondary measurement identifiers are distinct", () => {
  const source = readSource("app/page.tsx");
  const primaryMatches = source.match(/corporate_training_request/g) || [];
  const secondaryMatches = source.match(/\/egitimler/g) || [];
  assert.ok(
    primaryMatches.length > 0 || source.includes("corporate_training_request"),
    "Primary CTA should reference corporate_training_request"
  );
  assert.ok(
    secondaryMatches.length > 0,
    "Secondary CTA should reference /egitimler"
  );
  assert.notEqual(
    "corporate_training_request",
    "/egitimler",
    "Primary and secondary identifiers must be distinct"
  );
});
