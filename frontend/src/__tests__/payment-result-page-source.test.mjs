import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) => readFileSync(path.join(projectRoot, relativePath), "utf8");

test("payment result page renders backend-finalized callback outcomes", () => {
  const source = readSource("app/[locale]/odeme-sonucu/page.tsx");

  assert.match(source, /data-testid="page\.payment-result"/);
  assert.match(source, /attemptReference/);
  assert.match(source, /resolveStatus/);
  assert.match(source, /status === "paid"/);
  assert.match(source, /status === "failed"/);
  assert.match(source, /status === "cancelled"/);
  assert.match(source, /return "pending"/);
  assert.match(source, /payment_result/);
  assert.doesNotMatch(source, /handleCallbackResult/);
  assert.doesNotMatch(source, /IYZICO_SECRET_KEY/);
});

test("payment result messages exist in Turkish and English", () => {
  const trMessages = JSON.parse(readSource("messages/tr.json"));
  const enMessages = JSON.parse(readSource("messages/en.json"));

  for (const messages of [trMessages, enMessages]) {
    assert.ok(messages.payment_result.meta.title);
    assert.ok(messages.payment_result.hero.title);
    assert.ok(messages.payment_result.status.paid.title);
    assert.ok(messages.payment_result.status.failed.title);
    assert.ok(messages.payment_result.status.cancelled.title);
    assert.ok(messages.payment_result.status.pending.title);
    assert.ok(messages.payment_result.actions.events);
    assert.ok(messages.payment_result.actions.contact);
  }
});
