import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Primary CTA label is 'Kurumsal Eğitim Talebi'", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.match(
    source,
    /Kurumsal Eğitim Talebi/i,
    "Primary CTA label should be 'Kurumsal Eğitim Talebi'"
  );
});

test("Primary CTA uses buildIntentLeadUrl('corporate_training_request')", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.match(
    source,
    /buildIntentLeadUrl\("corporate_training_request"\)/,
    "Primary CTA should use buildIntentLeadUrl with corporate_training_request"
  );
});

test("Primary CTA has data-measurement-id='about_corporate_cta'", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.match(
    source,
    /data-measurement-id="about_corporate_cta"/,
    "Primary CTA should have data-measurement-id='about_corporate_cta'"
  );
});

test("Secondary CTA label is 'Eğitim Kataloğunu İncele'", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.match(
    source,
    /Eğitim Kataloğunu İncele/i,
    "Secondary CTA label should be 'Eğitim Kataloğunu İncele'"
  );
});

test("Secondary CTA href is /egitimler", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.match(
    source,
    /href="\/egitimler"/,
    "Secondary CTA href should be /egitimler"
  );
});

test("Secondary CTA has data-measurement-id='about_education_cta'", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.match(
    source,
    /data-measurement-id="about_education_cta"/,
    "Secondary CTA should have data-measurement-id='about_education_cta'"
  );
});
