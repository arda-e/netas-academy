import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("TeacherCarousel component uses grouped carousel config", () => {
  const source = readSource("components/teacher-carousel.tsx");
  assert.match(
    source,
    /TeacherCarousel/,
    "TeacherCarousel component should exist"
  );
});

test("TeacherCarousel passes content, controls, and layout buckets", () => {
  const source = readSource("components/teacher-carousel.tsx");
  assert.match(
    source,
    /content=\{\{/,
    "TeacherCarousel should pass content bucket to the primitive"
  );
  assert.match(
    source,
    /controls=\{\{/,
    "TeacherCarousel should pass controls bucket to the primitive"
  );
  assert.match(
    source,
    /layout=\{\{/,
    "TeacherCarousel should pass layout bucket to the primitive"
  );
});
