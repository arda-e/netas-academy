import { afterEach, describe, expect, it, vi } from "vitest";

import { runSapSoapSplCheck } from "../../../src/services/spl-check/sap-soap-adapter";

// Helper: build a mock fetch that returns responses in order (one per call)
const mockFetch = (...responses: Array<{ ok: boolean; status: number; body: string }>) => {
  const fns = responses.map(({ ok, status, body }) =>
    vi.fn().mockResolvedValue({
      ok,
      status,
      text: vi.fn().mockResolvedValue(body),
    }),
  );
  let call = 0;
  return vi.fn().mockImplementation(() => fns[Math.min(call++, fns.length - 1)]());
};

const ok = (body: string) => ({ ok: true, status: 200, body });
const err = (status: number, body = "") => ({ ok: false, status, body });

describe("sap-soap adapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("returns blocked when SalesDoc response contains Status 10", async () => {
    const fetchImpl = mockFetch(ok(""), ok("<Status>10</Status><Reference>REF-10</Reference>"));

    await expect(
      runSapSoapSplCheck({ endpoint: "https://sap.example.test", fullName: "Arda Eren", timeoutMs: 1000, fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).resolves.toEqual({
      provider: "sap_soap",
      decision: "blocked",
      statusCode: "10",
      rawResponse: expect.stringContaining("<Status>10</Status>"),
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("sends Partner call first, then SalesDoc call", async () => {
    const fetchImpl = mockFetch(ok(""), ok("<Status>10</Status>"));

    await runSapSoapSplCheck({ endpoint: "https://sap.example.test", fullName: "Test User", timeoutMs: 1000, fetchImpl: fetchImpl as unknown as typeof fetch });

    const [, partnerOpts] = fetchImpl.mock.calls[0] as [string, RequestInit];
    const [, salesDocOpts] = fetchImpl.mock.calls[1] as [string, RequestInit];

    expect(String(partnerOpts.body)).toContain("ZNnGtsTransferPartner");
    expect(String(salesDocOpts.body)).toContain("ZNnGtsTransferSalesDoc");
  });

  it("both calls use the same partnerId", async () => {
    const fetchImpl = mockFetch(ok(""), ok("<Status>10</Status>"));

    await runSapSoapSplCheck({ endpoint: "https://sap.example.test", fullName: "Test User", timeoutMs: 1000, fetchImpl: fetchImpl as unknown as typeof fetch });

    const partnerBody = String((fetchImpl.mock.calls[0] as [string, RequestInit])[1].body);
    const salesDocBody = String((fetchImpl.mock.calls[1] as [string, RequestInit])[1].body);

    const partnerIdMatch = partnerBody.match(/<PartnerId>(\d{10})<\/PartnerId>/);
    const refnoMatch = salesDocBody.match(/<RefnoHeader>(\d{10})<\/RefnoHeader>/);

    expect(partnerIdMatch).not.toBeNull();
    expect(refnoMatch).not.toBeNull();
    expect(partnerIdMatch![1]).toBe(refnoMatch![1]);
  });

  it("returns clear when SalesDoc response contains a business status other than 10", async () => {
    const fetchImpl = mockFetch(ok(""), ok("<Status>42</Status>"));

    await expect(
      runSapSoapSplCheck({ endpoint: "https://sap.example.test", fullName: "Test User", timeoutMs: 1000, fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).resolves.toEqual({
      provider: "sap_soap",
      decision: "clear",
      statusCode: "42",
      rawResponse: "<Status>42</Status>",
      errorReason: "Business status 42",
    });
  });

  it("returns manual_review when SalesDoc response has no Status element", async () => {
    const fetchImpl = mockFetch(ok(""), ok("<soapenv:Envelope />"));

    await expect(
      runSapSoapSplCheck({ endpoint: "https://sap.example.test", fullName: "Test User", timeoutMs: 1000, fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).resolves.toMatchObject({
      provider: "sap_soap",
      decision: "manual_review",
      statusCode: null,
      errorReason: "SOAP response did not contain a Status value",
    });
  });

  it("returns manual_review immediately when Partner call fails with a network error", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network timeout"));

    await expect(
      runSapSoapSplCheck({ endpoint: "https://sap.example.test", fullName: "Test User", timeoutMs: 1000, fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).resolves.toMatchObject({
      provider: "sap_soap",
      decision: "manual_review",
      errorReason: "network timeout",
    });

    // Only the Partner call was attempted
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("returns manual_review when Partner call returns HTTP error", async () => {
    const fetchImpl = mockFetch(err(500));

    await expect(
      runSapSoapSplCheck({ endpoint: "https://sap.example.test", fullName: "Test User", timeoutMs: 1000, fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).resolves.toMatchObject({
      provider: "sap_soap",
      decision: "manual_review",
      errorReason: expect.stringContaining("500"),
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("returns manual_review when SalesDoc call fails with a network error", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 200, text: vi.fn().mockResolvedValue("") })
      .mockRejectedValueOnce(new Error("connection refused"));

    await expect(
      runSapSoapSplCheck({ endpoint: "https://sap.example.test", fullName: "Test User", timeoutMs: 1000, fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).resolves.toMatchObject({
      provider: "sap_soap",
      decision: "manual_review",
      errorReason: "connection refused",
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("returns manual_review when SalesDoc call returns HTTP error", async () => {
    const fetchImpl = mockFetch(ok(""), err(403, "<Reference>ACCESS-DENIED</Reference>"));

    const result = await runSapSoapSplCheck({ endpoint: "https://sap.example.test", fullName: "Test User", timeoutMs: 1000, fetchImpl: fetchImpl as unknown as typeof fetch });

    expect(result.decision).toBe("manual_review");
    expect(result.errorReason).toContain("403");
    expect(result.errorReason).toContain("ACCESS-DENIED");
  });

  it("includes Reference in errorReason when SalesDoc clear response contains a Reference element", async () => {
    const fetchImpl = mockFetch(ok(""), ok("<Status>88</Status><Reference>REF-88</Reference>"));

    const result = await runSapSoapSplCheck({ endpoint: "https://sap.example.test", fullName: "Test User", timeoutMs: 1000, fetchImpl: fetchImpl as unknown as typeof fetch });

    expect(result.decision).toBe("clear");
    expect(result.statusCode).toBe("88");
    expect(result.errorReason).toContain("REF-88");
  });

  it("does not include SOAPAction header when soapAction is not provided", async () => {
    const fetchImpl = mockFetch(ok(""), ok("<Status>10</Status>"));

    await runSapSoapSplCheck({ endpoint: "https://sap.example.test", fullName: "Test User", timeoutMs: 1000, fetchImpl: fetchImpl as unknown as typeof fetch });

    for (const call of fetchImpl.mock.calls) {
      const [, options] = call as [string, RequestInit];
      expect(options.headers).not.toHaveProperty("SOAPAction");
    }
  });

  it("includes SOAPAction header on both calls when soapAction is provided", async () => {
    const fetchImpl = mockFetch(ok(""), ok("<Status>10</Status>"));

    await runSapSoapSplCheck({ endpoint: "https://sap.example.test", fullName: "Test User", timeoutMs: 1000, soapAction: "test-action", fetchImpl: fetchImpl as unknown as typeof fetch });

    for (const call of fetchImpl.mock.calls) {
      const [, options] = call as [string, RequestInit];
      expect((options.headers as Record<string, string>)["SOAPAction"]).toBe("test-action");
    }
  });
});
