import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Registration page uses the event_reg translation namespace", () => {
  const source = readSource("app/[locale]/etkinlikler/[slug]/kayit/page.tsx");
  assert.match(
    source,
    /getTranslations\(\{ locale, namespace: "event_reg" \}\)/,
    "Registration page should load event_reg translations for metadata"
  );
  assert.match(
    source,
    /getTranslations\("event_reg"\)/,
    "Registration page should load event_reg translations for the route body"
  );
});

test("Registration page metadata uses translated suffix and description", () => {
  const source = readSource("app/[locale]/etkinlikler/[slug]/kayit/page.tsx");
  assert.match(source, /meta\.title_suffix/);
  assert.match(source, /meta\.description/);
});

test("Registration page hero and closed-state copy are translation-driven", () => {
  const source = readSource("app/[locale]/etkinlikler/[slug]/kayit/page.tsx");
  assert.match(source, /hero\.eyebrow/);
  assert.match(source, /hero\.open_body/);
  assert.match(source, /hero\.closed_body/);
  assert.match(source, /closed\.heading/);
  assert.match(source, /closed\.body_1/);
  assert.match(source, /closed\.body_2/);
  assert.match(source, /panel\.summary_fallback/);
});

test("Registration duplicate email error is localized", () => {
  const hookSource = readSource("hooks/use-event-registration-form.ts");
  const trMessages = readSource("messages/tr.json");
  const enMessages = readSource("messages/en.json");

  assert.match(hookSource, /Student already registered for this event/);
  assert.match(hookSource, /error\.student_already_registered/);
  assert.match(trMessages, /"student_already_registered"/);
  assert.match(enMessages, /"student_already_registered"/);
});
