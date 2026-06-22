import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Detail page imports the shared event information panel", () => {
  const source = readSource("app/[locale]/etkinlikler/[slug]/page.tsx");
  assert.match(
    source,
    /import\s*\{\s*EventInformationPanel\s*\}\s*from\s*"@\/components\/events\/event-information-panel"/,
    "Detail page should import EventInformationPanel from the shared component"
  );
});

test("Detail page passes the registration status button as the action slot", () => {
  const source = readSource("app/[locale]/etkinlikler/[slug]/page.tsx");
  assert.match(
    source,
    /action=\{\s*<RegistrationStatusButton/,
    "Detail page should pass RegistrationStatusButton into the action slot"
  );
});

test("Detail page groups panel data into event and copy props", () => {
  const source = readSource("app/[locale]/etkinlikler/[slug]/page.tsx");
  assert.match(source, /event=\{\s*\{/);
  assert.match(source, /copy=\{\s*\{/);
});

test("Detail page renders registration CTA when open", () => {
  const source = readSource("app/[locale]/etkinlikler/[slug]/page.tsx");
  assert.match(
    source,
    /registerCta=\{t\("detail\.register_cta"\)\}/,
    "Detail page should pass the translated registration CTA"
  );
  assert.match(
    source,
    /contactCta=\{t\("detail\.contact_cta"\)\}/,
    "Detail page should pass the translated contact CTA"
  );
  assert.match(
    source,
    /registrationClosedNotice=\{t\("detail\.registration_closed_notice"\)\}/,
    "Detail page should pass the translated closed-registration notice"
  );
});

test("Detail page uses RichTextContent for event details", () => {
  const source = readSource("app/[locale]/etkinlikler/[slug]/page.tsx");
  assert.match(
    source,
    /<RichTextContent/,
    "Detail page should use RichTextContent component"
  );
});

test("Detail page shows summary prominently before details", () => {
  const source = readSource("app/[locale]/etkinlikler/[slug]/page.tsx");
  assert.match(
    source,
    /event\.summary/,
    "Detail page should reference event.summary"
  );
});

test("Detail page no longer defines a local EventInformationPanel", () => {
  const source = readSource("app/[locale]/etkinlikler/[slug]/page.tsx");
  assert.doesNotMatch(
    source,
    /function\s+EventInformationPanel/,
    "Detail page should not define EventInformationPanel locally"
  );
});
