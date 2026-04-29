import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Teacher listing page imports TeacherCard", () => {
  const source = readSource("app/egitmenler/page.tsx");
  assert.match(
    source,
    /TeacherCard/,
    "Listing page should import TeacherCard"
  );
});

test("Teacher listing page uses ContentPageShell with title Eğitmenlerimiz", () => {
  const source = readSource("app/egitmenler/page.tsx");
  assert.match(
    source,
    /Eğitmenlerimiz/,
    "Listing page should have title Eğitmenlerimiz"
  );
});

test("Teacher listing page uses ContentGrid", () => {
  const source = readSource("app/egitmenler/page.tsx");
  assert.match(
    source,
    /ContentGrid/,
    "Listing page should use ContentGrid"
  );
});

test("Teacher listing page has empty state message", () => {
  const source = readSource("app/egitmenler/page.tsx");
  assert.match(
    source,
    /Henüz eğitmen profili eklenmemiş/,
    "Listing page should show empty state message"
  );
});

test("Teacher listing page passes expertiseAreas to TeacherCard", () => {
  const source = readSource("app/egitmenler/page.tsx");
  assert.match(
    source,
    /expertiseAreas/,
    "Listing page should pass expertiseAreas to TeacherCard"
  );
});

test("TeacherCard component renders expertise tags with #009ca6 accent", () => {
  const source = readSource("components/teacher-card.tsx");
  assert.match(
    source,
    /#009ca6/,
    "TeacherCard should use #009ca6 accent color for expertise tags"
  );
});

test("TeacherCard component shows initials fallback when no photo", () => {
  const source = readSource("components/teacher-card.tsx");
  assert.match(
    source,
    /getInitials/,
    "TeacherCard should have getInitials fallback for missing photo"
  );
});

test("TeacherCard component links to /egitmenler/[slug]", () => {
  const source = readSource("components/teacher-card.tsx");
  assert.match(
    source,
    /\/egitmenler\/\$\{slug\}/,
    "TeacherCard should link to /egitmenler/[slug]"
  );
});
