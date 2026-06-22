import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Content barrel no longer exports stale detail wrappers", () => {
  const source = readSource("components/content/index.ts");
  assert.doesNotMatch(source, /CourseDetail/);
  assert.doesNotMatch(source, /EventDetail/);
});

test("HeroOverlay file is removed", () => {
  const heroOverlayPath = path.join(projectRoot, "components/hero-overlay.tsx");
  assert.equal(existsSync(heroOverlayPath), false);
});

test("SearchField no longer exposes the dead searchOnly prop", () => {
  const source = readSource("components/content/search-field.tsx");
  assert.doesNotMatch(source, /searchOnly/);
});
