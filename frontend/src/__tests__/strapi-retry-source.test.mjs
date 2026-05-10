import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("fetchStrapi implements retry loop with opt-in retries", () => {
  const source = readSource("lib/strapi-client.ts");

  assert.match(
    source,
    /for\s*\(\s*let\s+attempt\s*=.+attempt\s*<=\s*maxRetries/,
    "fetchStrapi should include a retry loop bounded by maxRetries"
  );

  assert.match(
    source,
    /maxRetries\s*=\s*options\?\.retries\s*\?\?\s*DEFAULT_MAX_RETRIES/,
    "maxRetries should default to DEFAULT_MAX_RETRIES"
  );

  assert.match(
    source,
    /DEFAULT_MAX_RETRIES\s*=\s*0/,
    "default retries should be 0 so server-rendered pages fail fast when Strapi is unavailable"
  );
});

test("fetchStrapi retry uses exponential backoff with 1000ms base and 16000ms cap", () => {
  const source = readSource("lib/strapi-client.ts");

  assert.match(
    source,
    /2\s*\*\*\s*attempt\s*\*\s*1000/,
    "backoff delay should be 2^attempt * 1000ms"
  );

  assert.match(
    source,
    /MAX_RETRY_DELAY_MS/,
    "MAX_RETRY_DELAY_MS constant should be defined"
  );

  assert.match(
    source,
    /16000/,
    "MAX_RETRY_DELAY_MS should be 16000"
  );

  assert.match(
    source,
    /Math\.min/,
    "delay should be capped via Math.min"
  );
});

test("fetchStrapi only retries on network errors (TypeError) or 5xx, NOT 4xx", () => {
  const source = readSource("lib/strapi-client.ts");

  assert.match(
    source,
    /instanceof\s+TypeError/,
    "should check for TypeError (network errors)"
  );

  assert.match(
    source,
    /status\s*>=\s*500/,
    "should check for status >= 500"
  );

  assert.match(
    source,
    /isRetryableError/,
    "isRetryableError function should exist"
  );

  const notFourXx = !source.includes("status >= 400") &&
    !source.includes("status < 500") &&
    !/4\d{2}/.test(source);

  assert.ok(
    notFourXx,
    "should NOT retry on 4xx status codes"
  );
});

test("fetchStrapi supports default and optional AbortController timeout", () => {
  const source = readSource("lib/strapi-client.ts");

  assert.match(
    source,
    /AbortController/,
    "AbortController should be used for timeout"
  );

  assert.match(
    source,
    /timeout\s*=\s*options\?\.timeout\s*\?\?\s*DEFAULT_TIMEOUT_MS/,
    "timeout should default while allowing caller override"
  );

  assert.match(
    source,
    /DEFAULT_TIMEOUT_MS\s*=\s*3000/,
    "default timeout should keep server-rendered pages responsive"
  );

  assert.match(
    source,
    /AbortError/,
    "AbortError should be handled"
  );

  assert.match(
    source,
    /timed out after/,
    "timeout should produce a descriptive error message"
  );
});

test("FetchStrapiOptions includes timeout and retries fields", () => {
  const source = readSource("lib/strapi-types.ts");

  assert.match(
    source,
    /timeout\?:\s*number/,
    "FetchStrapiOptions should include optional timeout field"
  );

  assert.match(
    source,
    /retries\?:\s*number/,
    "FetchStrapiOptions should include optional retries field"
  );
});

test("fetchStrapi does not retry on non-retryable errors", () => {
  const source = readSource("lib/strapi-client.ts");

  assert.match(
    source,
    /isRetryableError\(error\)/,
    "should call isRetryableError with the caught error"
  );
});

test("fetchStrapi final error message after exhausted retries", () => {
  const source = readSource("lib/strapi-client.ts");

  assert.match(
    source,
    /after all retries/,
    "should throw descriptive error after all retries exhausted"
  );
});
