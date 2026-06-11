import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runSapSoapSplCheck } from "../../../src/services/spl-check/sap-soap-adapter";

describe("sap-soap adapter — HTTP integration", () => {
  let handler: (req: IncomingMessage, res: ServerResponse) => void;
  let endpoint: string;
  let requestBodies: string[];
  let requestCount: number;

  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
    req.on("end", () => {
      requestBodies.push(body);
      requestCount++;
      handler(req, res);
    });
  });

  beforeAll(
    () =>
      new Promise<void>((resolve) => {
        server.listen(0, "127.0.0.1", () => {
          const addr = server.address() as { port: number };
          endpoint = `http://127.0.0.1:${addr.port}`;
          resolve();
        });
      }),
  );

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  beforeEach(() => {
    requestBodies = [];
    requestCount = 0;
  });

  it("blocked: Sinan İnan — Status 30 (kara liste) → decision blocked", async () => {
    // Partner returns OK (body irrelevant), SalesDoc returns Status 30
    let call = 0;
    handler = (_req, res) => {
      call++;
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(call === 1 ? "" : "<Status>30</Status>");
    };

    const result = await runSapSoapSplCheck({ endpoint, fullName: "Sinan İnan", timeoutMs: 2000 });

    expect(result).toMatchObject({ decision: "blocked", statusCode: "30" });
    expect(requestCount).toBe(2);
    expect(requestBodies[0]).toContain("ZNnGtsTransferPartner");
    expect(requestBodies[0]).toContain("<Name1>Sinan İnan</Name1>");
    expect(requestBodies[1]).toContain("ZNnGtsTransferSalesDoc");
  });

  it("clear: Status 10 (tertemiz) → decision clear", async () => {
    let call = 0;
    handler = (_req, res) => {
      call++;
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(call === 1 ? "" : "<Status>10</Status>");
    };

    const result = await runSapSoapSplCheck({ endpoint, fullName: "Test User", timeoutMs: 2000 });

    expect(result).toMatchObject({ decision: "clear", statusCode: "10" });
  });

  it("manual_review: Status 20 → decision manual_review", async () => {
    let call = 0;
    handler = (_req, res) => {
      call++;
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(call === 1 ? "" : "<Status>20</Status>");
    };

    const result = await runSapSoapSplCheck({ endpoint, fullName: "Test User", timeoutMs: 2000 });

    expect(result).toMatchObject({ decision: "manual_review", statusCode: "20" });
  });

  it("both calls use the same 10-digit partnerId", async () => {
    let call = 0;
    handler = (_req, res) => {
      call++;
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(call === 1 ? "" : "<Status>30</Status>");
    };

    await runSapSoapSplCheck({ endpoint, fullName: "Test User", timeoutMs: 2000 });

    const partnerIdMatch = requestBodies[0].match(/<PartnerId>(\d{10})<\/PartnerId>/);
    const refnoMatch = requestBodies[1].match(/<RefnoHeader>(\d{10})<\/RefnoHeader>/);

    expect(partnerIdMatch).not.toBeNull();
    expect(refnoMatch).not.toBeNull();
    expect(partnerIdMatch![1]).toBe(refnoMatch![1]);
  });

  it("clear: SalesDoc returns Status 42 → decision clear", async () => {
    let call = 0;
    handler = (_req, res) => {
      call++;
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(call === 1 ? "" : "<Status>42</Status>");
    };

    const result = await runSapSoapSplCheck({ endpoint, fullName: "Test User", timeoutMs: 2000 });

    expect(result.decision).toBe("clear");
    expect(result.statusCode).toBe("42");
  });

  it("Partner HTTP 500 → manual_review, only one request made", async () => {
    handler = (_req, res) => {
      res.writeHead(500);
      res.end("");
    };

    const result = await runSapSoapSplCheck({ endpoint, fullName: "Test User", timeoutMs: 2000 });

    expect(result.decision).toBe("manual_review");
    expect(result.errorReason).toContain("500");
    expect(requestCount).toBe(1);
  });

  it("SalesDoc missing Status element → manual_review", async () => {
    let call = 0;
    handler = (_req, res) => {
      call++;
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(call === 1 ? "" : "<soapenv:Envelope />");
    };

    const result = await runSapSoapSplCheck({ endpoint, fullName: "Test User", timeoutMs: 2000 });

    expect(result.decision).toBe("manual_review");
    expect(result.errorReason).toContain("did not contain a Status value");
  });

  it("SOAPAction forwarded on both calls when provided", async () => {
    const receivedSoapActions: Array<string | undefined> = [];
    let call = 0;

    handler = (req, res) => {
      call++;
      receivedSoapActions.push(req.headers["soapaction"] as string | undefined);
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(call === 1 ? "" : "<Status>30</Status>");
    };

    await runSapSoapSplCheck({ endpoint, fullName: "Test User", timeoutMs: 2000, soapAction: "test-action" });

    expect(receivedSoapActions[0]).toBe("test-action");
    expect(receivedSoapActions[1]).toBe("test-action");
  });
});
