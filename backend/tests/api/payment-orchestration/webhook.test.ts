import { describe, expect, it, vi } from "vitest";

import { createIyzicoWebhookSignature } from "../../../src/services/payment-orchestration/iyzico/signature";
import { handleWebhookEvent } from "../../../src/services/payment-orchestration/service";

describe("payment orchestration webhook", () => {
  function makeStrapi() {
    const paymentAttempt = {
      findOne: vi.fn().mockResolvedValue({
        id: 10,
        attemptReference: "pay_123",
        parentType: "registration",
        parentEntityId: 42,
        status: "checkout_created",
      }),
      update: vi.fn().mockResolvedValue({}),
    };
    const providerEvent = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 20 }),
    };
    return {
      db: {
        query: vi.fn((uid: string) => {
          if (uid === "api::payment-attempt.payment-attempt") return paymentAttempt;
          if (uid === "api::payment-provider-event.payment-provider-event") return providerEvent;
          throw new Error(`Unexpected uid: ${uid}`);
        }),
      },
      service: vi.fn().mockReturnValue({ completePaidRegistration: vi.fn() }),
      __queries: { paymentAttempt, providerEvent },
    };
  }

  const config = {
    environment: "sandbox" as const,
    apiKey: "api-key",
    secretKey: "secret-key",
    baseUrl: "https://sandbox-api.iyzipay.com",
    callbackUrl: "https://example.com/callback",
    webhookSecret: "webhook-secret",
  };

  it("rejects invalid signatures before retrieving results or mutating attempts", async () => {
    const strapiInstance = makeStrapi();
    const checkoutClient = { retrieveCheckoutFormResult: vi.fn() };
    const rawPayload = JSON.stringify({ token: "checkout-token", iyziEventId: "evt_1" });

    await expect(
      handleWebhookEvent(
        { rawPayload, signature: "invalid" },
        { strapiInstance, checkoutClient: checkoutClient as any, loadConfig: () => config },
      ),
    ).resolves.toMatchObject({ accepted: false, reason: "invalid_signature" });

    expect(checkoutClient.retrieveCheckoutFormResult).not.toHaveBeenCalled();
    expect(strapiInstance.__queries.paymentAttempt.update).not.toHaveBeenCalled();
    expect(strapiInstance.__queries.providerEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "rejected",
          signatureValid: false,
          failureReason: "invalid_signature",
        }),
      }),
    );
  });

  it("accepts valid signatures and finalizes the retrieved provider result", async () => {
    const strapiInstance = makeStrapi();
    const rawPayload = JSON.stringify({ token: "checkout-token", iyziEventId: "evt_1" });
    const signature = createIyzicoWebhookSignature(rawPayload, "webhook-secret");
    const checkoutClient = {
      retrieveCheckoutFormResult: vi.fn().mockResolvedValue({
        provider: "iyzico",
        providerToken: "checkout-token",
        status: "paid",
        paymentId: "payment-id",
      }),
    };

    await expect(
      handleWebhookEvent(
        { rawPayload, signature },
        { strapiInstance, checkoutClient: checkoutClient as any, loadConfig: () => config },
      ),
    ).resolves.toMatchObject({ accepted: true, status: "paid" });

    expect(checkoutClient.retrieveCheckoutFormResult).toHaveBeenCalledWith("checkout-token");
    expect(strapiInstance.__queries.paymentAttempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "paid" }),
      }),
    );
  });
});
