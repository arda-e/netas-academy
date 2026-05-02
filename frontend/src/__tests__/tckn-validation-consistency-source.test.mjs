// tckn-validation-consistency-source.test.mjs — Source test for TCKN validation algorithm
//
// Verifies the TCKN checksum algorithm against a fixed set of inputs.
// Must match the backend copy in backend/tests/unit/utils/tckn-validation-consistency.test.ts
//
// Run: node --experimental-test-coverage --test-reporter=spec frontend/src/__tests__/tckn-validation-consistency-source.test.mjs

import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * Inline re-implementation of the TCKN validation algorithm from
 * frontend/src/lib/tckn.ts. Kept synchronized with the backend copy
 * at backend/src/utils/tckn.ts.
 */
function isValidTckn(value) {
  const digits = value.trim().replace(/\s+/g, "");

  if (!/^\d{11}$/.test(digits) || digits[0] === "0") {
    return false;
  }

  const numbers = digits.split("").map((d) => Number(d));
  const oddSum =
    numbers[0] + numbers[2] + numbers[4] + numbers[6] + numbers[8];
  const evenSum = numbers[1] + numbers[3] + numbers[5] + numbers[7];

  const tenthDigit = (((oddSum * 7 - evenSum) % 10) + 10) % 10;
  const eleventhDigit =
    numbers.slice(0, 10).reduce((sum, d) => sum + d, 0) % 10;

  return numbers[9] === tenthDigit && numbers[10] === eleventhDigit;
}

/**
 * Test vectors shared with backend/tests/unit/utils/tckn-validation-consistency.test.ts.
 * Any change here must be mirrored in the backend test.
 */
const testVectors = [
  // ── valid ───────────────────────────────────────────────────────
  { input: "12345678950", expected: true, reason: "known valid checksum (prefix 123456789)" },
  { input: "10000000146", expected: true, reason: "Atatürk TCKN" },
  { input: "98765432150", expected: true, reason: "valid algorithmic TCKN (prefix 987654321)" },
  { input: "123 456 789 50", expected: true, reason: "spaces removed by normalization, same checksum" },

  // ── invalid ─────────────────────────────────────────────────────
  { input: "00000000000", expected: false, reason: "first digit cannot be 0" },
  { input: "1234567890", expected: false, reason: "too short (10 digits)" },
  { input: "123456789012", expected: false, reason: "too long (12 digits)" },
  { input: "1234567890a", expected: false, reason: "non-numeric" },
  { input: "11111111111", expected: false, reason: "all same digit — fails checksum" },
];

describe("TCKN validation algorithm (frontend)", () => {
  for (const { input, expected, reason } of testVectors) {
    it(`isValidTckn("${input}") === ${expected} (${reason})`, () => {
      assert.strictEqual(
        isValidTckn(input),
        expected,
        `isValidTckn("${input}") should be ${expected} — ${reason}`
      );
    });
  }
});
