// form-testids-source.test.mjs — Source test for form component data-testid attributes
//
// Run: node frontend/src/__tests__/form-testids-source.test.mjs

import { strict as assert } from "node:assert";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, "..");

function readSource(relativePath) {
  const fullPath = join(srcDir, relativePath);
  if (!existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  return readFileSync(fullPath, "utf-8");
}

// --- event-registration-form.tsx ---

const eventRegForm = readSource("components/event-registration-form.tsx");
assert.ok(
  eventRegForm.includes(`data-testid="event-registration.form"`),
  "event-registration-form.tsx should contain data-testid=\"event-registration.form\""
);
assert.ok(
  eventRegForm.includes(`id="firstName"`),
  "event-registration-form.tsx should still contain id=\"firstName\" (preserved)"
);
assert.ok(
  eventRegForm.includes(`htmlFor="firstName"`),
  "event-registration-form.tsx should still contain htmlFor=\"firstName\" (preserved)"
);

// --- newsletter-subscription-form.tsx ---

const newsletterForm = readSource("components/newsletter-subscription-form.tsx");
assert.ok(
  newsletterForm.includes(`id="newsletter-email"`),
  "newsletter-subscription-form.tsx should contain id=\"newsletter-email\" (newly added)"
);
assert.ok(
  newsletterForm.includes(`htmlFor="newsletter-email"`),
  "newsletter-subscription-form.tsx should contain htmlFor=\"newsletter-email\" (newly added)"
);

// --- intent-lead-form.tsx ---

const intentLeadForm = readSource("components/contact/intent-lead-form.tsx");
assert.ok(
  intentLeadForm.includes(`data-testid="contact-lead.form"`),
  "intent-lead-form.tsx should contain data-testid=\"contact-lead.form\""
);
assert.ok(
  intentLeadForm.includes(`id="fullName"`),
  "intent-lead-form.tsx should still contain id=\"fullName\" (preserved)"
);

console.log("✅ All form testids tests passed.");
