import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

// Hero CTA strings live in HomeHeroSection.tsx (not page.tsx) after the unified redesign.
const heroSource = readSource("components/home/HomeHeroSection.tsx");

test("Hero contains 'Kurumsal Eğitim Talep Et' as primary CTA label", () => {
  assert.match(
    heroSource,
    /Kurumsal Eğitim Talep Et/i,
    "Hero should have 'Kurumsal Eğitim Talep Et' as primary CTA label"
  );
});

test("Hero contains 'Eğitimleri İncele' as secondary CTA label", () => {
  assert.match(
    heroSource,
    /Eğitimleri İncele/i,
    "Hero should have 'Eğitimleri İncele' as secondary CTA label"
  );
});

test("Primary CTA uses buildIntentLeadUrl('corporate_training_request')", () => {
  assert.match(
    heroSource,
    /buildIntentLeadUrl\("corporate_training_request"\)/,
    "Primary CTA should use buildIntentLeadUrl with corporate_training_request"
  );
});

test("Secondary CTA href is /egitimler", () => {
  assert.match(
    heroSource,
    /href="\/egitimler"/,
    "Secondary CTA href should be /egitimler"
  );
});

test("Hero title mentions team transformation/adaptation (not portal management)", () => {
  assert.match(
    heroSource,
    /dönüşüm|adaptasyon|uyum/i,
    "Hero slides should mention team transformation/adaptation"
  );
});
