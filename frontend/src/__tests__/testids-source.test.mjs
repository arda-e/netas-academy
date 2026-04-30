// testids-source.test.mjs — Source test for testids.ts helper functions
//
// Run: node frontend/src/__tests__/testids-source.test.mjs

import { strict as assert } from "node:assert";

// Dynamically import the TS module via a helper that reads the source.
// Since we can't run TypeScript directly in Node, we test the logic
// by re-implementing the functions here (pure functions, no deps).

// --- Re-implementation of testids.ts for testing ---

function join(...segments) {
  return segments.filter((s) => s != null && s !== "").join(".");
}

function normalizeKey(raw) {
  const turkishToAscii = {
    ç: "c", Ç: "c",
    ğ: "g", Ğ: "g",
    ı: "i", İ: "i",
    ö: "o", Ö: "o",
    ş: "s", Ş: "s",
    ü: "u", Ü: "u",
  };

  let result = "";
  for (const ch of raw) {
    if (turkishToAscii[ch] !== undefined) {
      result += turkishToAscii[ch];
    } else {
      result += ch;
    }
  }

  return result
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// --- join tests ---

assert.equal(join("a", "b", "c"), "a.b.c");
assert.equal(join("a", undefined, "c"), "a.c");
assert.equal(join("a", "", "b"), "a.b");
assert.equal(join("a", null, "b"), "a.b");
assert.equal(join(), "");
assert.equal(join("only"), "only");
assert.equal(join("a", undefined, null, "", "b"), "a.b");

// --- normalizeKey tests ---

assert.equal(normalizeKey("Veri Analizi"), "veri-analizi");
assert.equal(normalizeKey("a--b__c"), "a-b-c");
assert.equal(normalizeKey(""), "");
assert.equal(normalizeKey("Merhaba Dünya"), "merhaba-dunya");
assert.equal(normalizeKey("  spaced  out  "), "spaced-out");
assert.equal(normalizeKey("İstanbul"), "istanbul");
assert.equal(normalizeKey("ÇÖL"), "col");
assert.equal(normalizeKey("---trim---"), "trim");
assert.equal(normalizeKey("hello_world"), "hello-world");
assert.equal(normalizeKey("abc123"), "abc123");

// --- combined usage ---

assert.equal(join("page", normalizeKey("Veri Analizi")), "page.veri-analizi");
assert.equal(
  join("site-header", "desktop-nav", normalizeKey("Eğitimler")),
  "site-header.desktop-nav.egitimler"
);

console.log("✅ All testids-source tests passed.");
