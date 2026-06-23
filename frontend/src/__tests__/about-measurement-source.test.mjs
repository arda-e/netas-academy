import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Hakkimizda route no longer owns CTA measurement events", () => {
  const source = readSource("app/[locale]/hakkimizda/page.tsx");
  assert.match(source, /redirect\("\/"\)/);
  assert.doesNotMatch(source, /data-measurement-id=/);
  assert.doesNotMatch(source, /emitAbout/);
});
