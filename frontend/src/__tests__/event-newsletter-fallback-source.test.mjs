import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Closed event shows newsletter CTA instead of registration", () => {
  const source = readSource("components/events/registration-status-button.tsx");
  assert.match(
    source,
    /status\?\.isOpen/,
    "RegistrationStatusButton should branch on the live registration status"
  );
});

test("Closed event renders NewsletterSubscriptionForm with source", () => {
  const source = readSource("components/events/registration-status-button.tsx");
  assert.match(
    source,
    /<NewsletterSubscriptionForm\s+source="event_closed_registration"/,
    "Closed event should show NewsletterSubscriptionForm with event_closed_registration source"
  );
});

test("Closed event shows explanatory message about registration", () => {
  const source = readSource("components/events/registration-status-button.tsx");
  assert.match(
    source,
    /registrationClosedNotice/,
    "Closed event should receive the translated closed-registration notice"
  );
});

test("NewsletterSubscriptionForm component exists and accepts source prop", () => {
  const source = readSource("components/newsletter-subscription-form.tsx");
  assert.match(
    source,
    /source\?:\s*string/,
    "NewsletterSubscriptionForm should accept optional source prop"
  );
});

test("NewsletterSubscriptionForm posts to subscribe endpoint", () => {
  const source = readSource("components/newsletter-subscription-form.tsx");
  assert.match(
    source,
    /\/api\/newsletter-subscriptions\/subscribe/,
    "NewsletterSubscriptionForm should POST to newsletter subscription endpoint"
  );
});

test("NewsletterSubscriptionForm includes source in payload", () => {
  const source = readSource("components/newsletter-subscription-form.tsx");
  assert.match(
    source,
    /sourceContentType:\s*source\s*\?\?\s*null/,
    "NewsletterSubscriptionForm should include source in request body"
  );
});

test("NewsletterSubscriptionForm submits backend-required consent", () => {
  const source = readSource("components/newsletter-subscription-form.tsx");
  assert.match(
    source,
    /consentAccepted:\s*true/,
    "NewsletterSubscriptionForm should satisfy the backend consent validation contract"
  );
  assert.match(
    source,
    /consentTextSnapshot:\s*t\('consent\.disclaimer'\)/,
    "NewsletterSubscriptionForm should store the displayed consent text snapshot"
  );
});

test("NewsletterSubscriptionForm shows consent disclaimer under the email input", () => {
  const source = readSource("components/newsletter-subscription-form.tsx");
  assert.match(
    source,
    /data-testid="newsletter\.consent-disclaimer"/,
    "NewsletterSubscriptionForm should render a visible consent disclaimer"
  );
  assert.match(
    source,
    /t\('consent\.disclaimer'\)/,
    "NewsletterSubscriptionForm should use translated consent disclaimer copy"
  );
});
