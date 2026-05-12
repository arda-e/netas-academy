import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(__dirname, "../lib/seo-utils.ts");
const source = fs.readFileSync(sourcePath, "utf8");

test("seo utils source includes metadata merge helpers", () => {
  assert.match(source, /export function buildLocalePath/);
  assert.match(source, /export function buildLocaleAlternates/);
  assert.match(source, /export function buildMetadata/);
  assert.match(source, /alternates/);
  assert.match(source, /openGraph/);
  assert.match(source, /robots/);
});
