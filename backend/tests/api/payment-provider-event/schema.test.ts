import { describe, expect, it } from "vitest";

import schema from "../../../src/api/payment-provider-event/content-types/payment-provider-event/schema.json";

describe("payment-provider-event schema", () => {
  it("stores idempotency identity for callbacks and webhooks", () => {
    expect(schema.kind).toBe("collectionType");
    expect(schema.collectionName).toBe("payment_provider_events");
    expect(schema.attributes.provider).toMatchObject({ type: "enumeration", enum: ["iyzico"], required: true });
    expect(schema.attributes.eventIdentity).toMatchObject({ type: "string", required: true, unique: true });
    expect(schema.attributes.eventType).toMatchObject({
      type: "enumeration",
      enum: ["callback", "webhook"],
      required: true,
    });
  });

  it("records signature status and sanitized provider payloads", () => {
    expect(schema.attributes.attemptReference).toMatchObject({ type: "string" });
    expect(schema.attributes.providerToken).toMatchObject({ type: "string" });
    expect(schema.attributes.status).toMatchObject({
      type: "enumeration",
      enum: ["accepted", "rejected", "duplicate"],
      required: true,
    });
    expect(schema.attributes.signatureValid).toMatchObject({ type: "boolean", required: true, default: false });
    expect(schema.attributes.signatureMetadata).toMatchObject({ type: "json" });
    expect(schema.attributes.providerSafePayload).toMatchObject({ type: "json" });
    expect(schema.attributes.processedAt).toMatchObject({ type: "datetime" });
    expect(schema.attributes.failureReason).toMatchObject({ type: "text" });
  });
});
