import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Registration page imports the shared event information panel", () => {
  const source = readSource("app/[locale]/etkinlikler/[slug]/kayit/page.tsx");
  assert.match(
    source,
    /import\s*\{\s*EventInformationPanel\s*\}\s*from\s*"@\/components\/events\/event-information-panel"/,
    "Registration page should import EventInformationPanel"
  );
});

test("Registration page provides the shared panel with page-owned body and action", () => {
  const source = readSource("app/[locale]/etkinlikler/[slug]/kayit/page.tsx");
  assert.match(source, /event=\{\s*\{/);
  assert.match(source, /copy=\{\s*\{/);
  assert.match(source, /bodyContent=\{/);
  assert.match(source, /event\.summary\s*\?\?\s*t\("panel\.summary_fallback"\)/);
  assert.match(source, /action=\{/);
  assert.match(source, /page\.event-registration\.back-to-detail/);
});

test("Registration page passes event price into the registration form", () => {
  const source = readSource("app/[locale]/etkinlikler/[slug]/kayit/page.tsx");
  assert.match(source, /eventPrice=\{event\.price\}/);
});

test("Registration page includes registration state text in the shared panel", () => {
  const source = readSource("app/[locale]/etkinlikler/[slug]/kayit/page.tsx");
  assert.match(source, /registrationState:\s*\{/);
  assert.match(source, /status\.open/);
  assert.match(source, /status\.closed/);
});
