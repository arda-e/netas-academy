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

// --- app/[locale]/page.tsx ---

const homePage = readSource("app/[locale]/page.tsx");
assert.ok(
  homePage.includes(`data-testid="page.home"`),
  'app/[locale]/page.tsx should contain data-testid="page.home"'
);

// --- app/[locale]/hakkimizda/page.tsx (redirect to home) ---

const hakkimizdaPage = readSource("app/[locale]/hakkimizda/page.tsx");
assert.ok(
  hakkimizdaPage.includes('redirect("/")'),
  'app/[locale]/hakkimizda/page.tsx should redirect to home page ("/")'
);

// --- app/[locale]/egitimler/page.tsx ---

const egitimlerPage = readSource("app/[locale]/egitimler/page.tsx");
assert.ok(
  egitimlerPage.includes(`testId="page.egitimler"`),
  'app/[locale]/egitimler/page.tsx should contain testId="page.egitimler"'
);

// --- app/[locale]/etkinlikler/page.tsx ---

const etkinliklerPage = readSource("app/[locale]/etkinlikler/page.tsx");
assert.ok(
  etkinliklerPage.includes(`testId="page.etkinlikler"`),
  'app/[locale]/etkinlikler/page.tsx should contain testId="page.etkinlikler"'
);

// --- Detail pages with root data-testid ---

const eventDetail = readSource("app/[locale]/etkinlikler/[slug]/page.tsx");
assert.ok(
  eventDetail.includes(`data-testid="page.event-detail"`),
  'app/[locale]/etkinlikler/[slug]/page.tsx should contain data-testid="page.event-detail"'
);

const courseDetail = readSource("app/[locale]/egitimler/[slug]/page.tsx");
assert.ok(
  courseDetail.includes(`testId="page.course-detail"`),
  'app/[locale]/egitimler/[slug]/page.tsx should contain testId="page.course-detail"'
);

const teacherDetail = readSource("app/[locale]/egitmenler/[slug]/page.tsx");
assert.ok(
  teacherDetail.includes(`testId="page.teacher-detail"`),
  'app/[locale]/egitmenler/[slug]/page.tsx should contain testId="page.teacher-detail"'
);

const blogDetail = readSource("app/[locale]/blog-yazilari/[slug]/page.tsx");
assert.ok(
  blogDetail.includes(`testId="page.blog-detail"`),
  'app/[locale]/blog-yazilari/[slug]/page.tsx should contain testId="page.blog-detail"'
);

// At least 3 detail pages have root data-testid attributes (we check 4 above)

console.log("✅ All route testids tests passed.");
