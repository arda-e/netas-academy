import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("event registration form validates on blur and clamps numeric-only inputs", () => {
  const hookSource = readSource("hooks/use-event-registration-form.ts");
  const formSource = readSource("components/event-registration-form.tsx");

  assert.match(hookSource, /fieldErrors/);
  assert.match(hookSource, /handleFieldBlur/);
  assert.match(hookSource, /replace\(\/\\D\/g,\s*""\)/);
  assert.match(
    hookSource,
    /lastName:\s*z[\s\S]*?\.string\(\)[\s\S]*?\.min\(2,\s*t\("validation\.last_name_min_2"\)\)[\s\S]*?\.max\(20,\s*t\("validation\.last_name_max_20"\)\)/,
  );
  assert.match(hookSource, /setFieldErrors\(nextFieldErrors\)/);
  assert.match(hookSource, /salesAgreementAccepted/);
  assert.match(hookSource, /requiresSalesAgreement/);
  assert.match(hookSource, /validation\.sales_agreement_required/);

  const blurHandlers = formSource.match(/onBlur=\{handleFieldBlur\}/g) ?? [];
  assert.equal(
    blurHandlers.length,
    4,
    "event-registration-form.tsx should attach handleFieldBlur to first name, last name, phone, and TCKN"
  );
  assert.match(formSource, /name="lastName"[\s\S]*maxLength=\{20\}/);
  assert.match(formSource, /name="phone"[\s\S]*type="text"[\s\S]*inputMode="numeric"[\s\S]*pattern="\[0-9\]\*"/);
  assert.match(formSource, /name="tckn"[\s\S]*inputMode="numeric"[\s\S]*pattern="\[0-9\]\*"/);
  assert.match(formSource, /name="salesAgreementAccepted"/);
  assert.match(formSource, /data-testid="event-registration\.field\.sales-agreement"/);
});

test("event registration validation copy includes surname minimum and numeric phone rule", () => {
  const trMessages = readSource("messages/tr.json");
  const enMessages = readSource("messages/en.json");

  assert.match(trMessages, /"last_name_min_2":\s*"Soyad alani en az 2 karakter olmalidir\."/);
  assert.match(trMessages, /"last_name_max_20":\s*"Soyad alani en fazla 20 karakter olabilir\."/);
  assert.match(trMessages, /"phone_invalid":\s*"Telefon numarasi yalnizca rakamlardan olusabilir\."/);
  assert.match(enMessages, /"last_name_min_2":\s*"Last name must be at least 2 characters\."/);
  assert.match(enMessages, /"last_name_max_20":\s*"Last name can be at most 20 characters\."/);
  assert.match(enMessages, /"phone_invalid":\s*"Phone number may contain digits only\."/);
});
