import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Detail page imports isEventRegistrationOpen", () => {
  const source = readSource("app/etkinlikler/[slug]/page.tsx");
  assert.match(
    source,
    /import\s*\{\s*isEventRegistrationOpen\s*\}\s*from\s*"@\/lib\/event-registration"/,
    "Detail page should import isEventRegistrationOpen"
  );
});

test("Detail page computes registrationOpen with isEventRegistrationOpen", () => {
  const source = readSource("app/etkinlikler/[slug]/page.tsx");
  assert.match(
    source,
    /isEventRegistrationOpen\(event\)/,
    "Detail page should call isEventRegistrationOpen(event)"
  );
});

test("Detail page renders registration CTA when open", () => {
  const source = readSource("app/etkinlikler/[slug]/page.tsx");
  assert.match(
    source,
    /Etkinliğe Kayıt Ol/,
    "Detail page should show registration button when open"
  );
});

test("Detail page uses RichTextContent for event details", () => {
  const source = readSource("app/etkinlikler/[slug]/page.tsx");
  assert.match(
    source,
    /<RichTextContent/,
    "Detail page should use RichTextContent component"
  );
});

test("Detail page shows summary prominently before details", () => {
  const source = readSource("app/etkinlikler/[slug]/page.tsx");
  assert.match(
    source,
    /event\.summary/,
    "Detail page should reference event.summary"
  );
});

test("Detail page passes registrationOpen to EventInformationPanel", () => {
  const source = readSource("app/etkinlikler/[slug]/page.tsx");
  assert.match(
    source,
    /registrationOpen=\{registrationOpen\}/,
    "Detail page should pass registrationOpen prop to EventInformationPanel"
  );
});
