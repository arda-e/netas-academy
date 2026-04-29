import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Hero contains 'Kurumsal Eğitim Talep Et' as primary CTA label", () => {
  const source = readSource("app/page.tsx");
  assert.match(
    source,
    /Kurumsal Eğitim Talep Et/i,
    "Hero should have 'Kurumsal Eğitim Talep Et' as primary CTA label"
  );
});

test("Hero contains 'Eğitim Kataloğunu İncele' as secondary CTA label", () => {
  const source = readSource("app/page.tsx");
  assert.match(
    source,
    /Eğitim Kataloğunu İncele/i,
    "Hero should have 'Eğitim Kataloğunu İncele' as secondary CTA label"
  );
});

test("Primary CTA uses buildIntentLeadUrl('corporate_training_request')", () => {
  const source = readSource("app/page.tsx");
  assert.match(
    source,
    /buildIntentLeadUrl\("corporate_training_request"\)/,
    "Primary CTA should use buildIntentLeadUrl with corporate_training_request"
  );
});

test("Secondary CTA href is /egitimler", () => {
  const source = readSource("app/page.tsx");
  assert.match(
    source,
    /href:\s*"\/egitimler"/,
    "Secondary CTA href should be /egitimler"
  );
});

test("Hero title mentions team transformation/adaptation (not portal management)", () => {
  const source = readSource("app/page.tsx");
  assert.match(
    source,
    /dönüşüm|adaptasyon|ekiplerinizi/i,
    "Hero title should mention team transformation/adaptation, not portal management"
  );
});
