import { describe, expect, it } from "vitest";

import { loadIyzicoConfig, resolveIyzicoEnvironment } from "../../../src/services/payment-orchestration/iyzico/config";

const BASE_ENV = {
  IYZICO_API_KEY: "sandbox-key",
  IYZICO_SECRET_KEY: "sandbox-secret",
  IYZICO_CALLBACK_URL: "https://example.com/api/payments/iyzico/callback",
};

describe("iyzico config", () => {
  it("defaults to sandbox environment and sandbox base URL", () => {
    expect(resolveIyzicoEnvironment(undefined)).toBe("sandbox");

    expect(loadIyzicoConfig(BASE_ENV)).toMatchObject({
      environment: "sandbox",
      baseUrl: "https://sandbox-api.iyzipay.com",
      callbackUrl: "https://example.com/api/payments/iyzico/callback",
    });
  });

  it("uses live base URL only when explicitly configured", () => {
    expect(loadIyzicoConfig({ ...BASE_ENV, IYZICO_ENVIRONMENT: "live" })).toMatchObject({
      environment: "live",
      baseUrl: "https://api.iyzipay.com",
    });
  });

  it("throws a normalized configuration error without secret values", () => {
    expect(() => loadIyzicoConfig({ IYZICO_API_KEY: "", IYZICO_SECRET_KEY: "top-secret" })).toThrow(
      "IYZICO_API_KEY is required",
    );

    try {
      loadIyzicoConfig({ IYZICO_API_KEY: "api-key", IYZICO_SECRET_KEY: "", IYZICO_CALLBACK_URL: "" });
    } catch (error) {
      expect(String(error)).not.toContain("api-key");
      expect(String(error)).not.toContain("top-secret");
    }
  });
});
