import { describe, expect, it } from "vitest";

import { isValidTckn } from "../../../src/utils/tckn";

/**
 * Test vectors shared with frontend/src/__tests__/tckn-validation-consistency-source.test.mjs.
 * Any change here must be mirrored in the frontend test.
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

describe("TCKN validation algorithm (backend)", () => {
  for (const { input, expected, reason } of testVectors) {
    it(`isValidTckn("${input}") === ${expected} (${reason})`, () => {
      expect(isValidTckn(input)).toBe(expected);
    });
  }
});
