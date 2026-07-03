import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) => readFileSync(path.join(projectRoot, relativePath), "utf8");

test("event registration hook switches to same-page CheckoutForm payment instead of redirecting", () => {
  const source = readSource("hooks/use-event-registration-form.ts");

  assert.match(source, /nextAction\s*===\s*"render_checkout"/);
  assert.match(source, /presentation\?\.kind\s*===\s*"iyzico_checkout_form"/);
  assert.doesNotMatch(source, /window\.location/);
});

test("event registration form renders the shared payment components", () => {
  const source = readSource("components/event-registration-form.tsx");

  assert.match(source, /IyzicoCheckoutForm/);
  assert.match(source, /PaymentStatusPanel/);
  assert.match(source, /data-testid="event-registration\.payment"/);
  assert.match(source, /providerPageUrl=\{payment\.presentation\.providerPageUrl\}/);
});

test("sales agreement consent is collected before the payment screen", () => {
  const source = readSource("components/event-registration-form.tsx");

  assert.match(source, /data-testid="event-registration\.field\.sales-agreement"/);
  assert.match(source, /payment\.sales_agreement\.label/);
  assert.match(source, /payment\.sales_agreement\.description/);
  assert.match(source, /requiresSalesAgreement/);
});

test("iyzico component renders provider markup without an extra consent gate", () => {
  const source = readSource("components/payments/iyzico-checkout-form.tsx");

  assert.doesNotMatch(source, /salesAgreementAccepted/);
  assert.doesNotMatch(source, /payment\.consent-gate/);
  assert.doesNotMatch(source, /payment\.sales-agreement-consent/);
  assert.match(source, /payment\.checkout-iframe-card/);
  assert.match(source, /payment\.checkout-iframe/);
  assert.match(source, /iframe/);
  assert.match(source, /checkoutContainerRef/);
  assert.match(source, /toInlineCheckoutFormContent/);
  assert.match(source, /hasCheckoutFormContent/);
  assert.match(source, /if \(!hasCheckoutFormContent && providerPageUrl\)/);
  assert.doesNotMatch(source, /if \(providerPageUrl\)/);
  assert.match(source, /iyzipay-checkout-form/);
  assert.match(source, /\\bpopup\\b/);
  assert.match(source, /responsive/);
  assert.match(source, /querySelectorAll\("script"\)/);
  assert.match(source, /document\.createElement\("script"\)/);
  assert.match(source, /script\.replaceWith\(executableScript\)/);
  assert.match(source, /data-testid="payment\.checkout-content"/);
});

test("retry proxy forwards retry requests through the backend route", () => {
  const source = readSource("app/api/payments/[attemptReference]/retry/route.ts");

  assert.match(source, /\/api\/payments\/\$\{encodeURIComponent\(attemptReference\)\}\/retry/);
  assert.match(source, /cache:\s*"no-store"/);
});
