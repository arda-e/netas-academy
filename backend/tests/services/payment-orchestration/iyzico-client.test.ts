import { describe, expect, it, vi } from "vitest";

import { createIyzicoCheckoutClient } from "../../../src/services/payment-orchestration/iyzico/client";
import type { IyzicoConfig } from "../../../src/services/payment-orchestration/iyzico/config";

const CONFIG: IyzicoConfig = {
  environment: "sandbox",
  apiKey: "api-key",
  secretKey: "secret-key",
  baseUrl: "https://sandbox-api.iyzipay.com",
  callbackUrl: "https://example.com/callback",
  webhookSecret: "webhook-secret",
};

describe("iyzico CheckoutForm client", () => {
  it("maps initialize response into a provider-neutral frontend handoff", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        status: "success",
        token: "checkout-token",
        checkoutFormContent: "<script>provider</script>",
        paymentPageUrl: "https://sandbox-provider.example/pay",
      }),
    });
    const client = createIyzicoCheckoutClient(CONFIG, {
      fetchImpl,
      randomId: () => "random-key",
      now: () => new Date("2026-06-30T12:00:00.000Z"),
    });

    await expect(
      client.initializeCheckoutForm({
        attemptReference: "pay_123",
        conversationId: "pay_123",
        amountMinor: 125000,
        currency: "TRY",
        basketId: "registration:42",
        title: "Demo Event",
        callbackUrl: "https://example.com/callback",
        payer: { firstName: "Ada", lastName: "Kaya", email: "ada@example.com" },
      }),
    ).resolves.toMatchObject({
      token: "checkout-token",
      presentation: {
        kind: "iyzico_checkout_form",
        token: "checkout-token",
        checkoutFormContent: "<script>provider</script>",
        providerPageUrl: "https://sandbox-provider.example/pay",
      },
    });

    const [, init] = fetchImpl.mock.calls[0];
    expect(init.headers.Authorization).toMatch(/^IYZWSv2 /);
    expect(JSON.stringify(init)).not.toContain("secret-key");
  });

  it("normalizes retrieve results without returning API keys or secrets", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        status: "success",
        paymentStatus: "SUCCESS",
        paymentId: "payment-id",
        conversationId: "pay_123",
      }),
    });
    const client = createIyzicoCheckoutClient(CONFIG, { fetchImpl, randomId: () => "random-key" });

    const result = await client.retrieveCheckoutFormResult("checkout-token");

    expect(result).toMatchObject({
      provider: "iyzico",
      providerToken: "checkout-token",
      status: "paid",
      paymentId: "payment-id",
      conversationId: "pay_123",
    });
    expect(JSON.stringify(result)).not.toContain("secret-key");
    expect(JSON.stringify(result)).not.toContain("api-key");
  });
});
