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

export function extractSoapStatus(xml: string) {
  const statusMatch = xml.match(/<(?:\w+:)?Status>([^<]*)<\/(?:\w+:)?Status>/i);

  if (statusMatch?.[1] != null) {
    return statusMatch[1].trim();
  }

  return null;
}

export function extractSoapReference(xml: string) {
  const referenceMatch = xml.match(/<(?:\w+:)?Reference>([^<]*)<\/(?:\w+:)?Reference>/i);

  if (referenceMatch?.[1] != null) {
    return referenceMatch[1].trim();
  }

  return null;
}
