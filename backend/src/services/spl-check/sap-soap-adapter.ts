import { extractSoapReference, extractSoapStatus } from "./xml";
import type { SplCheckResult } from "./types";

type SapSoapAdapterInput = {
  endpoint: string;
  requestXml: string;
  timeoutMs: number;
  soapAction?: string | null;
  fetchImpl?: typeof fetch;
  maxAttempts?: number;
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
  maxAttempts = 2,
}: SapSoapAdapterInput): Promise<SplCheckResult> {
  const attemptCount = Math.max(1, maxAttempts);
  let lastError: unknown = null;

for (let attempt = 0; attempt < attemptCount; attempt += 1) {
    // Exponential backoff before retries (skip first attempt)
    if (attempt > 0) {
      const delay = Math.min(Math.pow(2, attempt) * 1000, 16000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

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
      lastError = error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return createManualReviewResult(lastError instanceof Error ? lastError.message : "SOAP request failed");
}
