// content-testids-source.test.mjs — Source test for content component data-testid attributes
//
// Run: node frontend/src/__tests__/content-testids-source.test.mjs

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

// --- content-card-shell.tsx ---

const cardShell = readSource("components/content/content-card-shell.tsx");
assert.ok(
  cardShell.includes("testId?: string"),
  "content-card-shell.tsx should have testId in its props type definition"
);
assert.ok(
  cardShell.includes("testId"),
  "content-card-shell.tsx should use testId in data-testid assignments"
);

// --- content-grid.tsx ---

const contentGrid = readSource("components/content/content-grid.tsx");
assert.ok(
  contentGrid.includes("testId?: string"),
  "content-grid.tsx should have testId in its props type"
);
assert.ok(
  contentGrid.includes("data-testid"),
  "content-grid.tsx should have data-testid on the empty state element"
);

// --- search-field.tsx ---

const searchField = readSource("components/content/search-field.tsx");
assert.ok(
  searchField.includes(`data-testid="search-field.input"`),
  "search-field.tsx should contain data-testid=\"search-field.input\""
);

// --- courses.tsx ---

const courses = readSource("components/content/courses.tsx");
assert.ok(
  courses.includes(`from "@/lib/testids"`),
  "courses.tsx should import join from @/lib/testids"
);

// --- teacher-card.tsx ---

const teacherCard = readSource("components/teacher-card.tsx");
assert.ok(
  teacherCard.includes("data-testid"),
  "teacher-card.tsx should contain data-testid attributes"
);

console.log("✅ All content testids tests passed.");
