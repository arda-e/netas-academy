import { afterEach, describe, expect, it, vi } from "vitest";

import { runSapSoapSplCheck } from "../../../src/services/spl-check/sap-soap-adapter";

describe("sap-soap adapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("returns accepted when the SOAP response contains Status 10", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(`
        <soap:Envelope>
          <soap:Body>
            <Status>10</Status>
            <Reference>REF-10</Reference>
          </soap:Body>
        </soap:Envelope>
      `),
    });

    await expect(
      runSapSoapSplCheck({
        endpoint: "https://sap.example.test",
        requestXml: "<soap />",
        timeoutMs: 1000,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).resolves.toEqual({
      provider: "sap_soap",
      decision: "accepted",
      statusCode: "10",
      rawResponse: expect.stringContaining("<Status>10</Status>"),
    });
  });

  it("returns rejected when the SOAP response contains a business status other than 10", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue("<Status>42</Status>"),
    });

    await expect(
      runSapSoapSplCheck({
        endpoint: "https://sap.example.test",
        requestXml: "<soap />",
        timeoutMs: 1000,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).resolves.toEqual({
      provider: "sap_soap",
      decision: "rejected",
      statusCode: "42",
      rawResponse: "<Status>42</Status>",
      errorReason: "Business status 42",
    });
  });

  it("returns manual_review when the SOAP response cannot be parsed", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue("<soap:Envelope />"),
    });

    await expect(
      runSapSoapSplCheck({
        endpoint: "https://sap.example.test",
        requestXml: "<soap />",
        timeoutMs: 1000,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).resolves.toMatchObject({
      provider: "sap_soap",
      decision: "manual_review",
      statusCode: null,
      errorReason: "SOAP response did not contain a Status value",
    });
  });

  it("retries transient network failures before falling back to manual review", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network timeout"));

    await expect(
      runSapSoapSplCheck({
        endpoint: "https://sap.example.test",
        requestXml: "<soap />",
        timeoutMs: 1000,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).resolves.toMatchObject({
      provider: "sap_soap",
      decision: "manual_review",
      statusCode: null,
      errorReason: "network timeout",
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
