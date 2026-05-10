import { describe, expect, it } from "vitest";

import { buildSplCheckRequestXml, extractSoapReference, extractSoapStatus } from "../../../src/services/spl-check/xml";

describe("spl-check xml helpers", () => {
  it("builds a SOAP payload with escaped fields", () => {
    const xml = buildSplCheckRequestXml({
      applicationNumber: "CA-1",
      firstName: "Ada & Ayla",
      lastName: "Kaya <Demo>",
      email: "ada@example.com",
      phone: "+90 555 111 2233",
      tckn: "12345678901",
      courseDocumentId: "course_123",
    });

    expect(xml).toContain("<spl:ApplicationNumber>CA-1</spl:ApplicationNumber>");
    expect(xml).toContain("<spl:FirstName>Ada &amp; Ayla</spl:FirstName>");
    expect(xml).toContain("<spl:LastName>Kaya &lt;Demo&gt;</spl:LastName>");
  });

  it("extracts a SOAP status and reference from namespaced XML", () => {
    const xml = `
      <soap:Envelope>
        <soap:Body>
          <spl:CheckApplicationResponse>
            <spl:Reference>REF-123</spl:Reference>
            <Status>10</Status>
          </spl:CheckApplicationResponse>
        </soap:Body>
      </soap:Envelope>
    `;

    expect(extractSoapReference(xml)).toBe("REF-123");
    expect(extractSoapStatus(xml)).toBe("10");
  });

  it("rejects oversized XML", () => {
    const oversized = `${"x".repeat(1_000_001)}`;

    expect(extractSoapStatus(oversized)).toBeNull();
    expect(extractSoapReference(oversized)).toBeNull();
  });

  it("returns null for deeply nested XML beyond depth limit", () => {
    let xml = `<soap:Envelope><soap:Body><spl:Response>`;
    for (let i = 0; i < 50; i++) {
      xml += `<spl:Nest${i}>`;
    }
    xml += `<Status>10</Status>`;
    for (let i = 0; i < 50; i++) {
      xml += `</spl:Nest${i}>`;
    }
    xml += `</spl:Response></soap:Body></soap:Envelope>`;

    const result = extractSoapStatus(xml);
    expect(result).toBeNull();
  });

  it("handles entity-like characters in content safely", () => {
    const xml = `
      <soap:Envelope>
        <soap:Body>
          <spl:CheckApplicationResponse>
            <spl:Reference>TEST &amp; CO</spl:Reference>
            <Status>&lt;success&gt;</Status>
          </spl:CheckApplicationResponse>
        </soap:Body>
      </soap:Envelope>
    `;

    expect(extractSoapReference(xml)).toBe("TEST &amp; CO");
    expect(extractSoapStatus(xml)).toBe("&lt;success&gt;");
  });

  it("extracts values from CDATA sections", () => {
    const xml = `
      <soap:Envelope>
        <soap:Body>
          <spl:CheckApplicationResponse>
            <spl:Reference><![CDATA[REF-456]]></spl:Reference>
            <Status><![CDATA[10]]></Status>
          </spl:CheckApplicationResponse>
        </soap:Body>
      </soap:Envelope>
    `;

    expect(extractSoapReference(xml)).toBe("REF-456");
    expect(extractSoapStatus(xml)).toBe("10");
  });

  it("handles deeply nested CDATA with namespace prefixes", () => {
    const xml = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <ns2:Response xmlns:ns2="urn:custom">
            <ns2:Result>
              <ns2:Status><![CDATA[accepted]]></ns2:Status>
              <ns2:Reference><![CDATA[NESTED-REF-789]]></ns2:Reference>
            </ns2:Result>
          </ns2:Response>
        </soap:Body>
      </soap:Envelope>
    `;

    expect(extractSoapStatus(xml)).toBe("accepted");
    expect(extractSoapReference(xml)).toBe("NESTED-REF-789");
  });
});

