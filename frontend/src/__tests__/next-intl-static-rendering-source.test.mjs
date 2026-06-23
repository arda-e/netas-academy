// next-intl-static-rendering-source.test.mjs — Source test for static locale setup.
//
// Run: node frontend/src/__tests__/next-intl-static-rendering-source.test.mjs

import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
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

function assertOrdered(source, snippets, message) {
  let previousIndex = -1;

  for (const snippet of snippets) {
    const index = source.indexOf(snippet);
    assert.notEqual(index, -1, `${message}: missing ${snippet}`);
    assert.ok(
      index > previousIndex,
      `${message}: expected ${snippet} to appear after previous snippet`,
    );
    previousIndex = index;
  }
}

const layout = readSource("app/[locale]/layout.tsx");
assert.ok(
  layout.includes("setRequestLocale"),
  "locale layout should import and use setRequestLocale",
);
assertOrdered(
  layout,
  [
    "const { locale } = await params;",
    "setRequestLocale(locale);",
    "const messages = await getMessages({ locale });",
  ],
  "locale layout should set request locale before loading messages",
);

const courseDetailPage = readSource("app/[locale]/egitimler/[slug]/page.tsx");
assert.ok(
  courseDetailPage.includes("setRequestLocale"),
  "course detail page should import and use setRequestLocale",
);
assertOrdered(
  courseDetailPage,
  [
    "const { locale, slug } = await params;",
    "setRequestLocale(locale);",
    'const t = await getTranslations("courses");',
    'const tt = await getTranslations("taxonomy");',
  ],
  "course detail page should set request locale before page-level translations",
);

const teacherDetailPage = readSource("app/[locale]/egitmenler/[slug]/page.tsx");
assert.ok(
  teacherDetailPage.includes("setRequestLocale"),
  "teacher detail page should import and use setRequestLocale",
);
assertOrdered(
  teacherDetailPage,
  [
    "const { locale, slug } = await params;",
    "setRequestLocale(locale);",
    "const teacher = await getTeacherBySlug(slug, isDraft);",
    "const t = await getTranslations('teachers');",
  ],
  "teacher detail page should set request locale before page-level translations",
);

console.log("✅ next-intl static rendering source tests passed.");
