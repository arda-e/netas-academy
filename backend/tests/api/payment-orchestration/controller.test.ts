import { beforeEach, describe, expect, it, vi } from "vitest";

const retryCheckoutHandoff = vi.fn();
const handleCallbackResult = vi.fn();
const handleWebhookEvent = vi.fn();

vi.mock("../../../src/services/payment-orchestration/service", () => ({
  retryCheckoutHandoff: (...args: unknown[]) => retryCheckoutHandoff(...args),
  handleCallbackResult: (...args: unknown[]) => handleCallbackResult(...args),
  handleWebhookEvent: (...args: unknown[]) => handleWebhookEvent(...args),
}));

describe("payment orchestration controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function loadController() {
    const mod = await import("../../../src/api/payment-orchestration/controllers/payment-orchestration");
    return mod.default;
  }

  it("passes retry attempts through the shared service", async () => {
    retryCheckoutHandoff.mockResolvedValue({ attemptReference: "pay_123", status: "checkout_created" });
    const controller = await loadController();
    const ctx = { params: { attemptReference: "pay_123" }, body: null };

    await controller.retry(ctx);

    expect(retryCheckoutHandoff).toHaveBeenCalledWith("pay_123");
    expect(ctx.body).toEqual({ attemptReference: "pay_123", status: "checkout_created" });
  });

  it("rejects callback requests without a token", async () => {
    const controller = await loadController();
    const ctx = { request: { body: {} }, query: {}, status: 200, body: null };

    await controller.iyzicoCallback(ctx);

    expect(ctx.status).toBe(400);
    expect(handleCallbackResult).not.toHaveBeenCalled();
  });

  it("uses the webhook signature header and sets status from service acceptance", async () => {
    handleWebhookEvent.mockResolvedValue({ accepted: false, reason: "invalid_signature" });
    const controller = await loadController();
    const ctx = {
      request: {
        rawBody: "{\"token\":\"checkout-token\"}",
        body: { token: "checkout-token" },
        headers: { "x-iyzi-signature": "signature" },
      },
      status: 200,
      body: null,
    };

    await controller.iyzicoWebhook(ctx);

    expect(handleWebhookEvent).toHaveBeenCalledWith({
      rawPayload: "{\"token\":\"checkout-token\"}",
      signature: "signature",
      keyId: undefined,
    });
    expect(ctx.status).toBe(400);
  });
});
