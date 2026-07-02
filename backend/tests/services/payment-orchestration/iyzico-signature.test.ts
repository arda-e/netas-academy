import { describe, expect, it } from "vitest";

import {
  createIyzicoWebhookSignature,
  verifyIyzicoWebhookSignature,
} from "../../../src/services/payment-orchestration/iyzico/signature";

describe("iyzico webhook signature", () => {
  it("accepts a valid HMAC signature", () => {
    const payload = JSON.stringify({ token: "checkout-token", status: "SUCCESS" });
    const signature = createIyzicoWebhookSignature(payload, "webhook-secret");

    expect(verifyIyzicoWebhookSignature({ payload, signature, secret: "webhook-secret" })).toEqual({
      valid: true,
      metadata: { algorithm: "hmac-sha256", keyId: null },
    });
  });

  it("rejects missing and invalid signatures without exposing the secret", () => {
    const missing = verifyIyzicoWebhookSignature({ payload: "{}", signature: "", secret: "webhook-secret" });
    const invalid = verifyIyzicoWebhookSignature({ payload: "{}", signature: "not-valid", secret: "webhook-secret" });

    expect(missing).toMatchObject({ valid: false, reason: "missing_signature" });
    expect(invalid).toMatchObject({ valid: false, reason: "invalid_signature" });
    expect(JSON.stringify(missing)).not.toContain("webhook-secret");
    expect(JSON.stringify(invalid)).not.toContain("webhook-secret");
  });
});
