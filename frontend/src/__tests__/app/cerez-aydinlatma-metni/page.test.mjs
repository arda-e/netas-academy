import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test('Cookie notice page renders with correct title "Çerez Aydınlatma Metni | Netas Academy"', () => {
  const source = readSource("app/[locale]/cerez-aydinlatma-metni/page.tsx");
  assert.match(
    source,
    /title:\s*"Çerez Aydınlatma Metni \| Netas Academy"/,
    "Cookie notice page should have the expected metadata title"
  );
});

test("Cookie notice page contains the page root data-testid", () => {
  const source = readSource("app/[locale]/cerez-aydinlatma-metni/page.tsx");
  assert.match(
    source,
    /data-testid="page\.cookie-notice"/,
    "Cookie notice page should have data-testid='page.cookie-notice'"
  );
});

test("Cookie notice page imports the structured content file", () => {
  const source = readSource("app/[locale]/cerez-aydinlatma-metni/page.tsx");
  assert.match(
    source,
    /import cookieNoticeData from "@\/data\/cerez-aydinlatma-metni\.json"/,
    "Cookie notice page should import the structured JSON content"
  );
});

test("Cookie notice page references the expected route and legal sections", () => {
  const source = readSource("app/[locale]/cerez-aydinlatma-metni/page.tsx");
  const data = readSource("data/cerez-aydinlatma-metni.json");
  assert.match(
    source,
    /buildLocalePath\(locale, "\/cerez-aydinlatma-metni"\)/,
    "Cookie notice page should build the localized canonical path"
  );
  assert.match(
    source,
    /Çerez Aydınlatma Metni/,
    "Cookie notice page should contain the legal page title text"
  );
  assert.match(
    data,
    /Tarayıcı depolaması ve çerez farkı/,
    "Cookie notice data file should contain the browser storage explanation section"
  );
  assert.match(
    source,
    /CookieNoticeBackButton/,
    "Cookie notice page should include the legal back button"
  );
});
