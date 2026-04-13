import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("contact and registration forms use tighter mobile spacing and stacked legal/actions", () => {
  const contactForm = readSource("components/contact-form.tsx");
  const registrationForm = readSource("components/event-registration-form.tsx");

  assert.match(contactForm, /grid gap-4 md:gap-6 md:grid-cols-2/);
  assert.match(contactForm, /space-y-2 md:space-y-3/);
  assert.match(contactForm, /flex flex-col gap-4 sm:items-start/);

  assert.match(registrationForm, /grid gap-4 md:gap-6 md:grid-cols-2/);
  assert.match(registrationForm, /space-y-2 md:space-y-3/);
  assert.match(registrationForm, /flex flex-col gap-4 sm:items-start/);
  assert.match(registrationForm, /flex items-start gap-3/);
});

test("contact and event registration pages stack panels before large screens", () => {
  const contactPage = readSource("app/iletisim/page.tsx");
  const registrationPage = readSource("app/etkinlikler/[slug]/kayit/page.tsx");

  assert.match(contactPage, /grid gap-6 lg:grid-cols-\[minmax\(0,0\.72fr\)_minmax\(280px,0\.46fr\)\]/);
  assert.match(registrationPage, /grid gap-6 xl:grid-cols-\[minmax\(0,0\.72fr\)_minmax\(300px,0\.42fr\)\]/);
  assert.doesNotMatch(registrationPage, /lg:grid-cols-\[minmax\(0,0\.72fr\)_minmax\(320px,0\.46fr\)\]/);
});

test("shared input forwards responsive className values", () => {
  const inputSource = readSource("components/ui/input.tsx");

  assert.match(inputSource, /cn\([\s\S]*className/);
});
