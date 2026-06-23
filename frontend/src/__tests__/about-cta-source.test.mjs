import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Hakkimizda route redirects to the home about section", () => {
  const source = readSource("app/[locale]/hakkimizda/page.tsx");
  assert.match(source, /import\s+\{\s*redirect\s*\}\s+from\s+"next\/navigation"/);
  assert.match(source, /redirect\("\/"\)/);
});
