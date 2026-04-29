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
  const source = readSource("app/etkinlikler/[slug]/page.tsx");
  assert.match(
    source,
    /registrationOpen\s*\?/,
    "EventInformationPanel should branch on registrationOpen"
  );
});

test("Closed event renders NewsletterSubscriptionForm with source", () => {
  const source = readSource("app/etkinlikler/[slug]/page.tsx");
  assert.match(
    source,
    /<NewsletterSubscriptionForm\s+source="event_closed_registration"/,
    "Closed event should show NewsletterSubscriptionForm with event_closed_registration source"
  );
});

test("Closed event shows explanatory message about registration", () => {
  const source = readSource("app/etkinlikler/[slug]/page.tsx");
  assert.match(
    source,
    /Bu etkinliğin kayıtları şu an kapalı/,
    "Closed event should explain registration is closed"
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
    /source/,
    "NewsletterSubscriptionForm should include source in request body"
  );
});
