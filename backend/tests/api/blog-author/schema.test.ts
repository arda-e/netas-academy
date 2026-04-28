import { describe, expect, it } from "vitest";
import schema from "../../../src/api/blog-author/content-types/blog-author/schema.json";

describe("blog-author schema", () => {
  it("has correct kind", () => {
    expect(schema.kind).toBe("collectionType");
  });

  it("has draftAndPublish enabled", () => {
    expect(schema.options.draftAndPublish).toBe(true);
  });

  it("requires displayName and slug", () => {
    expect(schema.attributes.displayName).toEqual({
      type: "string",
      required: true,
    });
    expect(schema.attributes.slug).toEqual({
      type: "uid",
      required: true,
    });
  });

  it("has role and shortBio as optional fields", () => {
    expect(schema.attributes.role).toEqual({
      type: "string",
    });
    expect(schema.attributes.shortBio).toEqual({
      type: "text",
    });
  });
});
