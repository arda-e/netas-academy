import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("EventList component maps items with summary and date", () => {
  const source = readSource("components/content/events.tsx");
  assert.match(
    source,
    /event\.summary/,
    "EventList should pass event.summary to ContentCardShell"
  );
  assert.match(
    source,
    /formatEventDateTime\(event\.startsAt\)/,
    "EventList should format event.startsAt for display"
  );
});

test("EventList passes kicker from formatEventType before title", () => {
  const source = readSource("components/content/events.tsx");
  assert.match(
    source,
    /content=\{\s*\{[\s\S]*kicker:\s*getEventTypeLabel\(tx, event\.eventType\)/,
    "EventList should pass event type inside the grouped content prop"
  );
});

test("EventList includes topicArea in EventListItem type", () => {
  const source = readSource("components/content/events.tsx");
  assert.match(
    source,
    /topicArea\?:\s*string\s*\|\s*null/,
    "EventListItem type should include topicArea field"
  );
});

test("getEventBySlug query includes details field", () => {
  const source = readSource("lib/strapi-events.ts");
  assert.match(
    source,
    /fields\[8\]=details/,
    "getEventBySlug query should request the details field"
  );
});

test("Etkinlikler page passes topicArea to EventList items", () => {
  const source = readSource("app/[locale]/etkinlikler/page.tsx");
  assert.match(
    source,
    /topicArea:\s*event\.topicArea/,
    "Page should pass topicArea from event data to EventList items"
  );
});
