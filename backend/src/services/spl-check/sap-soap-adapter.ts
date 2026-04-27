import { extractSoapReference, extractSoapStatus } from "./xml";
import type { SplCheckResult } from "./types";

type SapSoapAdapterInput = {
  endpoint: string;
  requestXml: string;
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

export async function runSapSoapSplCheck({
  endpoint,
  requestXml,
  timeoutMs,
  soapAction,
  fetchImpl = fetch,
}: SapSoapAdapterInput): Promise<SplCheckResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        ...(soapAction ? { SOAPAction: soapAction } : {}),
      },
      body: requestXml,
      signal: controller.signal,
    });

    const rawResponse = await response.text();
    const reference = extractSoapReference(rawResponse);
    const statusCode = extractSoapStatus(rawResponse);

    if (!response.ok) {
      return createManualReviewResult(
        reference ? `SOAP request failed with HTTP ${response.status} (${reference})` : `SOAP request failed with HTTP ${response.status}`,
        rawResponse,
      );
    }

    if (statusCode == null) {
      return createManualReviewResult(
        reference ? `SOAP response did not contain a Status value (${reference})` : "SOAP response did not contain a Status value",
        rawResponse,
      );
    }

    if (statusCode === "10") {
      return {
        provider: "sap_soap",
        decision: "accepted",
        statusCode,
        rawResponse,
      };
    }

    return {
      provider: "sap_soap",
      decision: "rejected",
      statusCode,
      rawResponse,
      errorReason: reference ? `Business status ${statusCode} (${reference})` : `Business status ${statusCode}`,
    };
  } catch (error) {
    return createManualReviewResult(error instanceof Error ? error.message : "SOAP request failed");
  } finally {
    clearTimeout(timeoutId);
  }
}

