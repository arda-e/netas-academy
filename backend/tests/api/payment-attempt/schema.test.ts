import { describe, expect, it } from "vitest";

import schema from "../../../src/api/payment-attempt/content-types/payment-attempt/schema.json";

describe("payment-attempt schema", () => {
  it("stores provider-neutral parent and retry identity", () => {
    expect(schema.kind).toBe("collectionType");
    expect(schema.collectionName).toBe("payment_attempts");
    expect(schema.attributes.attemptReference).toMatchObject({ type: "string", required: true, unique: true });
    expect(schema.attributes.parentType).toMatchObject({
      type: "enumeration",
      enum: ["registration", "course_application"],
      required: true,
    });
    expect(schema.attributes.parentEntityId).toMatchObject({ type: "integer", required: true });
    expect(schema.attributes.parentDocumentId).toMatchObject({ type: "string" });
    expect(schema.attributes.retryOfAttemptReference).toMatchObject({ type: "string" });
  });

  it("stores provider handoff state without provider secrets", () => {
    expect(schema.attributes.provider).toMatchObject({ type: "enumeration", enum: ["iyzico"], required: true });
    expect(schema.attributes.providerToken).toMatchObject({ type: "string" });
    expect(schema.attributes.providerConversationId).toMatchObject({ type: "string" });
    expect(schema.attributes.amountMinor).toMatchObject({ type: "integer", required: true });
    expect(schema.attributes.currency).toMatchObject({ type: "string", required: true, default: "TRY" });
    expect(schema.attributes.frontendPresentationSnapshot).toMatchObject({ type: "json" });
    expect(schema.attributes.providerSafeSnapshot).toMatchObject({ type: "json" });
  });

  it("supports the required attempt lifecycle statuses", () => {
    expect(schema.attributes.status).toMatchObject({
      type: "enumeration",
      enum: ["created", "checkout_created", "pending", "paid", "failed", "cancelled"],
      required: true,
      default: "created",
    });
    expect(schema.attributes.completedAt).toMatchObject({ type: "datetime" });
    expect(schema.attributes.failureReason).toMatchObject({ type: "text" });
  });
});
