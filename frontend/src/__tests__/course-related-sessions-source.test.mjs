import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Course related sessions section partitions by comparison timestamp", () => {
  const source = readSource("components/courses/course-related-sessions-section.tsx");
  assert.match(source, /new Date\(event\.startsAt\)\s*>\s*now/);
  assert.match(source, /new Date\(event\.startsAt\)\s*<=\s*now/);
});

test("Course related sessions section keeps fallback contact flow", () => {
  const source = readSource("components/courses/course-related-sessions-section.tsx");
  assert.match(source, /buildIntentLeadUrl\("general_contact"\)/);
  assert.match(source, /fallbackCtaLabel/);
  assert.match(source, /noUpcomingSessions/);
});

test("Course related sessions section preserves upcoming and past labels", () => {
  const source = readSource("components/courses/course-related-sessions-section.tsx");
  assert.match(source, /copy:/);
  assert.match(source, /upcomingSessionRegisterCta/);
  assert.match(source, /upcomingSessionClosedLabel/);
  assert.match(source, /pastSessionsLabel/);
  assert.match(source, /labels:/);
  assert.match(source, /formats:/);
});
