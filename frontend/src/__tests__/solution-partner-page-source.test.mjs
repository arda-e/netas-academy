import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("Page contains main message 'Eğitim ve danışmanlık alanında birlikte yeni değer üretelim'", () => {
  const source = readSource("app/cozum-ortagi/page.tsx");
  assert.match(
    source,
    /Eğitim ve danışmanlık alanında birlikte yeni değer üretelim/i,
    "Page should contain the main collaboration value message"
  );
});

test("Page shows all four collaboration areas", () => {
  const source = readSource("app/cozum-ortagi/page.tsx");
  assert.match(
    source,
    /Eğitim Programları/i,
    "Should include Eğitim Programları"
  );
  assert.match(
    source,
    /Danışmanlık Hizmetleri/i,
    "Should include Danışmanlık Hizmetleri"
  );
  assert.match(
    source,
    /Workshop ve Fasilitasyon/i,
    "Should include Workshop ve Fasilitasyon"
  );
  assert.match(
    source,
    /Sektörel.*Konu Bazlı Uzmanlık/i,
    "Should include Sektörel/Konu Bazlı Uzmanlık"
  );
});

test("CTA uses buildIntentLeadUrl('solution_partner_application')", () => {
  const source = readSource("app/cozum-ortagi/page.tsx");
  assert.match(
    source,
    /buildIntentLeadUrl\("solution_partner_application"\)/,
    "CTA should use buildIntentLeadUrl with solution_partner_application"
  );
});

test("Page does NOT contain 'Kimler başvurabilir'", () => {
  const source = readSource("app/cozum-ortagi/page.tsx");
  assert.doesNotMatch(
    source,
    /Kimler başvurabilir/i,
    "Page should not contain 'Kimler başvurabilir'"
  );
});

test("Page does NOT contain high-promise language (acceptance, response time, matching)", () => {
  const source = readSource("app/cozum-ortagi/page.tsx");
  assert.doesNotMatch(
    source,
    /kabul edilir|cevap süresi|eşleştirme|onaylanma|garanti/i,
    "Page should not contain high-promise language"
  );
});
