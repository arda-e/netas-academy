// site-shell-testids-source.test.mjs — Source test for site shell data-testid attributes
//
// Run: node frontend/src/__tests__/site-shell-testids-source.test.mjs

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

// --- layout.tsx ---

const layout = readSource("app/layout.tsx");
assert.ok(
  layout.includes(`data-testid="root-layout.content"`),
  "layout.tsx should contain data-testid=\"root-layout.content\""
);

// --- site-header.tsx ---

const siteHeader = readSource("components/site-header.tsx");
assert.ok(
  siteHeader.includes(`data-testid="site-header.logo-link"`),
  "site-header.tsx should contain data-testid=\"site-header.logo-link\""
);
assert.ok(
  siteHeader.includes(`aria-controls="site-mobile-navigation"`),
  "site-header.tsx should contain aria-controls=\"site-mobile-navigation\" (preserved)"
);
assert.ok(
  siteHeader.includes(`data-testid="site-header.mobile-menu.toggle"`),
  "site-header.tsx should contain data-testid=\"site-header.mobile-menu.toggle\""
);
assert.ok(
  siteHeader.includes(`data-testid="site-header.desktop-nav"`),
  "site-header.tsx should contain data-testid=\"site-header.desktop-nav\""
);

// --- site-footer.tsx ---

const siteFooter = readSource("components/site-footer.tsx");
assert.ok(
  siteFooter.includes(`data-testid="site-footer.site-plan"`),
  "site-footer.tsx should contain data-testid=\"site-footer.site-plan\""
);
assert.ok(
  siteFooter.includes(`data-testid="site-footer.legal"`),
  "site-footer.tsx should contain data-testid=\"site-footer.legal\""
);

// --- breadcrumbs.tsx ---

const breadcrumbs = readSource("components/breadcrumbs.tsx");
assert.ok(
  breadcrumbs.includes(`data-testid="breadcrumbs.nav"`),
  "breadcrumbs.tsx should contain data-testid=\"breadcrumbs.nav\""
);
assert.ok(
  breadcrumbs.includes(`aria-current`),
  "breadcrumbs.tsx should contain aria-current (preserved)"
);

console.log("✅ All site-shell testids tests passed.");
