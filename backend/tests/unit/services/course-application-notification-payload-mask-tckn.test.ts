import { describe, expect, it } from "vitest";

import { maskTcknValue } from "../../../src/utils/tckn";

describe("course application notification TCKN masking", () => {
  it("keeps only the last 4 digits of a normalized TCKN", () => {
    expect(maskTcknValue("12345678901")).toBe("*******8901");
    expect(maskTcknValue("123 456 789 01")).toBe("*******8901");
  });

  it("fully masks short or missing TCKN values", () => {
    expect(maskTcknValue("123")).toBe("****");
    expect(maskTcknValue("")).toBe("****");
    expect(maskTcknValue(null)).toBe("****");
  });
});
