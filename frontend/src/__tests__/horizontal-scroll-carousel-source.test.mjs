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
  assert.match(source, /content/);
  assert.match(source, /controls/);
  assert.match(source, /layout/);
  assert.match(source, /itemsCount/);
  assert.match(source, /hasOverflow/);
  assert.match(source, /disabled=\{!canScrollPrev\}/);
  assert.match(source, /disabled=\{!canScrollNext\}/);
});

test("Course carousel passes grouped carousel config to the primitive", () => {
  const source = readSource("components/course-carousel.tsx");
  assert.match(source, /HorizontalScrollCarousel/);
  assert.match(source, /content=\{\{/);
  assert.match(source, /controls=\{\{/);
  assert.match(source, /layout=\{\{/);
});

test("Teacher carousel passes grouped carousel config to the primitive", () => {
  const source = readSource("components/teacher-carousel.tsx");
  assert.match(source, /HorizontalScrollCarousel/);
  assert.match(source, /content=\{\{/);
  assert.match(source, /controls=\{\{/);
  assert.match(source, /layout=\{\{/);
});
