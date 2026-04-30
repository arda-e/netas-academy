// route-testids-source.test.mjs — Source test for route page data-testid attributes
//
// Run: node frontend/src/__tests__/route-testids-source.test.mjs

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

// --- app/page.tsx ---

const homePage = readSource("app/page.tsx");
assert.ok(
  homePage.includes(`data-testid="page.home"`),
  "app/page.tsx should contain data-testid=\"page.home\""
);

// --- app/hakkimizda/page.tsx ---

const hakkimizdaPage = readSource("app/hakkimizda/page.tsx");
assert.ok(
  hakkimizdaPage.includes(`testId="page.hakkimizda"`),
  "app/hakkimizda/page.tsx should contain testId=\"page.hakkimizda\""
);
assert.ok(
  hakkimizdaPage.includes("data-measurement-id"),
  "app/hakkimizda/page.tsx should contain at least one data-measurement-id (preserved)"
);

// --- app/egitimler/page.tsx ---

const egitimlerPage = readSource("app/egitimler/page.tsx");
assert.ok(
  egitimlerPage.includes(`testId="page.egitimler"`),
  "app/egitimler/page.tsx should contain testId=\"page.egitimler\""
);

// --- app/etkinlikler/page.tsx ---

const etkinliklerPage = readSource("app/etkinlikler/page.tsx");
assert.ok(
  etkinliklerPage.includes(`testId="page.etkinlikler"`),
  "app/etkinlikler/page.tsx should contain testId=\"page.etkinlikler\""
);

// --- Detail pages with root data-testid ---

const eventDetail = readSource("app/etkinlikler/[slug]/page.tsx");
assert.ok(
  eventDetail.includes(`data-testid="page.event-detail"`),
  "app/etkinlikler/[slug]/page.tsx should contain data-testid=\"page.event-detail\""
);

const courseDetail = readSource("app/egitimler/[slug]/page.tsx");
assert.ok(
  courseDetail.includes(`testId="page.course-detail"`),
  "app/egitimler/[slug]/page.tsx should contain testId=\"page.course-detail\""
);

const teacherDetail = readSource("app/egitmenler/[slug]/page.tsx");
assert.ok(
  teacherDetail.includes(`testId="page.teacher-detail"`),
  "app/egitmenler/[slug]/page.tsx should contain testId=\"page.teacher-detail\""
);

const blogDetail = readSource("app/blog-yazilari/[slug]/page.tsx");
assert.ok(
  blogDetail.includes(`data-testid="page.blog-detail"`),
  "app/blog-yazilari/[slug]/page.tsx should contain data-testid=\"page.blog-detail\""
);

// At least 3 detail pages have root data-testid attributes (we check 4 above)

console.log("✅ All route testids tests passed.");
