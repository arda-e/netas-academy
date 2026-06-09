import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runSapSoapSplCheck } from "../../../src/services/spl-check/sap-soap-adapter";

describe("sap-soap adapter — HTTP integration", () => {
  let handler: (req: IncomingMessage, res: ServerResponse) => void;
  let endpoint: string;

  const server = createServer((req, res) => handler(req, res));

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

  it("accepted: real fetch reaches the server; verifies POST, Content-Type, and Status 10", async () => {
    let receivedMethod: string | undefined;
    let receivedContentType: string | undefined;
    let receivedBody = "";

    handler = (req, res) => {
      receivedMethod = req.method;
      receivedContentType = req.headers["content-type"];
      req.on("data", (chunk: Buffer) => { receivedBody += chunk.toString(); });
      req.on("end", () => {
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end("<Status>10</Status>");
      });
    };

    const result = await runSapSoapSplCheck({
      endpoint,
      requestXml: "<soap />",
      timeoutMs: 2000,
    });

    expect(result).toMatchObject({ decision: "accepted", statusCode: "10" });
    expect(receivedMethod).toBe("POST");
    expect(receivedContentType).toContain("text/xml");
    expect(receivedBody.length).toBeGreaterThan(0);
  });

  it("rejected: server returns Status 42 → decision rejected, errorReason contains '42'", async () => {
    handler = (_req, res) => {
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end("<Status>42</Status>");
    };

    const result = await runSapSoapSplCheck({
      endpoint,
      requestXml: "<soap />",
      timeoutMs: 2000,
    });

    expect(result.decision).toBe("rejected");
    expect(result.statusCode).toBe("42");
    expect(result.errorReason).toContain("42");
  });

  it("HTTP error 500: decision manual_review, errorReason contains '500'", async () => {
    handler = (_req, res) => {
      res.writeHead(500);
      res.end("");
    };

    const result = await runSapSoapSplCheck({
      endpoint,
      requestXml: "<soap />",
      timeoutMs: 2000,
    });

    expect(result.decision).toBe("manual_review");
    expect(result.errorReason).toContain("500");
  });

  it("missing Status element: decision manual_review, errorReason contains 'did not contain a Status value'", async () => {
    handler = (_req, res) => {
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end("<soap:Envelope />");
    };

    const result = await runSapSoapSplCheck({
      endpoint,
      requestXml: "<soap />",
      timeoutMs: 2000,
    });

    expect(result.decision).toBe("manual_review");
    expect(result.errorReason).toContain("did not contain a Status value");
  });

  it("SOAPAction forwarded: server receives the SOAPAction header when provided", async () => {
    let receivedSoapAction: string | string[] | undefined;

    handler = (req, res) => {
      receivedSoapAction = req.headers["soapaction"];
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end("<Status>10</Status>");
    };

    await runSapSoapSplCheck({
      endpoint,
      requestXml: "<soap />",
      timeoutMs: 2000,
      soapAction: "test-action",
    });

    expect(receivedSoapAction).toBe("test-action");
  });
});
