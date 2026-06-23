// content-shell-source.test.mjs — Source test for content shell component structure
//
// Run: node frontend/src/__tests__/content-shell-source.test.mjs

import { strict as assert } from "node:assert";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, "..");

function readSource(relativePath) {
  const fullPath = join(srcDir, relativePath);
  if (!existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  return readFileSync(fullPath, "utf-8");
}

function assertFileExists(relativePath, label) {
  const fullPath = join(srcDir, relativePath);
  assert.ok(existsSync(fullPath), `${label}: file should exist at ${relativePath}`);
}

// --- content-page-shell.tsx ---
assertFileExists("components/content/content-page-shell.tsx", "content-page-shell.tsx");
const pageShell = readSource("components/content/content-page-shell.tsx");
assert.ok(pageShell.includes("skeleton?: ReactNode"), "content-page-shell.tsx should have skeleton prop");
assert.ok(pageShell.includes("skeleton ?? children"), "content-page-shell.tsx should render skeleton or children");

// --- content-detail-shell.tsx ---
assertFileExists("components/content/content-detail-shell.tsx", "content-detail-shell.tsx");
const detailShell = readSource("components/content/content-detail-shell.tsx");
assert.ok(detailShell.includes("skeleton?: ReactNode"), "content-detail-shell.tsx should have skeleton prop");
assert.ok(detailShell.includes("hasSkeleton ? slots?.skeleton : bodyContent"), "content-detail-shell.tsx should conditionally render skeleton");

// --- content-grid.tsx ---
assertFileExists("components/content/content-grid.tsx", "content-grid.tsx");
const contentGrid = readSource("components/content/content-grid.tsx");
assert.ok(contentGrid.includes("skeleton?: ReactNode"), "content-grid.tsx should have skeleton prop");
assert.ok(contentGrid.includes("if (slots?.skeleton)"), "content-grid.tsx should check skeleton prop");

// --- content-card-shell.tsx ---
assertFileExists("components/content/content-card-shell.tsx", "content-card-shell.tsx");
const cardShell = readSource("components/content/content-card-shell.tsx");
assert.ok(cardShell.includes("skeleton?: ReactNode"), "content-card-shell.tsx should have skeleton prop");
assert.ok(cardShell.includes("if (slots?.skeleton)"), "content-card-shell.tsx should check skeleton prop");

// Verify existing props are preserved
assert.ok(pageShell.includes("testId?: string"), "content-page-shell.tsx should still have testId prop");
assert.ok(pageShell.includes("children"), "content-page-shell.tsx should still have children prop");
assert.ok(detailShell.includes("testId?: string"), "content-detail-shell.tsx should still have testId prop");
assert.ok(detailShell.includes("children"), "content-detail-shell.tsx should still have children prop");
assert.ok(contentGrid.includes("testId?: string"), "content-grid.tsx should still have testId prop");
assert.ok(contentGrid.includes("children"), "content-grid.tsx should still have children prop");
assert.ok(cardShell.includes("testId?: string"), "content-card-shell.tsx should still have testId prop");

console.log("✅ All content shell tests passed.");
