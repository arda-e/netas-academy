import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Source follows narrative order: trust → model → programs → instructors → outcomes", () => {
  const source = readSource("app/hakkimizda/page.tsx");

  const trustIndex = source.indexOf("Netaş Güvencesiyle Kurumsal Eğitim");
  const modelIndex = source.indexOf("Vaka, Senaryo ve Gerçek İş Problemine Dayalı");
  const programsIndex = source.indexOf("Kurum İhtiyacına Göre Şekillenen");
  const instructorsIndex = source.indexOf("Saha Deneyimi Güçlü Eğitmen Kadromuz");
  const outcomesIndex = source.indexOf("Katılımcı Çıktısı");
  const ctaIndex = source.indexOf("Kurumsal Eğitim Talebi");

  assert.ok(trustIndex >= 0, "Source should have a trust section");
  assert.ok(modelIndex >= 0, "Source should have an applied model section");
  assert.ok(programsIndex >= 0, "Source should have an institution programs section");
  assert.ok(instructorsIndex >= 0, "Source should have an instructors section");
  assert.ok(outcomesIndex >= 0, "Source should have an outcomes section");

  // Verify correct order: trust → model → programs → instructors → outcomes → CTA
  assert.ok(trustIndex < modelIndex, "Trust section should come before applied model");
  assert.ok(modelIndex < programsIndex, "Applied model should come before institution programs");
  assert.ok(programsIndex < instructorsIndex, "Institution programs should come before instructors");
  assert.ok(instructorsIndex < outcomesIndex, "Instructors should come before outcomes");
  assert.ok(outcomesIndex < ctaIndex, "Outcomes should come before CTAs");
});

test("Source mentions Netaş technology/sector experience", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.match(
    source,
    /Netaş.*teknoloji|teknoloji.*sektör|sektör deneyimi/i,
    "Source should mention Netaş technology/sector experience"
  );
});

test("Source mentions applied learning (vaka, senaryo, uygulama)", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.match(
    source,
    /vaka.*senaryo|senaryo.*temelli|gerçek iş problem/i,
    "Source should mention applied learning concepts"
  );
});

test("Source mentions institution-shaped programs", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.match(
    source,
    /Kurum.*ihtiyacına göre|sektör.*ekip profili|esnek.*şekillen/i,
    "Source should mention institution-shaped programs"
  );
});

test("Source does NOT contain English placeholder text", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.doesNotMatch(
    source,
    /Lorem ipsum|placeholder|coming soon/i,
    "Source should not contain English placeholder text"
  );
});

test("Source does NOT contain fake metrics or customer claims", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.doesNotMatch(
    source,
    /müşteri sayısı|başarı oranı|%[0-9]{2,}|bin\+/i,
    "Source should not contain unsupported metrics"
  );
});
