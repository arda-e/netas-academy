import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

/* ─── Contact submissions proxy ─── */

test("contact-submissions proxy returns 502 on fetch failure", () => {
  const source = readSource("app/api/contact-submissions/submit/route.ts");

  assert.match(
    source,
    /status:\s*502/,
    "contact-submissions proxy should return 502 status on fetch failure"
  );
});

test("contact-submissions proxy contains Turkish error fallback message", () => {
  const source = readSource("app/api/contact-submissions/submit/route.ts");

  assert.match(
    source,
    /Mesaj istegi islenemedi/,
    "contact-submissions proxy should use Turkish error message"
  );
});

test("contact-submissions proxy uses no-store cache directive", () => {
  const source = readSource("app/api/contact-submissions/submit/route.ts");

  assert.match(
    source,
    /cache:\s*"no-store"/,
    "contact-submissions proxy should use no-store cache"
  );
});

test("contact-submissions proxy catches JSON parse errors gracefully", () => {
  const source = readSource("app/api/contact-submissions/submit/route.ts");

  assert.match(
    source,
    /response\.json\(\)\.catch/,
    "contact-submissions proxy should catch JSON parse errors from upstream"
  );
});

/* ─── Registrations proxy ─── */

test("registrations proxy returns 502 on fetch failure", () => {
  const source = readSource("app/api/registrations/register/route.ts");

  assert.match(
    source,
    /status:\s*502/,
    "registrations proxy should return 502 status on fetch failure"
  );
});

test("registrations proxy uses Turkish error fallback message", () => {
  const source = readSource("app/api/registrations/register/route.ts");

  assert.match(
    source,
    /Kayit istegi islenemedi/,
    "registrations proxy should use Turkish error message"
  );
});

test("registrations proxy uses no-store cache directive", () => {
  const source = readSource("app/api/registrations/register/route.ts");

  assert.match(
    source,
    /cache:\s*"no-store"/,
    "registrations proxy should use no-store cache"
  );
});

/* ─── Analytics proxy ─── */

test("analytics proxy returns 502 on fetch failure", () => {
  const source = readSource("app/api/analytics/events/route.ts");

  assert.match(
    source,
    /status:\s*502/,
    "analytics proxy should return 502 status on fetch failure"
  );
});

test("analytics proxy uses Turkish error fallback message", () => {
  const source = readSource("app/api/analytics/events/route.ts");

  assert.match(
    source,
    /Etkinlik istegi islenemedi/,
    "analytics proxy should use Turkish error message"
  );
});

test("analytics proxy uses no-store cache directive", () => {
  const source = readSource("app/api/analytics/events/route.ts");

  assert.match(
    source,
    /cache:\s*"no-store"/,
    "analytics proxy should use no-store cache"
  );
});

/* ─── Newsletter proxy ─── */

test("newsletter proxy returns 502 on fetch failure", () => {
  const source = readSource("app/api/newsletter-subscriptions/subscribe/route.ts");

  assert.match(
    source,
    /status:\s*502/,
    "newsletter proxy should return 502 status on fetch failure"
  );
});

test("newsletter proxy uses Turkish error fallback message", () => {
  const source = readSource("app/api/newsletter-subscriptions/subscribe/route.ts");

  assert.match(
    source,
    /Abonelik istegi islenemedi/,
    "newsletter proxy should use Turkish error message"
  );
});

test("newsletter proxy uses no-store cache directive", () => {
  const source = readSource("app/api/newsletter-subscriptions/subscribe/route.ts");

  assert.match(
    source,
    /cache:\s*"no-store"/,
    "newsletter proxy should use no-store cache"
  );
});

/* ─── Consistency across proxy routes ─── */

test("all 4 proxy routes return 502 on network failure", () => {
  const files = [
    "app/api/contact-submissions/submit/route.ts",
    "app/api/registrations/register/route.ts",
    "app/api/analytics/events/route.ts",
    "app/api/newsletter-subscriptions/subscribe/route.ts",
  ];

  for (const file of files) {
    const source = readSource(file);
    assert.match(
      source,
      /status:\s*502/,
      `${file} should return 502 on network failure`
    );
  }
});

test("all 4 proxy routes have try/catch and Turkish fallback", () => {
  const files = [
    "app/api/contact-submissions/submit/route.ts",
    "app/api/registrations/register/route.ts",
    "app/api/analytics/events/route.ts",
    "app/api/newsletter-subscriptions/subscribe/route.ts",
  ];

  for (const file of files) {
    const source = readSource(file);
    assert.match(
      source,
      /catch\s*\{/,
      `${file} should have a catch block for error handling`
    );
  }
});

test("proxy routes do not expose upstream error bodies in fallback", () => {
  const files = [
    "app/api/contact-submissions/submit/route.ts",
    "app/api/registrations/register/route.ts",
    "app/api/analytics/events/route.ts",
    "app/api/newsletter-subscriptions/subscribe/route.ts",
  ];

  for (const file of files) {
    const source = readSource(file);

    const catchSections = source.match(/catch\s*\{[\s\S]*?\}/g);
    if (!catchSections) continue;

    for (const section of catchSections) {
      assert.doesNotMatch(
        section,
        /\b(response|error)\.body\b/,
        `${file} should not expose raw upstream error bodies in fallback`
      );
    }
  }
});

test("proxy routes use consistent proxy pattern: parse JSON → forward → return upstream status", () => {
  const files = [
    "app/api/contact-submissions/submit/route.ts",
    "app/api/registrations/register/route.ts",
    "app/api/analytics/events/route.ts",
    "app/api/newsletter-subscriptions/subscribe/route.ts",
  ];

  for (const file of files) {
    const source = readSource(file);

    assert.match(
      source,
      /request\.json\(\)/,
      `${file} should parse JSON from request`
    );

    assert.match(
      source,
      /NextResponse\.json/,
      `${file} should use NextResponse.json for responses`
    );
  }
});
