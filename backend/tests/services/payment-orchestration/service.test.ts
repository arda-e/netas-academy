import { describe, expect, it, vi } from "vitest";

import {
  buildAttemptCallbackUrl,
  createCheckoutHandoff,
  finalizeAttemptFromProviderResult,
  retryCheckoutHandoff,
} from "../../../src/services/payment-orchestration/service";

describe("payment orchestration service", () => {
  function makeStrapi(overrides: Record<string, unknown> = {}) {
    const paymentAttempt = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 10, attemptReference: "pay_fixed" }),
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
      log: { error: vi.fn() },
      service: vi.fn(),
      __queries: { paymentAttempt, providerEvent },
      ...overrides,
    };
  }

  const baseInput = {
    parent: { parentType: "registration" as const, parentEntityId: 42, parentDocumentId: "reg_doc" },
    amountMinor: 125000,
    currency: "TRY",
    payer: { firstName: "Ada", lastName: "Kaya", email: "ada@example.com" },
    title: "Paid event",
    idempotencyKey: "registration:42",
  };

  it("adds the payment attempt reference to the iyzico callback URL", () => {
    expect(
      buildAttemptCallbackUrl("https://api.netasacademy.com/api/payments/iyzico/callback", "pay_123"),
    ).toBe("https://api.netasacademy.com/api/payments/iyzico/callback?attemptReference=pay_123");

    expect(
      buildAttemptCallbackUrl("https://api.netasacademy.com/api/payments/iyzico/callback?source=checkout", "pay_456"),
    ).toBe("https://api.netasacademy.com/api/payments/iyzico/callback?source=checkout&attemptReference=pay_456");
  });

  it("persists an attempt before provider initialization and returns a neutral handoff", async () => {
    const strapiInstance = makeStrapi();
    const checkoutClient = {
      initializeCheckoutForm: vi.fn().mockResolvedValue({
        token: "checkout-token",
        presentation: {
          kind: "iyzico_checkout_form",
          token: "checkout-token",
          checkoutFormContent: "<script>checkout</script>",
        },
        providerSafeSnapshot: { status: "success" },
      }),
      retrieveCheckoutFormResult: vi.fn(),
    };

    await expect(
      createCheckoutHandoff(baseInput, {
        strapiInstance,
        checkoutClient,
        randomId: () => "fixed-random-id-000000000000",
        loadConfig: () => ({
          environment: "sandbox",
          apiKey: "key",
          secretKey: "secret",
          baseUrl: "https://sandbox-api.iyzipay.com",
          callbackUrl: "https://example.com/callback",
          webhookSecret: "webhook-secret",
        }),
      }),
    ).resolves.toMatchObject({
      attemptReference: "pay_fixedrandomid00000000000",
      status: "checkout_created",
      provider: "iyzico",
      presentation: { kind: "iyzico_checkout_form", token: "checkout-token" },
    });

    expect(strapiInstance.__queries.paymentAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          attemptReference: "pay_fixedrandomid00000000000",
          parentType: "registration",
          parentEntityId: 42,
          status: "created",
        }),
      }),
    );
    expect(strapiInstance.__queries.paymentAttempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "checkout_created",
          providerToken: "checkout-token",
        }),
      }),
    );
    expect(checkoutClient.initializeCheckoutForm).toHaveBeenCalledWith(
      expect.objectContaining({
        callbackUrl:
          "https://example.com/callback?attemptReference=pay_fixedrandomid00000000000",
      }),
    );
  });

  it("creates a fresh checkout token instead of replaying a previous checkout presentation", async () => {
    const strapiInstance = makeStrapi();
    strapiInstance.__queries.paymentAttempt.findOne.mockResolvedValue({
      id: 9,
      attemptReference: "pay_old",
      status: "checkout_created",
      frontendPresentationSnapshot: {
        kind: "iyzico_checkout_form",
        token: "old-token",
        checkoutFormContent: "<script>old checkout</script>",
      },
    });
    const checkoutClient = {
      initializeCheckoutForm: vi.fn().mockResolvedValue({
        token: "fresh-token",
        presentation: {
          kind: "iyzico_checkout_form",
          token: "fresh-token",
          checkoutFormContent: "<script>fresh checkout</script>",
        },
        providerSafeSnapshot: { status: "success" },
      }),
      retrieveCheckoutFormResult: vi.fn(),
    };

    await expect(
      createCheckoutHandoff(baseInput, {
        strapiInstance,
        checkoutClient,
        randomId: () => "fresh-random-id-000000000000",
        loadConfig: () => ({
          environment: "sandbox",
          apiKey: "key",
          secretKey: "secret",
          baseUrl: "https://sandbox-api.iyzipay.com",
          callbackUrl: "https://example.com/callback",
          webhookSecret: "webhook-secret",
        }),
      }),
    ).resolves.toMatchObject({
      attemptReference: "pay_freshrandomid00000000000",
      status: "checkout_created",
      presentation: {
        token: "fresh-token",
        checkoutFormContent: "<script>fresh checkout</script>",
      },
    });

    expect(checkoutClient.initializeCheckoutForm).toHaveBeenCalledTimes(1);
    expect(strapiInstance.__queries.paymentAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          attemptReference: "pay_freshrandomid00000000000",
          idempotencyKey: "registration:42",
          status: "created",
        }),
      }),
    );
  });

  it("marks the attempt failed and returns payment_unavailable when provider initialization fails", async () => {
    const strapiInstance = makeStrapi();
    const checkoutClient = {
      initializeCheckoutForm: vi.fn().mockRejectedValue(new Error("provider down")),
      retrieveCheckoutFormResult: vi.fn(),
    };

    await expect(
      createCheckoutHandoff(baseInput, {
        strapiInstance,
        checkoutClient,
        randomId: () => "fixed-random-id-000000000000",
        loadConfig: () => ({
          environment: "sandbox",
          apiKey: "key",
          secretKey: "secret",
          baseUrl: "https://sandbox-api.iyzipay.com",
          callbackUrl: "https://example.com/callback",
          webhookSecret: "webhook-secret",
        }),
      }),
    ).resolves.toMatchObject({
      status: "payment_unavailable",
      error: { code: "payment_unavailable" },
    });

    expect(strapiInstance.__queries.paymentAttempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "failed",
          failureReason: "provider down",
        }),
      }),
    );
  });

  it("rejects retry for an already paid attempt", async () => {
    const strapiInstance = makeStrapi();
    strapiInstance.__queries.paymentAttempt.findOne.mockResolvedValue({
      attemptReference: "pay_paid",
      status: "paid",
    });

    await expect(retryCheckoutHandoff("pay_paid", { strapiInstance })).rejects.toThrow("payment_attempt_already_paid");
  });

  it("finalizes paid attempts once and invokes the parent completion hook", async () => {
    const strapiInstance = makeStrapi();
    strapiInstance.__queries.paymentAttempt.findOne.mockResolvedValue({
      id: 10,
      attemptReference: "pay_123",
      parentType: "registration",
      parentEntityId: 42,
      parentDocumentId: "reg_doc",
      status: "checkout_created",
    });
    const completeParent = vi.fn().mockResolvedValue({ completed: true });

    await expect(
      finalizeAttemptFromProviderResult(
        {
          provider: "iyzico",
          providerToken: "checkout-token",
          status: "paid",
          paymentId: "payment-id",
        },
        "callback",
        "iyzico:callback:checkout-token:payment-id",
        { strapiInstance, completeParent },
      ),
    ).resolves.toMatchObject({ status: "paid", duplicate: false });

    expect(strapiInstance.__queries.providerEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventIdentity: "iyzico:callback:checkout-token:payment-id",
          status: "accepted",
        }),
      }),
    );
    expect(completeParent).toHaveBeenCalledTimes(1);
  });
});
