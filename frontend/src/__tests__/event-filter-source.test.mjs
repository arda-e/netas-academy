import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("getEvents adds filters[eventType][$eq] to query when eventType is provided", () => {
  const source = readSource("lib/strapi-events.ts");

  assert.match(
    source,
    /filters\[eventType\]\[\$eq\]/,
    "getEvents should use Strapi filters[eventType][$eq] query param"
  );
});

test("getEvents no longer uses client-side Array.filter for eventType", () => {
  const source = readSource("lib/strapi-events.ts");

  const clientFilterPattern = /\.filter\s*\(\s*\(event\)\s*=>\s*normalizeEventType/;
  assert.ok(
    !clientFilterPattern.test(source),
    "getEvents should NOT use client-side Array.filter for eventType"
  );
});

test("getEvents returns response.data directly after fetch when using server-side filter", () => {
  const source = readSource("lib/strapi-events.ts");

  assert.match(
    source,
    /return\s+response\.data/,
    "getEvents should return response.data directly"
  );
});

test("getEvents encodes eventType in filter param using encodeURIComponent", () => {
  const source = readSource("lib/strapi-events.ts");

  assert.match(
    source,
    /encodeURIComponent\(appliedEventType\)/,
    "eventType filter value should be URL-encoded"
  );
});

test("getEvents does not include eventType filter when eventType is null/undefined", () => {
  const source = readSource("lib/strapi-events.ts");

  assert.match(
    source,
    /appliedEventType\s*\?\s*`&filters/,
    "eventType filter should be conditionally added only when eventType is provided"
  );
});

test("getEvents uses normalizeEventType on the provided eventType before filtering", () => {
  const source = readSource("lib/strapi-events.ts");

  assert.match(
    source,
    /normalizeEventType\(eventType\)/,
    "eventType should be normalized before constructing the filter"
  );
});

test("getEvents preserves existing query params (pagination, sort, fields, populate)", () => {
  const source = readSource("lib/strapi-events.ts");

  assert.match(
    source,
    /pagination\[pageSize\]=100/,
    "pagination should be preserved"
  );

  assert.match(
    source,
    /sort\[0\]=\$\{eventSort\}/,
    "sort should be preserved"
  );

  assert.match(
    source,
    /populate\[course\]/,
    "populate should be preserved"
  );
});
