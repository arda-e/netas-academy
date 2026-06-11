import { buildPartnerSoapXml, buildSalesDocSoapXml, extractSoapReference, extractSoapStatus } from "./xml";
import type { SplCheckResult } from "./types";

type SapSoapAdapterInput = {
  endpoint: string;
  fullName: string;
  timeoutMs: number;
  soapAction?: string | null;
  fetchImpl?: typeof fetch;
};

const createManualReviewResult = (
  errorReason: string,
  rawResponse: string | null = null,
): SplCheckResult => ({
  provider: "sap_soap",
  decision: "manual_review",
  statusCode: null,
  rawResponse,
  errorReason,
});

function generatePartnerId(): string {
  const digits = "0123456789";
  let id = "";
  for (let i = 0; i < 10; i++) {
    id += digits[Math.floor(Math.random() * 10)];
  }
  return id;
}

async function postSoap({
  endpoint,
  xml,
  timeoutMs,
  soapAction,
  fetchImpl,
}: {
  endpoint: string;
  xml: string;
  timeoutMs: number;
  soapAction?: string | null;
  fetchImpl: typeof fetch;
}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        ...(soapAction ? { SOAPAction: soapAction } : {}),
      },
      body: xml,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Runs the two-call SAP GTS SPL check:
 *   1. ZNnGtsTransferPartner  — registers the partner (connection error → manual_review)
 *   2. ZNnGtsTransferSalesDoc — registers the sales doc; Status "10" = accepted
 *
 * Mirrors SplController.cs behaviour from the legacy Unity app.
 */
export async function runSapSoapSplCheck({
  endpoint,
  fullName,
  timeoutMs,
  soapAction,
  fetchImpl = fetch,
}: SapSoapAdapterInput): Promise<SplCheckResult> {
  const partnerId = generatePartnerId();
  const sentDate = new Date().toISOString().slice(0, 10); // yyyy-MM-dd

  // ── Call 1: ZNnGtsTransferPartner ─────────────────────────────────────────
  const partnerXml = buildPartnerSoapXml({ partnerId, fullName });

  try {
    const partnerRes = await postSoap({ endpoint, xml: partnerXml, timeoutMs, soapAction, fetchImpl });
    if (!partnerRes.ok) {
      return createManualReviewResult(`Partner SOAP failed with HTTP ${partnerRes.status}`);
    }
    // Legacy does not inspect the Partner response body — only checks for connection errors
  } catch (error) {
    return createManualReviewResult(
      error instanceof Error ? error.message : "Partner SOAP request failed",
    );
  }

  // ── Call 2: ZNnGtsTransferSalesDoc ────────────────────────────────────────
  const salesDocXml = buildSalesDocSoapXml({ partnerId, sentDate });

  let rawResponse: string;
  try {
    const salesDocRes = await postSoap({ endpoint, xml: salesDocXml, timeoutMs, soapAction, fetchImpl });
    rawResponse = await salesDocRes.text();

    if (!salesDocRes.ok) {
      const reference = extractSoapReference(rawResponse);
      return createManualReviewResult(
        reference
          ? `SalesDoc SOAP failed with HTTP ${salesDocRes.status} (${reference})`
          : `SalesDoc SOAP failed with HTTP ${salesDocRes.status}`,
        rawResponse,
      );
    }
  } catch (error) {
    return createManualReviewResult(
      error instanceof Error ? error.message : "SalesDoc SOAP request failed",
    );
  }

  const statusCode = extractSoapStatus(rawResponse);
  const reference = extractSoapReference(rawResponse);

  if (statusCode == null) {
    return createManualReviewResult(
      reference
        ? `SOAP response did not contain a Status value (${reference})`
        : "SOAP response did not contain a Status value",
      rawResponse,
    );
  }

  // SAP GTS status codes: 10 = clear, 20 = manual review, 30 = blacklisted
  if (statusCode === "30") {
    return { provider: "sap_soap", decision: "blocked", statusCode, rawResponse };
  }

  if (statusCode === "20") {
    return {
      provider: "sap_soap",
      decision: "manual_review",
      statusCode,
      rawResponse,
      errorReason: reference
        ? `Business status ${statusCode} (${reference})`
        : `Business status ${statusCode}`,
    };
  }

  return {
    provider: "sap_soap",
    decision: "clear",
    statusCode,
    rawResponse,
    errorReason: reference
      ? `Business status ${statusCode} (${reference})`
      : `Business status ${statusCode}`,
  };
}
