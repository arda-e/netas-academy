import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("blog detail page shows author displayName", () => {
  const source = readSource("app/[locale]/blog-yazilari/[slug]/page.tsx");

  assert.match(
    source,
    /author\?\.displayName/,
    "blog detail page should reference author.displayName"
  );
});

test("blog detail page shows author role", () => {
  const source = readSource("app/[locale]/blog-yazilari/[slug]/page.tsx");

  assert.match(
    source,
    /author\.role\b/,
    "blog detail page should reference author.role"
  );
});

test("blog detail page shows author shortBio", () => {
  const source = readSource("app/[locale]/blog-yazilari/[slug]/page.tsx");

  assert.match(
    source,
    /author\?\.shortBio/,
    "blog detail page should reference author.shortBio"
  );
});

test("blog detail page has İlgili Yazılar section", () => {
  const source = readSource("components/content/blog-related-posts.tsx");

  assert.match(
    source,
    /t\('related_posts\.heading'\)/,
    "related posts section module should render the translated related posts heading"
  );
});

test("blog detail page imports the related posts section module", () => {
  const source = readSource("app/[locale]/blog-yazilari/[slug]/page.tsx");

  assert.match(
    source,
    /RelatedPostsSection/,
    "blog detail page should import and render RelatedPostsSection"
  );
});

test("blog detail page filters related posts excluding current post", () => {
  const source = readSource("lib/strapi-blog.ts");

  assert.match(
    source,
    /filters\[slug\]\[\$ne\]=\$\{encodeURIComponent\(excludeSlug\)\}/,
    "related blog helper should exclude the current slug in the Strapi query"
  );
});

test("blog detail page fetches related posts through the dedicated helper", () => {
  const source = readSource("app/[locale]/blog-yazilari/[slug]/page.tsx");

  assert.match(
    source,
    /getRelatedBlogPosts\(slug,\s*3\)/,
    "blog detail page should call getRelatedBlogPosts for related posts"
  );
});
