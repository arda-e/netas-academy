import { describe, expect, it } from "vitest";

import {
  buildPartnerSoapXml,
  buildSalesDocSoapXml,
  extractSoapReference,
  extractSoapStatus,
} from "../../../src/services/spl-check/xml";

describe("spl-check xml helpers", () => {
  describe("buildPartnerSoapXml", () => {
    it("contains the correct SAP operation name", () => {
      const xml = buildPartnerSoapXml({ partnerId: "1234567890", fullName: "Arda Eren" });
      expect(xml).toContain("ZNnGtsTransferPartner");
      expect(xml).toContain("urn:sap-com:document:sap:soap:functions:mc-style");
    });

    it("includes PartnerId and Name1 with correct values", () => {
      const xml = buildPartnerSoapXml({ partnerId: "9876543210", fullName: "Ada Kaya" });
      expect(xml).toContain("<PartnerId>9876543210</PartnerId>");
      expect(xml).toContain("<Name1>Ada Kaya</Name1>");
    });

    it("escapes XML special characters in fullName", () => {
      const xml = buildPartnerSoapXml({ partnerId: "0000000001", fullName: "Ada & Ayla <Test>" });
      expect(xml).toContain("<Name1>Ada &amp; Ayla &lt;Test&gt;</Name1>");
    });

    it("includes fixed SAP fields: PostlCod1=34000, Country=TR, Langu=T, Type=M", () => {
      const xml = buildPartnerSoapXml({ partnerId: "0000000001", fullName: "Test" });
      expect(xml).toContain("<PostlCod1>34000</PostlCod1>");
      expect(xml).toContain("<Country>TR</Country>");
      expect(xml).toContain("<Langu>T</Langu>");
      expect(xml).toContain("<Type>M</Type>");
    });
  });

  describe("buildSalesDocSoapXml", () => {
    it("contains the correct SAP operation name", () => {
      const xml = buildSalesDocSoapXml({ partnerId: "1234567890", sentDate: "2026-06-10" });
      expect(xml).toContain("ZNnGtsTransferSalesDoc");
    });

    it("uses the same partnerId as RefnoHeader and in ItPartner", () => {
      const xml = buildSalesDocSoapXml({ partnerId: "5555555555", sentDate: "2026-06-10" });
      expect(xml).toContain("<RefnoHeader>5555555555</RefnoHeader>");
      expect(xml).toContain("<PartnerId>5555555555</PartnerId>");
    });

    it("includes fixed SAP fields: DocumentType=NACD, ProductId=NTSACADEMY", () => {
      const xml = buildSalesDocSoapXml({ partnerId: "0000000001", sentDate: "2026-06-10" });
      expect(xml).toContain("<DocumentType>NACD</DocumentType>");
      expect(xml).toContain("<ProductId>NTSACADEMY</ProductId>");
    });

    it("includes sentDate as Refdat", () => {
      const xml = buildSalesDocSoapXml({ partnerId: "0000000001", sentDate: "2026-01-15" });
      expect(xml).toContain("<Refdat>2026-01-15</Refdat>");
    });
  });

  describe("extractSoapStatus / extractSoapReference", () => {
    it("extracts Status and Reference from namespaced XML", () => {
      const xml = `
        <soap:Envelope>
          <soap:Body>
            <urn:ZNnGtsTransferSalesDocResponse>
              <Reference>REF-123</Reference>
              <Status>10</Status>
            </urn:ZNnGtsTransferSalesDocResponse>
          </soap:Body>
        </soap:Envelope>
      `;
      expect(extractSoapStatus(xml)).toBe("10");
      expect(extractSoapReference(xml)).toBe("REF-123");
    });

    it("rejects oversized XML", () => {
      const oversized = "x".repeat(1_000_001);
      expect(extractSoapStatus(oversized)).toBeNull();
      expect(extractSoapReference(oversized)).toBeNull();
    });

    it("returns null for deeply nested XML beyond depth limit", () => {
      let xml = `<soap:Envelope><soap:Body><urn:Response>`;
      for (let i = 0; i < 50; i++) xml += `<Nest${i}>`;
      xml += `<Status>10</Status>`;
      for (let i = 0; i < 50; i++) xml += `</Nest${i}>`;
      xml += `</urn:Response></soap:Body></soap:Envelope>`;
      expect(extractSoapStatus(xml)).toBeNull();
    });

    it("handles entity-like characters in content safely", () => {
      const xml = `
        <soap:Envelope>
          <soap:Body>
            <Reference>TEST &amp; CO</Reference>
            <Status>&lt;success&gt;</Status>
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
            <Reference><![CDATA[REF-456]]></Reference>
            <Status><![CDATA[10]]></Status>
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
});
