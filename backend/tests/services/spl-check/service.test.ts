import { afterEach, describe, expect, it, vi } from "vitest";

import { runSplCheck } from "../../../src/services/spl-check/service";
import { loadSplCheckConfig } from "../../../src/services/spl-check/config";

const REQUEST = {
  applicationNumber: "CA-20260424-AB12CD",
  firstName: "Ada",
  lastName: "Kaya",
  email: "ada@example.com",
  phone: "+90 555 111 2233",
  tckn: "12345678901",
  courseDocumentId: "course_123",
};

const CONFIG = {
  endpoint: "https://sap.example.test",
  timeoutMs: 1000,
  soapAction: "check-application",
};

describe("spl-check service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("makes two SAP SOAP calls (Partner then SalesDoc) and returns blocked on Status 10", async () => {
    let call = 0;
    const fetchImpl = vi.fn().mockImplementation(() => {
      call++;
      return Promise.resolve({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(call === 1 ? "" : "<Status>10</Status>"),
      });
    });

    const result = await runSplCheck(REQUEST, { config: CONFIG, fetchImpl: fetchImpl as unknown as typeof fetch });

    expect(result).toEqual({
      provider: "sap_soap",
      decision: "blocked",
      statusCode: "10",
      rawResponse: "<Status>10</Status>",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);

    const [, partnerOpts] = fetchImpl.mock.calls[0] as [string, RequestInit];
    const [, salesDocOpts] = fetchImpl.mock.calls[1] as [string, RequestInit];
    expect(String(partnerOpts.body)).toContain("ZNnGtsTransferPartner");
    expect(String(partnerOpts.body)).toContain("<Name1>Ada Kaya</Name1>");
    expect(String(salesDocOpts.body)).toContain("ZNnGtsTransferSalesDoc");
    expect((partnerOpts.headers as Record<string, string>)["SOAPAction"]).toBe("check-application");
  });

  it("combines firstName and lastName into Name1", async () => {
    let call = 0;
    const fetchImpl = vi.fn().mockImplementation(() => {
      call++;
      return Promise.resolve({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(call === 1 ? "" : "<Status>10</Status>"),
      });
    });

    await runSplCheck({ ...REQUEST, firstName: "Fatma", lastName: "Yılmaz" }, { config: CONFIG, fetchImpl: fetchImpl as unknown as typeof fetch });

    const [, opts] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(String(opts.body)).toContain("<Name1>Fatma Yılmaz</Name1>");
  });

  it("falls back to manual review when the Partner network request rejects", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("timeout"));

    await expect(
      runSplCheck(REQUEST, { config: CONFIG, fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).resolves.toMatchObject({
      provider: "sap_soap",
      decision: "manual_review",
      statusCode: null,
      errorReason: "timeout",
    });

    // Only the Partner call was attempted
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("falls back to manual review when SPL configuration is missing", async () => {
    vi.stubEnv("SPL_CHECK_ENDPOINT", "");
    vi.stubEnv("SAP_SOAP_ENDPOINT", "");

    await expect(runSplCheck(REQUEST)).resolves.toEqual({
      provider: "sap_soap",
      decision: "manual_review",
      statusCode: null,
      rawResponse: null,
      errorReason: "SPL check endpoint is not configured",
    });
  });

  it("uses SAP_SOAP_ENDPOINT as fallback when SPL_CHECK_ENDPOINT is empty", () => {
    vi.stubEnv("SPL_CHECK_ENDPOINT", "");
    vi.stubEnv("SAP_SOAP_ENDPOINT", "https://sap.example.com");

    const config = loadSplCheckConfig(process.env);
    expect(config.endpoint).toBe("https://sap.example.com");
  });

  it("reads SPL_CHECK_TIMEOUT_MS and returns it as a number", () => {
    vi.stubEnv("SPL_CHECK_ENDPOINT", "https://sap.example.com");
    vi.stubEnv("SPL_CHECK_TIMEOUT_MS", "5000");

    const config = loadSplCheckConfig(process.env);
    expect(config.timeoutMs).toBe(5000);
  });

  it("forwards SPL_CHECK_SOAP_ACTION as the SOAPAction header on both fetch calls", async () => {
    vi.stubEnv("SPL_CHECK_ENDPOINT", "https://sap.example.com");
    vi.stubEnv("SPL_CHECK_SOAP_ACTION", "MySoapAction");

    let call = 0;
    const fetchImpl = vi.fn().mockImplementation(() => {
      call++;
      return Promise.resolve({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(call === 1 ? "" : "<Status>10</Status>"),
      });
    });

    await runSplCheck(REQUEST, { fetchImpl: fetchImpl as unknown as typeof fetch });

    for (const fetchCall of fetchImpl.mock.calls) {
      const [, options] = fetchCall as [string, RequestInit];
      expect((options.headers as Record<string, string>)["SOAPAction"]).toBe("MySoapAction");
    }
  });
});
