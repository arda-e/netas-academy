import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("payment orchestration routes", () => {
  it("exposes retry, callback, and webhook routes without public ledger reads", () => {
    const customRouteFile = readFileSync(
      new URL("../../../src/api/payment-orchestration/routes/custom-payment-orchestration.ts", import.meta.url),
      "utf8",
    );

    expect(customRouteFile).toContain('path: "/payments/:attemptReference/retry"');
    expect(customRouteFile).toContain('path: "/payments/iyzico/callback"');
    expect(customRouteFile).toContain('path: "/payments/iyzico/webhook"');
    expect(customRouteFile).toContain("auth: false");
  });
});
