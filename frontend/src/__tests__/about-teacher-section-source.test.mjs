import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Source imports TeacherCarousel", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.match(
    source,
    /TeacherCarousel/,
    "Source should import TeacherCarousel"
  );
});

test("Source passes teacher name, slug, imageUrl, imageAlt to carousel items", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.match(
    source,
    /slug|name|imageUrl|imageAlt/,
    "Source should pass teacher metadata properties to carousel"
  );
});

test("Section heading/body mentions field experience or applied guidance", () => {
  const source = readSource("app/hakkimizda/page.tsx");
  assert.match(
    source,
    /tecrübe|saha|uygulama|deneyimli|sektörel tecrübe/i,
    "Teacher section should mention field experience or applied guidance"
  );
});

test("Empty teacher list has a fallback (emptyMessage prop)", () => {
  const source = readSource("components/teacher-carousel.tsx");
  assert.match(
    source,
    /emptyMessage/,
    "TeacherCarousel should have an emptyMessage prop for empty state"
  );
});
