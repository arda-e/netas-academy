import { XMLParser } from "fast-xml-parser";

const escapeXml = (value: string) =>
  value
    .split("&").join("&amp;")
    .split("<").join("&lt;")
    .split(">").join("&gt;")
    .split('"').join("&quot;")
    .split("'").join("&apos;");

/**
 * Build the ZNnGtsTransferPartner SOAP request body.
 * Mirrors SplController.cs SendSOAPRequest() partner envelope.
 */
export function buildPartnerSoapXml({ partnerId, fullName }: {
  partnerId: string;
  fullName: string;
}): string {
  return [
    "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:urn='urn:sap-com:document:sap:soap:functions:mc-style'>",
    "<soapenv:Header/>",
    "<soapenv:Body>",
    "<urn:ZNnGtsTransferPartner>",
    "<IsPartner>",
    `<PartnerId>${escapeXml(partnerId)}</PartnerId>`,
    `<Name1>${escapeXml(fullName)}</Name1>`,
    "<Name2></Name2>",
    "<Name3></Name3>",
    "<Name4></Name4>",
    "<Searchterm1></Searchterm1>",
    "<Street>N/A</Street>",
    "<StrSuppl1></StrSuppl1>",
    "<StrSuppl2></StrSuppl2>",
    "<StrSuppl3></StrSuppl3>",
    "<District></District>",
    "<City></City>",
    "<PostlCod1>34000</PostlCod1>",
    "<Country>TR</Country>",
    "<Taxnum1></Taxnum1>",
    "<Taxnum2></Taxnum2>",
    "<Telephone></Telephone>",
    "<TelephoneFax></TelephoneFax>",
    "<TelephoneMobile></TelephoneMobile>",
    "<Langu>T</Langu>",
    "<Type>M</Type>",
    "</IsPartner>",
    "</urn:ZNnGtsTransferPartner>",
    "</soapenv:Body>",
    "</soapenv:Envelope>",
  ].join("\n");
}

/**
 * Build the ZNnGtsTransferSalesDoc SOAP request body.
 * Mirrors SplController.cs PostSOAPRequest() sales doc envelope.
 */
export function buildSalesDocSoapXml({ partnerId, sentDate }: {
  partnerId: string;
  sentDate: string; // yyyy-MM-dd
}): string {
  return [
    "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:urn='urn:sap-com:document:sap:soap:functions:mc-style'>",
    "<soapenv:Header/>",
    "<soapenv:Body>",
    "<urn:ZNnGtsTransferSalesDoc>",
    "<IsHeader>",
    `<RefnoHeader>${escapeXml(partnerId)}</RefnoHeader>`,
    `<Refdat>${escapeXml(sentDate)}</Refdat>`,
    "<Ernam>TEST_USER</Ernam>",
    "<Aenam>TEST_USER2</Aenam>",
    "<Value>0.01</Value>",
    "<ValCurr>TRY</ValCurr>",
    "<DocumentType>NACD</DocumentType>",
    "</IsHeader>",
    "<ItItem>",
    "<item>",
    "<ItemNumber>10</ItemNumber>",
    "<ProductId>NTSACADEMY</ProductId>",
    "<Dimen>1</Dimen>",
    "<DimUom>ADT</DimUom>",
    "<Value>0.01</Value>",
    "<ValCurr>TRY</ValCurr>",
    "</item>",
    "</ItItem>",
    "<ItPartner>",
    "<item>",
    "<PartnerFunction>AG</PartnerFunction>",
    `<PartnerId>${escapeXml(partnerId)}</PartnerId>`,
    "<Country>TR</Country>",
    "</item>",
    "</ItPartner>",
    "</urn:ZNnGtsTransferSalesDoc>",
    "</soapenv:Body>",
    "</soapenv:Envelope>",
  ].join("\n");
}

const MAX_XML_SIZE = 1_000_000; // 1 MB

const soapXmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: false,
  isArray: () => false,
  processEntities: false,
  htmlEntities: false,
  ignoreDeclaration: true,
});

function logParseWarn(message: string, details?: Record<string, unknown>) {
  try {
    const s = (globalThis as Record<string, unknown>).strapi as { log?: { warn?: (msg: string, meta?: Record<string, unknown>) => void } } | undefined;
    s?.log?.warn?.(message, details);
  } catch {
    // strapi global not available (e.g., in isolated tests)
  }
}

const MAX_DEPTH = 20;

function findSoapElement(
  obj: Record<string, unknown>,
  localName: string,
  depth: number = 0,
): string | null {
  if (depth > MAX_DEPTH) return null;
  if (obj == null || typeof obj !== "object") return null;

  for (const key of Object.keys(obj)) {
    const lastColon = key.lastIndexOf(":");
    const keyLocal = lastColon >= 0 ? key.slice(lastColon + 1) : key;

    if (keyLocal.toLowerCase() === localName.toLowerCase()) {
      const value = obj[key];
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return String(value).trim();
      }
      if (typeof value === "object" && value !== null && "#text" in (value as Record<string, unknown>)) {
        return String((value as Record<string, unknown>)["#text"] ?? "").trim();
      }
      return null;
    }

    const nested = findSoapElement(obj[key] as Record<string, unknown>, localName, depth + 1);
    if (nested !== null) return nested;
  }

  return null;
}

export function extractSoapStatus(xml: string) {
  if (xml.length > MAX_XML_SIZE) {
    logParseWarn("SOAP XML exceeds maximum size, rejecting", { size: xml.length, maxSize: MAX_XML_SIZE });
    return null;
  }
  try {
    const parsed = soapXmlParser.parse(xml) as Record<string, unknown>;
    return findSoapElement(parsed, "Status");
  } catch (err) {
    logParseWarn("Failed to parse SOAP XML for Status extraction", { error: String(err), xmlPreview: xml.slice(0, 200) });
    return null;
  }
}

export function extractSoapReference(xml: string) {
  if (xml.length > MAX_XML_SIZE) {
    logParseWarn("SOAP XML exceeds maximum size, rejecting", { size: xml.length, maxSize: MAX_XML_SIZE });
    return null;
  }
  try {
    const parsed = soapXmlParser.parse(xml) as Record<string, unknown>;
    return findSoapElement(parsed, "Reference");
  } catch (err) {
    logParseWarn("Failed to parse SOAP XML for Reference extraction", { error: String(err), xmlPreview: xml.slice(0, 200) });
    return null;
  }
}
