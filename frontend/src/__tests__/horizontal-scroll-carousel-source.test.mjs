import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Horizontal scroll primitive exists and owns the scroll buttons", () => {
  const source = readSource("components/carousel/horizontal-scroll-carousel.tsx");
  assert.match(source, /itemsCount/);
  assert.match(source, /hasOverflow/);
  assert.match(source, /disabled=\{!canScrollPrev\}/);
  assert.match(source, /disabled=\{!canScrollNext\}/);
});

test("Course carousel uses the primitive with controls after the scroll area", () => {
  const source = readSource("components/course-carousel.tsx");
  assert.match(source, /HorizontalScrollCarousel/);
  assert.match(source, /controlsPlacement="after"/);
});

test("Teacher carousel uses the primitive with controls before the scroll area", () => {
  const source = readSource("components/teacher-carousel.tsx");
  assert.match(source, /HorizontalScrollCarousel/);
  assert.match(source, /controlsPlacement="before"/);
});
