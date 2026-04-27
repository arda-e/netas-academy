import { afterEach, describe, expect, it, vi } from "vitest";

import { runSplCheck } from "../../../src/services/spl-check/service";

describe("spl-check service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("calls the adapter with a built SOAP payload", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue("<Status>10</Status>"),
    });

    const result = await runSplCheck(
      {
        applicationNumber: "CA-20260424-AB12CD",
        firstName: "Ada",
        lastName: "Kaya",
        email: "ada@example.com",
        phone: "+90 555 111 2233",
        tckn: "12345678901",
        courseDocumentId: "course_123",
      },
      {
        config: {
          endpoint: "https://sap.example.test",
          timeoutMs: 1000,
          soapAction: "check-application",
        },
        fetchImpl: fetchImpl as unknown as typeof fetch,
      },
    );

    expect(result).toEqual({
      provider: "sap_soap",
      decision: "accepted",
      statusCode: "10",
      rawResponse: "<Status>10</Status>",
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://sap.example.test",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: "check-application",
        }),
        body: expect.stringContaining("<spl:ApplicationNumber>CA-20260424-AB12CD</spl:ApplicationNumber>"),
      }),
    );
  });

  it("falls back to manual review when the network request rejects", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("timeout"));

    await expect(
      runSplCheck(
        {
          applicationNumber: "CA-20260424-AB12CD",
          firstName: "Ada",
          lastName: "Kaya",
          email: "ada@example.com",
          phone: "+90 555 111 2233",
          tckn: "12345678901",
          courseDocumentId: "course_123",
        },
        {
          config: {
            endpoint: "https://sap.example.test",
            timeoutMs: 1000,
          },
          fetchImpl: fetchImpl as unknown as typeof fetch,
        },
      ),
    ).resolves.toMatchObject({
      provider: "sap_soap",
      decision: "manual_review",
      statusCode: null,
      errorReason: "timeout",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("falls back to manual review when SPL configuration is missing", async () => {
    vi.stubEnv("SPL_CHECK_ENDPOINT", "");
    vi.stubEnv("SAP_SOAP_ENDPOINT", "");

    await expect(
      runSplCheck({
        applicationNumber: "CA-20260424-AB12CD",
        firstName: "Ada",
        lastName: "Kaya",
        email: "ada@example.com",
        phone: "+90 555 111 2233",
        tckn: "12345678901",
        courseDocumentId: "course_123",
      }),
    ).resolves.toEqual({
      provider: "sap_soap",
      decision: "manual_review",
      statusCode: null,
      rawResponse: null,
      errorReason: "SPL check endpoint is not configured",
    });
  });
});
