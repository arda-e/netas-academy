import { describe, expect, it } from "vitest";
import schema from "../../../src/api/blog-post/content-types/blog-post/schema.json";

describe("blog-post schema", () => {
  it("has correct kind", () => {
    expect(schema.kind).toBe("collectionType");
  });

  it("has draftAndPublish enabled", () => {
    expect(schema.options.draftAndPublish).toBe(true);
  });

  it("has required string fields (title, slug)", () => {
    expect(schema.attributes.title).toEqual({
      type: "string",
      required: true,
    });
    expect(schema.attributes.slug).toMatchObject({
      type: "uid",
      required: true,
    });
    expect(schema.attributes.slug.targetField).toBe("title");
  });

  it("has required datetime field (publishedDate)", () => {
    expect(schema.attributes.publishedDate).toEqual({
      type: "datetime",
      required: true,
    });
  });

  it("has optional text fields (excerpt, sourceNotes)", () => {
    expect(schema.attributes.excerpt).toEqual({
      type: "text",
    });
    expect(schema.attributes.sourceNotes).toEqual({
      type: "text",
    });
  });

  it("has richtext field (content)", () => {
    expect(schema.attributes.content).toEqual({
      type: "richtext",
    });
  });

  it("has media field (coverImage) with multiple: false", () => {
    expect(schema.attributes.coverImage).toEqual({
      type: "media",
      multiple: false,
      allowedTypes: ["images"],
    });
  });

  it("has relation field (author) with manyToOne to blog-author", () => {
    expect(schema.attributes.author).toEqual({
      type: "relation",
      relation: "manyToOne",
      target: "api::blog-author.blog-author",
    });
  });
});
