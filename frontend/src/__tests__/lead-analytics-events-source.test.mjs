import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

/* ─── Test scenarios for lead-analytics-events-source ─── */

test("emitLeadTabView('corporate_training_request') emits lead_tab_view with { leadType }", () => {
  const source = readSource("lib/analytics-events.ts");

  // Must define LeadTabViewEvent interface with lead_tab_view
  assert.match(
    source,
    /eventName:\s*"lead_tab_view"/,
    "LeadTabViewEvent should have eventName 'lead_tab_view'"
  );

  // Must have properties with leadType
  assert.match(
    source,
    /properties:\s*\{\s*leadType:\s*LeadType\s*\}/,
    "LeadTabViewEvent properties should include leadType"
  );

  // emitLeadTabView helper must exist and emit correct event
  assert.match(
    source,
    /export\s+function\s+emitLeadTabView/,
    "emitLeadTabView function should be exported"
  );
  assert.match(
    source,
    /emit\(\{?\s*eventName:\s*"lead_tab_view",?\s*properties:\s*\{\s*leadType\s*\}\s*\}\)/,
    "emitLeadTabView should emit lead_tab_view with leadType"
  );
});

test("emitLeadSubmitSuccess('instructor_application') emits lead_submit_success", () => {
  const source = readSource("lib/analytics-events.ts");

  // Must define LeadSubmitSuccessEvent interface
  assert.match(
    source,
    /eventName:\s*"lead_submit_success"/,
    "LeadSubmitSuccessEvent should have eventName 'lead_submit_success'"
  );

  // emitLeadSubmitSuccess helper must exist
  assert.match(
    source,
    /export\s+function\s+emitLeadSubmitSuccess/,
    "emitLeadSubmitSuccess function should be exported"
  );
  assert.match(
    source,
    /emit\(\{?\s*eventName:\s*"lead_submit_success",?\s*properties:\s*\{\s*leadType\s*\}\s*\}\)/,
    "emitLeadSubmitSuccess should emit lead_submit_success with leadType"
  );
});

test("emitLeadSubmitFail('corporate_training_request', 'validation_error') emits lead_submit_fail with reason only", () => {
  const source = readSource("lib/analytics-events.ts");

  // Must define LeadSubmitFailEvent interface with leadType and reason
  assert.match(
    source,
    /eventName:\s*"lead_submit_fail"/,
    "LeadSubmitFailEvent should have eventName 'lead_submit_fail'"
  );
  assert.match(
    source,
    /properties:\s*\{\s*leadType:\s*LeadType;\s*reason:\s*string\s*\}/,
    "LeadSubmitFailEvent properties should have leadType and reason (string) only"
  );

  // emitLeadSubmitFail helper must exist with correct signature
  assert.match(
    source,
    /export\s+function\s+emitLeadSubmitFail\(\s*leadType:\s*LeadType,\s*reason:\s*string\s*\)/,
    "emitLeadSubmitFail should accept leadType and reason parameters"
  );
  assert.match(
    source,
    /emit\(\{?\s*eventName:\s*"lead_submit_fail",?\s*properties:\s*\{\s*leadType,\s*reason\s*\}\s*\}\)/,
    "emitLeadSubmitFail should emit lead_submit_fail with leadType and reason"
  );

  // Properties must NOT include email, phone, fullName, or other PII
  assert.doesNotMatch(
    source,
    /properties:\s*\{[^}]*email/,
    "LeadSubmitFailEvent properties should not include email"
  );
});

test("emitHomeCorporateCtaClick emits home_corporate_cta_click with { source: 'home' }", () => {
  const source = readSource("lib/analytics-events.ts");

  assert.match(
    source,
    /eventName:\s*"home_corporate_cta_click"/,
    "HomeCorporateCtaClickEvent should have eventName 'home_corporate_cta_click'"
  );

  assert.match(
    source,
    /export\s+function\s+emitHomeCorporateCtaClick/,
    "emitHomeCorporateCtaClick function should be exported"
  );

  assert.match(
    source,
    /emit\(\{?\s*eventName:\s*"home_corporate_cta_click",?\s*properties:\s*\{\s*source:\s*"home"\s*\}\s*\}\)/,
    "emitHomeCorporateCtaClick should emit home_corporate_cta_click with { source: 'home' }"
  );
});

test("emitHomeEducationCtaClick emits home_education_cta_click with { source: 'home' }", () => {
  const source = readSource("lib/analytics-events.ts");

  assert.match(
    source,
    /eventName:\s*"home_education_cta_click"/,
    "HomeEducationCtaClickEvent should have eventName 'home_education_cta_click'"
  );

  assert.match(
    source,
    /export\s+function\s+emitHomeEducationCtaClick/,
    "emitHomeEducationCtaClick function should be exported"
  );

  assert.match(
    source,
    /emit\(\{?\s*eventName:\s*"home_education_cta_click",?\s*properties:\s*\{\s*source:\s*"home"\s*\}\s*\}\)/,
    "emitHomeEducationCtaClick should emit home_education_cta_click with { source: 'home' }"
  );
});

test("emitAboutCorporateCtaClick emits about_corporate_cta_click with { source: 'about' }", () => {
  const source = readSource("lib/analytics-events.ts");

  assert.match(
    source,
    /eventName:\s*"about_corporate_cta_click"/,
    "AboutCorporateCtaClickEvent should have eventName 'about_corporate_cta_click'"
  );

  assert.match(
    source,
    /export\s+function\s+emitAboutCorporateCtaClick/,
    "emitAboutCorporateCtaClick function should be exported"
  );

  assert.match(
    source,
    /emit\(\{?\s*eventName:\s*"about_corporate_cta_click",?\s*properties:\s*\{\s*source:\s*"about"\s*\}\s*\}\)/,
    "emitAboutCorporateCtaClick should emit about_corporate_cta_click with { source: 'about' }"
  );
});

test("emitAboutEducationCtaClick emits about_education_cta_click with { source: 'about' }", () => {
  const source = readSource("lib/analytics-events.ts");

  assert.match(
    source,
    /eventName:\s*"about_education_cta_click"/,
    "AboutEducationCtaClickEvent should have eventName 'about_education_cta_click'"
  );

  assert.match(
    source,
    /export\s+function\s+emitAboutEducationCtaClick/,
    "emitAboutEducationCtaClick function should be exported"
  );

  assert.match(
    source,
    /emit\(\{?\s*eventName:\s*"about_education_cta_click",?\s*properties:\s*\{\s*source:\s*"about"\s*\}\s*\}\)/,
    "emitAboutEducationCtaClick should emit about_education_cta_click with { source: 'about' }"
  );
});

test("No PII (email, phone, fullName) appears in any event properties including new CTA events", () => {
  const source = readSource("lib/analytics-events.ts");

  // Extract all properties blocks (between "properties: {" and "}")
  const propertiesBlocks = source.match(/properties:\s*\{[^}]+\}/g) || [];

  for (const block of propertiesBlocks) {
    assert.doesNotMatch(
      block,
      /\bemail\b/,
      `PII field 'email' should not appear in properties: ${block}`
    );
    assert.doesNotMatch(
      block,
      /\bphone\b/,
      `PII field 'phone' should not appear in properties: ${block}`
    );
    assert.doesNotMatch(
      block,
      /\bfullName\b/,
      `PII field 'fullName' should not appear in properties: ${block}`
    );
    assert.doesNotMatch(
      block,
      /\bcompany\b/,
      `PII field 'company' should not appear in properties: ${block}`
    );
    assert.doesNotMatch(
      block,
      /\bmessage\b/,
      `PII field 'message' should not appear in properties: ${block}`
    );
  }
});
