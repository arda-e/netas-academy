import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

// After the unified redesign, hero CTAs live in HomeHeroSection.tsx.
// The contact CTA lives in HomeContactCTASection.tsx.
const heroSource = readSource("components/home/HomeHeroSection.tsx");
const ctaSource = readSource("components/home/HomeContactCTASection.tsx");

test("Source contains measurement event references on primary CTA", () => {
  assert.match(
    heroSource,
    /data-measurement-id|buildIntentLeadUrl|corporate_training_request/i,
    "HomeHeroSection should reference measurement or CTA event patterns on primary CTA"
  );
});

test("Source contains measurement event references on secondary CTA", () => {
  // Check for the correctly spelled Turkish CTA label and the /egitimler href.
  // Note: the regex must use proper Turkish characters (not ASCII-stripped) to match.
  assert.match(
    heroSource,
    /Eğitimleri İncele|\/egitimler/i,
    "HomeHeroSection should reference the secondary CTA label or /egitimler href"
  );
});

test("Primary and secondary measurement identifiers are distinct", () => {
  const primaryMatches = heroSource.match(/corporate_training_request/g) || [];
  const secondaryMatches = heroSource.match(/\/egitimler/g) || [];
  assert.ok(
    primaryMatches.length > 0,
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

test("Contact CTA section uses buildIntentLeadUrl for corporate training request", () => {
  assert.match(
    ctaSource,
    /buildIntentLeadUrl\("corporate_training_request"\)/,
    "HomeContactCTASection should use buildIntentLeadUrl with corporate_training_request"
  );
});
