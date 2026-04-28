import { XMLParser } from "fast-xml-parser";
import type { SplCheckRequest } from "./types";

const escapeXml = (value: string) =>
  value
    .split("&")
    .join("&amp;")
    .split("<")
    .join("&lt;")
    .split(">")
    .join("&gt;")
    .split('"')
    .join("&quot;")
    .split("'")
    .join("&apos;");

export function buildSplCheckRequestXml(request: SplCheckRequest) {
  const parts = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:spl="https://netas.academy/spl-check">',
    "  <soap:Body>",
    "    <spl:CheckApplication>",
    `      <spl:ApplicationNumber>${escapeXml(request.applicationNumber)}</spl:ApplicationNumber>`,
    `      <spl:CourseDocumentId>${escapeXml(request.courseDocumentId)}</spl:CourseDocumentId>`,
    `      <spl:FirstName>${escapeXml(request.firstName)}</spl:FirstName>`,
    `      <spl:LastName>${escapeXml(request.lastName ?? "")}</spl:LastName>`,
    `      <spl:Email>${escapeXml(request.email)}</spl:Email>`,
    `      <spl:Phone>${escapeXml(request.phone ?? "")}</spl:Phone>`,
    `      <spl:Tckn>${escapeXml(request.tckn)}</spl:Tckn>`,
    "    </spl:CheckApplication>",
    "  </soap:Body>",
    "</soap:Envelope>",
  ];

  return parts.join("\n");
}

const soapXmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: false,
  isArray: () => false, // treat all non-array XML elements as objects
});

/**
 * Deep-search a parsed SOAP XML object for a named element,
 * matching regardless of namespace prefix.
 *
 * Handles nested SOAP envelopes, CDATA, and attribute-bearing elements
 * that the previous regex-based extraction could not process.
 */
function findSoapElement(
  obj: Record<string, unknown>,
  localName: string,
): string | null {
  if (obj == null || typeof obj !== "object") return null;

  for (const key of Object.keys(obj)) {
    // Match local name after optional namespace prefix (e.g. "ns:Status" or "Status")
    const lastColon = key.lastIndexOf(":");
    const keyLocal = lastColon >= 0 ? key.slice(lastColon + 1) : key;

    if (keyLocal.toLowerCase() === localName.toLowerCase()) {
      const value = obj[key];
      if (typeof value === "string") return value.trim();
      // fast-xml-parser may nest text under "#text" for mixed content/CDATA
      if (typeof value === "object" && value !== null && "#text" in (value as Record<string, unknown>)) {
        return String((value as Record<string, unknown>)["#text"] ?? "").trim();
      }
      return null;
    }

    // Recurse into nested objects (handle SOAP Body → Response → element nesting)
    const nested = findSoapElement(obj[key] as Record<string, unknown>, localName);
    if (nested !== null) return nested;
  }

  return null;
}

export function extractSoapStatus(xml: string) {
  try {
    const parsed = soapXmlParser.parse(xml) as Record<string, unknown>;
    return findSoapElement(parsed, "Status");
  } catch {
    return null;
  }
}

export function extractSoapReference(xml: string) {
  try {
    const parsed = soapXmlParser.parse(xml) as Record<string, unknown>;
    return findSoapElement(parsed, "Reference");
  } catch {
    return null;
  }
}
