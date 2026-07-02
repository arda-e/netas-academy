import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("payment content type public permissions", () => {
  it("does not grant public read access to payment ledgers", () => {
    const bootstrapFile = readFileSync(new URL("../../../src/index.ts", import.meta.url), "utf8");

    expect(bootstrapFile).toContain("const PUBLIC_READ_ACTIONS = [");
    expect(bootstrapFile).not.toContain("api::payment-attempt.payment-attempt.find");
    expect(bootstrapFile).not.toContain("api::payment-attempt.payment-attempt.findOne");
    expect(bootstrapFile).not.toContain("api::payment-provider-event.payment-provider-event.find");
    expect(bootstrapFile).not.toContain("api::payment-provider-event.payment-provider-event.findOne");
  });
});
