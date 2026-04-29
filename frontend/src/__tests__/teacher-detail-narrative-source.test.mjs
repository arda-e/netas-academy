import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Detail page renders expertiseAreas section before courses", () => {
  const source = readSource("app/egitmenler/[slug]/page.tsx");

  const expertiseIdx = source.indexOf("Uzmanlık Alanları");
  const coursesIdx = source.indexOf("Eğitimleri");

  assert.ok(
    expertiseIdx > -1 && coursesIdx > -1 && expertiseIdx < coursesIdx,
    "expertiseAreas section should appear before courses section"
  );
});

test("Detail page renders targetTeams section before courses", () => {
  const source = readSource("app/egitmenler/[slug]/page.tsx");

  const targetTeamsIdx = source.indexOf("Hedef Kitle");
  const coursesIdx = source.indexOf("Eğitimleri");

  assert.ok(
    targetTeamsIdx > -1 && coursesIdx > -1 && targetTeamsIdx < coursesIdx,
    "targetTeams section should appear before courses section"
  );
});

test("Detail page renders teachingApproach section before courses", () => {
  const source = readSource("app/egitmenler/[slug]/page.tsx");

  const approachIdx = source.indexOf("Eğitim Yaklaşımı");
  const coursesIdx = source.indexOf("Eğitimleri");

  assert.ok(
    approachIdx > -1 && coursesIdx > -1 && approachIdx < coursesIdx,
    "teachingApproach section should appear before courses section"
  );
});

test("Detail page renders courses section before bio", () => {
  const source = readSource("app/egitmenler/[slug]/page.tsx");

  const coursesIdx = source.indexOf("Eğitimleri");
  const bioIdx = source.indexOf("Hakkında");

  assert.ok(
    coursesIdx > -1 && bioIdx > -1 && coursesIdx < bioIdx,
    "courses section should appear before bio section"
  );
});

test("Detail page has section labels in correct narrative order", () => {
  const source = readSource("app/egitmenler/[slug]/page.tsx");

  const labels = [
    "Uzmanlık Alanları",
    "Hedef Kitle",
    "Eğitim Yaklaşımı",
    "Eğitimleri",
    "Hakkında",
  ];

  let lastIdx = -1;
  for (const label of labels) {
    const idx = source.indexOf(label);
    assert.ok(idx > lastIdx, `"${label}" should appear in order`);
    lastIdx = idx;
  }
});

test("Detail page imports getStrapiMediaUrl", () => {
  const source = readSource("app/egitmenler/[slug]/page.tsx");
  assert.match(
    source,
    /getStrapiMediaUrl/,
    "Detail page should import getStrapiMediaUrl"
  );
});

test("Detail page imports getStrapiMediaAltText", () => {
  const source = readSource("app/egitmenler/[slug]/page.tsx");
  assert.match(
    source,
    /getStrapiMediaAltText/,
    "Detail page should import getStrapiMediaAltText"
  );
});

test("Detail page uses getStrapiMediaUrl for teacher.profilePhoto", () => {
  const source = readSource("app/egitmenler/[slug]/page.tsx");
  assert.match(
    source,
    /getStrapiMediaUrl\(teacher\.profilePhoto\)/,
    "Detail page should call getStrapiMediaUrl with teacher.profilePhoto"
  );
});
