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

  it("redirects callback requests to the frontend result page after finalization", async () => {
    handleCallbackResult.mockResolvedValue({
      attemptReference: "pay_123",
      status: "paid",
      duplicate: false,
    });
    const controller = await loadController();
    const ctx = {
      request: { body: { token: "checkout-token" } },
      query: {},
      status: 200,
      body: null,
      set: vi.fn(),
      redirect: vi.fn(),
    };

    await controller.iyzicoCallback(ctx);

    expect(handleCallbackResult).toHaveBeenCalledWith("checkout-token");
    expect(ctx.status).toBe(303);
    expect(ctx.redirect).toHaveBeenCalledWith(
      "http://localhost:3000/odeme-sonucu?attemptReference=pay_123&status=paid",
    );
    expect(ctx.set).toHaveBeenCalledWith(
      "Location",
      "http://localhost:3000/odeme-sonucu?attemptReference=pay_123&status=paid",
    );
    expect(ctx.body).toMatchObject({
      attemptReference: "pay_123",
      status: "paid",
      redirectUrl: "http://localhost:3000/odeme-sonucu?attemptReference=pay_123&status=paid",
    });
  });

  it("builds callback result redirects from the public frontend URL", async () => {
    const mod = await import("../../../src/api/payment-orchestration/controllers/payment-orchestration");

    expect(
      mod.buildPaymentResultRedirectUrl(
        { attemptReference: "pay_456", status: "failed", duplicate: true },
        {
          NEXT_PUBLIC_SITE_URL: "https://netasacademy.com/",
          FRONTEND_URL: "http://127.0.0.1:3000",
        } as NodeJS.ProcessEnv,
      ),
    ).toBe("https://netasacademy.com/odeme-sonucu?attemptReference=pay_456&status=failed&duplicate=true");
  });

  it("falls back to CLIENT_URL before the internal frontend URL", async () => {
    const mod = await import("../../../src/api/payment-orchestration/controllers/payment-orchestration");

    expect(
      mod.buildPaymentResultRedirectUrl(
        { attemptReference: "pay_789", status: "paid", duplicate: false },
        {
          CLIENT_URL: "https://new.netasacademy.com",
          FRONTEND_URL: "http://127.0.0.1:3000",
        } as NodeJS.ProcessEnv,
      ),
    ).toBe("https://new.netasacademy.com/odeme-sonucu?attemptReference=pay_789&status=paid");
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
