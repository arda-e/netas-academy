import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("rich-text-content.tsx does not import DOMPurify directly", () => {
  const source = readSource("components/content/rich-text-content.tsx");

  assert.doesNotMatch(
    source,
    /from\s+["']isomorphic-dompurify["']/,
    "rich-text-content.tsx should not import isomorphic-dompurify directly"
  );
});

test("rich-text-content.tsx imports sanitizeHtml from sanitize-html.ts", () => {
  const source = readSource("components/content/rich-text-content.tsx");

  assert.match(
    source,
    /from\s+["']@\/lib\/sanitize-html["']/,
    "rich-text-content.tsx should import from @/lib/sanitize-html"
  );
});

test("rich-text-content.tsx is not a client component", () => {
  const source = readSource("components/content/rich-text-content.tsx");

  assert.doesNotMatch(
    source,
    /"use client"/,
    "rich-text-content.tsx should not have 'use client' directive"
  );
});

test("sanitize-html.ts exists and exports sanitizeHtml", () => {
  const source = readSource("lib/sanitize-html.ts");

  assert.match(
    source,
    /export function sanitizeHtml/,
    "sanitize-html.ts should export sanitizeHtml function"
  );
});

test("sanitize-html.ts is not a client component", () => {
  const source = readSource("lib/sanitize-html.ts");

  assert.doesNotMatch(
    source,
    /"use client"/,
    "sanitize-html.ts should not have 'use client' directive"
  );
});

test("sanitize-html.ts imports isomorphic-dompurify", () => {
  const source = readSource("lib/sanitize-html.ts");

  assert.match(
    source,
    /from\s+["']isomorphic-dompurify["']/,
    "sanitize-html.ts should import isomorphic-dompurify (server-side only)"
  );
});

test("sanitize-html.ts has ALLOWED_TAGS with expected HTML elements", () => {
  const source = readSource("lib/sanitize-html.ts");

  assert.match(source, /"p"/, "ALLOWED_TAGS should include p");
  assert.match(source, /"a"/, "ALLOWED_TAGS should include a");
  assert.match(source, /"img"/, "ALLOWED_TAGS should include img");
  assert.match(source, /"table"/, "ALLOWED_TAGS should include table");
  assert.match(source, /"h1"/, "ALLOWED_TAGS should include h1");
});

test("sanitize-html.ts has ALLOWED_ATTR with expected attributes", () => {
  const source = readSource("lib/sanitize-html.ts");

  assert.match(source, /"href"/, "ALLOWED_ATTR should include href");
  assert.match(source, /"src"/, "ALLOWED_ATTR should include src");
  assert.match(source, /"alt"/, "ALLOWED_ATTR should include alt");
  assert.match(source, /"style"/, "ALLOWED_ATTR should include style");
});
