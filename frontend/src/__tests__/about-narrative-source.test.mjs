import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Hakkimizda route is a thin redirect without placeholder content", () => {
  const source = readSource("app/[locale]/hakkimizda/page.tsx");
  assert.match(source, /redirect\("\/"\)/);
  assert.doesNotMatch(source, /Lorem ipsum|placeholder|coming soon/i);
  assert.doesNotMatch(source, /müşteri sayısı|başarı oranı|%[0-9]{2,}|bin\+/i);
});
