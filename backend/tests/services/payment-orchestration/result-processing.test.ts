import { describe, expect, it, vi } from "vitest";

import { finalizeAttemptFromProviderResult } from "../../../src/services/payment-orchestration/service";

describe("payment result processing idempotency", () => {
  function makeStrapi() {
    const paymentAttempt = {
      findOne: vi.fn().mockResolvedValue({
        id: 10,
        attemptReference: "pay_123",
        parentType: "registration",
        parentEntityId: 42,
        parentDocumentId: "reg_doc",
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
      __queries: { paymentAttempt, providerEvent },
    };
  }

  it("callback-first success followed by duplicate webhook does not complete the parent twice", async () => {
    const strapiInstance = makeStrapi();
    const completeParent = vi.fn().mockResolvedValue({ completed: true });

    await finalizeAttemptFromProviderResult(
      { provider: "iyzico", providerToken: "checkout-token", status: "paid", paymentId: "payment-id" },
      "callback",
      "iyzico:event:payment-id",
      { strapiInstance, completeParent },
    );

    strapiInstance.__queries.providerEvent.findOne.mockResolvedValue({ id: 20, eventIdentity: "iyzico:event:payment-id" });
    strapiInstance.__queries.paymentAttempt.findOne.mockResolvedValue({
      id: 10,
      attemptReference: "pay_123",
      parentType: "registration",
      parentEntityId: 42,
      parentDocumentId: "reg_doc",
      status: "paid",
    });

    await finalizeAttemptFromProviderResult(
      { provider: "iyzico", providerToken: "checkout-token", status: "paid", paymentId: "payment-id" },
      "webhook",
      "iyzico:event:payment-id",
      { strapiInstance, completeParent },
    );

    expect(completeParent).toHaveBeenCalledTimes(1);
    expect(strapiInstance.__queries.paymentAttempt.update).toHaveBeenCalledTimes(1);
  });

  it("failed payment leaves the parent retryable and does not call completion", async () => {
    const strapiInstance = makeStrapi();
    const completeParent = vi.fn();

    await expect(
      finalizeAttemptFromProviderResult(
        {
          provider: "iyzico",
          providerToken: "checkout-token",
          status: "failed",
          failureReason: "insufficient_funds",
        },
        "callback",
        "iyzico:event:failed",
        { strapiInstance, completeParent },
      ),
    ).resolves.toMatchObject({ status: "failed" });

    expect(strapiInstance.__queries.paymentAttempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "failed",
          failureReason: "insufficient_funds",
        }),
      }),
    );
    expect(completeParent).not.toHaveBeenCalled();
  });
});
