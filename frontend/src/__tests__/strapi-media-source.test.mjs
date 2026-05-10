import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("getStrapiMediaFormat is exported from strapi-media.ts", () => {
  const source = readSource("lib/strapi-media.ts");

  assert.match(
    source,
    /export function getStrapiMediaFormat/,
    "strapi-media.ts should export getStrapiMediaFormat"
  );
});

test("getStrapiMediaFormat accepts size parameter", () => {
  const source = readSource("lib/strapi-media.ts");

  assert.match(
    source,
    /size:\s*StrapiMediaFormatSize/,
    "getStrapiMediaFormat should accept a size parameter of type StrapiMediaFormatSize"
  );
});

test("getStrapiMediaUrl prefers format URLs over raw URL (formats.large before media.url)", () => {
  const source = readSource("lib/strapi-media.ts");

  const formatLargeIndex = source.indexOf('"formats", "large", "url"');
  const mediaUrlIndex = source.indexOf("media.url,");

  assert.ok(formatLargeIndex >= 0, "Should contain formats.large entry");
  assert.ok(mediaUrlIndex >= 0, "Should contain media.url entry");
  assert.ok(
    formatLargeIndex < mediaUrlIndex,
    "Formats should appear before media.url in candidate chain (format URLs preferred over raw URL)"
  );
});

test("getStrapiMediaUrl accepts optional size parameter", () => {
  const source = readSource("lib/strapi-media.ts");

  assert.match(
    source,
    /export function getStrapiMediaUrl\(\s*media\?:\s*StrapiMedia\s*\|\s*null,\s*size\?:\s*StrapiMediaFormatSize/,
    "getStrapiMediaUrl should accept optional size parameter"
  );
});

test("getStrapiMediaBlurDataUrl uses the thumbnail format for LQIP", () => {
  const source = readSource("lib/strapi-media.ts");

  assert.match(
    source,
    /export function getStrapiMediaBlurDataUrl/,
    "strapi-media.ts should export a blur data URL helper"
  );
  assert.match(
    source,
    /getStrapiMediaFormat\(media,\s*"thumbnail"\)/,
    "blur helper should use the smallest Strapi thumbnail format"
  );
});

test("StrapiMediaFormatSize type is exported from strapi-media.ts", () => {
  const source = readSource("lib/strapi-media.ts");

  assert.match(
    source,
    /export type StrapiMediaFormatSize/,
    "strapi-media.ts should export StrapiMediaFormatSize type"
  );
});

test("StrapiMediaFormat type includes width, height, mime in strapi-types.ts", () => {
  const source = readSource("lib/strapi-types.ts");

  assert.match(
    source,
    /export type StrapiMediaFormat\s*=\s*\{[\s\S]*?width\?:\s*number\s*\|\s*null[\s\S]*?height\?:\s*number\s*\|\s*null[\s\S]*?mime\?:\s*string\s*\|\s*null/,
    "StrapiMediaFormat should include width, height, mime fields"
  );
});

test("StrapiMedia type includes width, height, mime in strapi-types.ts", () => {
  const source = readSource("lib/strapi-types.ts");

  assert.match(
    source,
    /export type StrapiMedia\s*=\s*\{[\s\S]*?width\?:\s*number\s*\|\s*null[\s\S]*?height\?:\s*number\s*\|\s*null[\s\S]*?mime\?:\s*string\s*\|\s*null/,
    "StrapiMedia should include width, height, mime fields"
  );
});

test("getBlogPosts populates coverImage formats, width, height, mime", () => {
  const source = readSource("lib/strapi-blog.ts");

  const coverImageFields =
    /populate\[coverImage\]\[fields\]\[2\]=width&populate\[coverImage\]\[fields\]\[3\]=height&populate\[coverImage\]\[fields\]\[4\]=mime/;

  assert.match(
    source,
    coverImageFields,
    "getBlogPosts should populate coverImage width, height, mime"
  );

  const coverImageFormats = /populate\[coverImage\]\[fields\]\[5\]=formats/;

  assert.match(
    source,
    coverImageFormats,
    "getBlogPosts should populate coverImage formats"
  );
});

test("getBlogPostBySlug populates coverImage formats, width, height, mime", () => {
  const source = readSource("lib/strapi-blog.ts");

  assert.match(
    source,
    /populate\[coverImage\]\[fields\]\[2\]=width&populate\[coverImage\]\[fields\]\[3\]=height&populate\[coverImage\]\[fields\]\[4\]=mime/,
    "getBlogPostBySlug should populate coverImage width, height, mime"
  );

  assert.match(
    source,
    /populate\[coverImage\]\[fields\]\[5\]=formats/,
    "getBlogPostBySlug should populate coverImage formats"
  );
});
