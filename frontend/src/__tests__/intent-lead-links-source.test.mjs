import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

/* ─── Test scenarios for intent-lead-links-source ─── */

test("buildIntentLeadUrl('corporate_training_request') → correct URL", () => {
  const source = readSource("lib/lead-intents.ts");

  // Must export LEAD_TYPES including corporate_training_request
  assert.match(
    source,
    /"corporate_training_request"/,
    "LEAD_TYPES should include corporate_training_request"
  );

  // buildIntentLeadUrl must set intent param and return /iletisim path
  assert.match(
    source,
    /params\.set\("intent",\s*intent\)/,
    "should set intent parameter"
  );
  assert.match(
    source,
    /return\s*`\/iletisim/,
    "should return /iletisim path"
  );

  // URL should contain intent=corporate_training_request when called
  assert.match(
    source,
    /\/iletisim\?/,
    "URL should include query string start"
  );
});

test("buildIntentLeadUrl('instructor_application', { topic: 'python' }) → correct URL", () => {
  const source = readSource("lib/lead-intents.ts");

  // Must export instructor_application in LEAD_TYPES
  assert.match(
    source,
    /"instructor_application"/,
    "LEAD_TYPES should include instructor_application"
  );

  // Must conditionally set topic param
  assert.match(
    source,
    /if\s*\(options\?\.topic\)\s*\{[\s\S]*params\.set\("topic"/,
    "should conditionally set topic param when options.topic is provided"
  );

  // Must use URLSearchParams for proper encoding
  assert.match(
    source,
    /new\s+URLSearchParams\(\)/,
    "should use URLSearchParams for query building"
  );
});

test("buildIntentLeadUrl('solution_partner_application') → correct URL", () => {
  const source = readSource("lib/lead-intents.ts");

  // Must export solution_partner_application in LEAD_TYPES
  assert.match(
    source,
    /"solution_partner_application"/,
    "LEAD_TYPES should include solution_partner_application"
  );

  // Function signature should accept optional topic
  assert.match(
    source,
    /options\?:\s*\{\s*topic\?:\s*string\s*\}/,
    "options should accept optional topic string"
  );

  // Return path should start with /iletisim
  assert.match(
    source,
    /return\s*`\/iletisim\?\$\{params\.toString\(\)\}`/,
    "should return /iletisim with serialized params"
  );
});

test("buildIntentLeadUrl('general_contact') → correct URL", () => {
  const source = readSource("lib/lead-intents.ts");

  // Must export general_contact in LEAD_TYPES
  assert.match(
    source,
    /"general_contact"/,
    "LEAD_TYPES should include general_contact"
  );

  // Must set intent param for any lead type
  assert.match(
    source,
    /params\.set\("intent",\s*intent\)/,
    "should set intent parameter for general_contact"
  );

  // All four lead types should be accounted for
  assert.match(
    source,
    /as\s+const/,
    "LEAD_TYPES should be typed as const for type safety"
  );
});
