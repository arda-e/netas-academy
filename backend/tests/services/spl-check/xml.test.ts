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
});

