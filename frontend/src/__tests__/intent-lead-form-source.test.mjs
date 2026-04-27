import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

/* ─── Test scenarios 1-7: Schema shape assertions via source ─── */

test("corporate training schema requires interestTopic", () => {
  const source = readSource("lib/lead-intents.ts");

  // Must extend baseSchema with interestTopic
  assert.match(
    source,
    /corporate_training_request:\s*baseSchema\.extend\(\{[\s\S]*interestTopic:\s*z\.string\(\)\.min\(1/,
    "corporate_training_request should extend baseSchema with interestTopic"
  );
});

test("instructor schema requires expertiseAreas", () => {
  const source = readSource("lib/lead-intents.ts");

  assert.match(
    source,
    /instructor_application:\s*baseSchema\.extend\(\{[\s\S]*expertiseAreas:\s*z\.string\(\)\.min\(1/,
    "instructor_application should extend baseSchema with expertiseAreas"
  );
});

test("solution partner schema requires companySize", () => {
  const source = readSource("lib/lead-intents.ts");

  assert.match(
    source,
    /solution_partner_application:\s*baseSchema\.extend\(\{[\s\S]*companySize:\s*z\.string\(\)\.min\(1/,
    "solution_partner_application should extend baseSchema with companySize"
  );
});

test("general contact schema is baseSchema only (no type-specific fields)", () => {
  const source = readSource("lib/lead-intents.ts");

  // general_contact should map directly to baseSchema without extend
  assert.match(
    source,
    /general_contact:\s*baseSchema\b(?!\.extend)/,
    "general_contact should be baseSchema without .extend()"
  );
});

test("baseSchema requires fullName, email, phone, message", () => {
  const source = readSource("lib/lead-intents.ts");

  assert.match(
    source,
    /fullName:\s*z\.string\(\)\.min\(1/,
    "baseSchema should require fullName"
  );
  assert.match(
    source,
    /email:\s*z\.string\(\)\.email\(/,
    "baseSchema should validate email"
  );
  assert.match(
    source,
    /phone:\s*z\.string\(\)\.min\(1/,
    "baseSchema should require phone"
  );
  assert.match(
    source,
    /message:\s*z\.string\(\)\.min\(1/,
    "baseSchema should require message"
  );
  assert.match(
    source,
    /company:\s*z\.string\(\)\.optional\(\)/,
    "baseSchema should make company optional"
  );
});

/* ─── Test scenarios 8-9: buildIntentLeadUrl output ─── */

test("buildIntentLeadUrl produces correct query strings", () => {
  const source = readSource("lib/lead-intents.ts");

  // Function must set intent param
  assert.match(
    source,
    /params\.set\("intent",\s*intent\)/,
    "buildIntentLeadUrl should set intent param"
  );

  // Function must conditionally set topic
  assert.match(
    source,
    /if\s*\(options\?\.topic\)\s*\{[\s\S]*params\.set\("topic"/,
    "buildIntentLeadUrl should conditionally set topic param"
  );

  // Return path should start with /iletisim
  assert.match(
    source,
    /return\s*`\/iletisim/,
    "buildIntentLeadUrl should return /iletisim path"
  );
});

/* ─── Additional: submitted payload shape assertions ─── */

test("submitted payload includes leadType and excludes frontend-only attribution", () => {
  const source = readSource("components/contact/intent-lead-form.tsx");

  // Payload must include leadType
  assert.match(
    source,
    /leadType,/,
    "payload must include leadType"
  );

  // No contextType or contextSlug (frontend-only attribution fields)
  assert.doesNotMatch(
    source,
    /contextType/,
    "payload must not include contextType"
  );
  assert.doesNotMatch(
    source,
    /contextSlug/,
    "payload must not include contextSlug"
  );
});
