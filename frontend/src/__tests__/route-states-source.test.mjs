// route-states-source.test.mjs — Source test for route loading/error components
//
// Run: node frontend/src/__tests__/route-states-source.test.mjs

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

// --- error.tsx ---
assertFileExists("app/[locale]/error.tsx", "error.tsx");
const errorPage = readSource("app/[locale]/error.tsx");
assert.ok(errorPage.includes('"use client"'), "error.tsx should be a client component");
assert.ok(errorPage.includes("error: Error"), "error.tsx should accept error prop");
assert.ok(errorPage.includes("reset: () => void"), "error.tsx should accept reset prop");
assert.ok(errorPage.includes("Bir hata oluştu"), "error.tsx should contain Turkish error title");
assert.ok(errorPage.includes("Tekrar Dene"), "error.tsx should contain Turkish retry text");
assert.ok(errorPage.includes('data-testid="global-error"'), "error.tsx should have data-testid=\"global-error\"");
assert.ok(errorPage.includes("data-testid=\"global-error.retry-button\""), "error.tsx should have retry button testid");

// --- route-loading.tsx ---
assertFileExists("components/content/route-loading.tsx", "route-loading.tsx");
const routeLoading = readSource("components/content/route-loading.tsx");
assert.ok(routeLoading.includes("animate-pulse"), "route-loading.tsx should use animate-pulse");
assert.ok(routeLoading.includes("testId"), "route-loading.tsx should accept testId prop");
assert.ok(routeLoading.includes("CourseListLoading"), "route-loading.tsx should export list-level course skeletons");
assert.ok(routeLoading.includes("EventListLoading"), "route-loading.tsx should export list-level event skeletons");
assert.ok(routeLoading.includes("BlogListLoading"), "route-loading.tsx should export list-level blog skeletons");
assert.ok(routeLoading.includes("TeacherListLoading"), "route-loading.tsx should export list-level teacher skeletons");

// --- loading.tsx files ---
const loadingRoutes = [
  { route: "app/[locale]/egitimler/loading.tsx", testId: "loading.egitimler", staticHero: true },
  { route: "app/[locale]/egitimler/[slug]/loading.tsx", testId: "loading.course-detail", staticHero: false },
  { route: "app/[locale]/etkinlikler/loading.tsx", testId: "loading.etkinlikler", staticHero: true },
  { route: "app/[locale]/etkinlikler/[slug]/loading.tsx", testId: "loading.event-detail", staticHero: false },
  { route: "app/[locale]/blog-yazilari/loading.tsx", testId: "loading.blog", staticHero: true },
  { route: "app/[locale]/blog-yazilari/[slug]/loading.tsx", testId: "loading.blog-detail", staticHero: false },
  { route: "app/[locale]/egitmenler/loading.tsx", testId: "loading.egitmenler", staticHero: true },
  { route: "app/[locale]/egitmenler/[slug]/loading.tsx", testId: "loading.teacher-detail", staticHero: false },
];

for (const { route, testId, staticHero } of loadingRoutes) {
  assertFileExists(route, `loading.tsx for ${route}`);
  const source = readSource(route);
  if (staticHero) {
    assert.ok(
      source.includes("ContentPageShell"),
      `${route} should render the static page shell instead of a hero skeleton`
    );
    assert.ok(
      !source.includes("RouteLoading"),
      `${route} should not use RouteLoading because listing heroes are static`
    );
  } else {
    assert.ok(
      source.includes("RouteLoading"),
      `${route} should import RouteLoading`
    );
  }
  assert.ok(
    source.includes(`testId="${testId}"`) || source.includes(`data-testid="${testId}"`),
    `${route} should have testId="${testId}"`
  );
  assert.ok(
    source.includes("ListLoading") || source.includes("animate-pulse"),
    `${route} should contain or delegate to list-level skeleton loading`
  );
}

// --- Suspense wrapping in page files ---
const pageRoutes = [
  "app/[locale]/egitimler/page.tsx",
  "app/[locale]/egitimler/[slug]/page.tsx",
  "app/[locale]/etkinlikler/page.tsx",
  "app/[locale]/etkinlikler/[slug]/page.tsx",
  "app/[locale]/blog-yazilari/page.tsx",
  "app/[locale]/blog-yazilari/[slug]/page.tsx",
  "app/[locale]/egitmenler/page.tsx",
  "app/[locale]/egitmenler/[slug]/page.tsx",
];

for (const route of pageRoutes) {
  const source = readSource(route);
  assert.ok(
    source.includes("Suspense"),
    `${route} should import Suspense`
  );
  assert.ok(
    source.includes("RouteLoading") || source.includes("ListLoading"),
    `${route} should import a loading component for fallback`
  );
}

const aboutRedirectPage = readSource("app/[locale]/hakkimizda/page.tsx");
assert.ok(
  aboutRedirectPage.includes("redirect(\"/\")"),
  "app/[locale]/hakkimizda/page.tsx should remain a redirect-only page"
);

// --- route-loading exported from content index ---
const contentIndex = readSource("components/content/index.ts");
assert.ok(
  contentIndex.includes("RouteLoading"),
  "content/index.ts should export RouteLoading"
);
assert.ok(
  contentIndex.includes("ListLoading"),
  "content/index.ts should export list loading components"
);

console.log("✅ All route states tests passed.");
